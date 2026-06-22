# Auth Security Review

**Last audited:** 2026-05-26
**Scope:** NextAuth v5 + Prisma authentication layer. Excludes concerns NextAuth handles automatically (CSRF, cookie flags, OAuth state, JWT signing).

---

## Findings

### CRITICAL

_No critical findings._

---

### HIGH

#### H1. No rate limiting on any auth endpoint

- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`, `src/app/api/auth/delete-account/route.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **What:** There is no rate-limiting middleware, no per-IP throttle, and no per-account lockout on any of the six auth-related endpoints. A grep for `rateLimit`, `Ratelimit`, `@upstash/ratelimit`, `express-rate-limit`, `next-rate-limit`, and `limiter` across the entire `src/` tree returned zero matches. NextAuth does not provide rate limiting. This leaves the Credentials sign-in path open to credential-stuffing and brute-force attacks, the forgot-password path open to email-spam abuse (an attacker can enumerate accounts or flood a target's inbox), and the reset-password path open to token-grinding (64 hex chars is strong entropy individually, but with no throttle an attacker with DB read access gains nothing — the real risk is targeted spam).
- **Risk:** An unauthenticated attacker can make unlimited POST requests to `/api/auth/register` to bulk-create throwaway accounts, to `/api/auth/forgot-password` to spam a victim's inbox or confirm account existence, and to the NextAuth Credentials endpoint to brute-force weak passwords. Change-password is session-gated but there is no lockout after repeated wrong-current-password attempts.
- **Fix:** Add a thin rate-limit layer. The lowest-friction option for a Next.js + Neon deployment is `@upstash/ratelimit` with `@upstash/redis` (sliding window, e.g. 5 requests / 15 minutes per IP on forgot-password; 10 / hour on register; 5 / 10 minutes on sign-in). Alternatively, a `middleware.ts` file using the `next` runtime can apply limits before the route handler runs. At minimum, prioritize the forgot-password and Credentials sign-in endpoints.

---

### MEDIUM

#### M1. Forgot-password leaks account existence via distinct HTTP status code

- **File:** `src/app/api/auth/forgot-password/route.ts:39–44`
- **What:** When the submitted email is not found in the database, the handler returns `{ success: false, error: "No account found with that email." }` with HTTP 404. When the email exists, it proceeds and ultimately returns HTTP 200. An attacker can silently enumerate which email addresses have registered accounts by submitting addresses and comparing status codes — no brute-force required, just a single request per address.

```ts
// line 39
if (!user) {
  return NextResponse.json(
    { success: false, error: "No account found with that email." },
    { status: 404 },
  );
}
```

- **Risk:** Account enumeration. An attacker learns which emails are registered, enabling targeted phishing, credential-stuffing lists, or harassment. Severity is bounded because this requires one request per address rather than sustained access.
- **Fix:** Return HTTP 200 with a generic message regardless of whether the email exists: `"If an account with that email exists, a reset link has been sent."` Do not return 404. Perform the DB lookup but always respond identically. OWASP Forgot Password Cheat Sheet explicitly requires this pattern.

#### M2. JWT strategy with no mechanism to invalidate sessions after password change

- **File:** `src/auth.ts:22`, `src/app/api/auth/change-password/route.ts`
- **What:** The application uses `session: { strategy: "jwt" }` (confirmed at `src/auth.ts:22`). When a user changes their password via `/api/auth/change-password`, the route successfully updates the hash in the database (`route.ts:69–73`) but does nothing to invalidate existing JWT session tokens. There is no `passwordChangedAt` field on the `User` model (`prisma/schema.prisma:14–32`), no JWT callback that cross-checks the token's issued-at time against a stored timestamp, and no "sign out everywhere" mechanism. The UI even acknowledges this explicitly: `"You'll stay signed in on this device."` (`ChangePasswordForm.tsx:49`). If a JWT is stolen (e.g., via XSS or a compromised device), changing the password does not revoke it.
- **Risk:** An attacker holding a stolen JWT can continue to authenticate and access the account for the remainder of the token's validity window after the victim changes their password. The threat is real if the session max-age is long (NextAuth v5 default is 30 days).
- **Fix:** Two options: (a) Switch to `strategy: "database"` — session tokens are stored in the `Session` table and can be deleted on password change. (b) If keeping JWT, add a `passwordChangedAt DateTime` column to `User`, stamp it on every password change, embed it in the JWT payload via the `jwt` callback, and reject tokens whose embedded timestamp predates the current `passwordChangedAt` value in the `session` callback. Option (a) is simpler given the existing Prisma adapter setup.

#### M3. Email-verification tokens stored in plaintext in the shared VerificationToken table

- **File:** `src/app/api/auth/register/route.ts:68–78`, `prisma/schema.prisma:146–152`
- **What:** The raw 64-hex-character token produced by `randomBytes(32).toString("hex")` is stored directly in the `VerificationToken.token` column without hashing. The same applies to password-reset tokens (`src/app/api/auth/forgot-password/route.ts:49–52`). If the database is read by an attacker (SQL injection elsewhere, misconfigured DB ACLs, leaked backup), all unexpired tokens are immediately usable.
- **Risk:** An attacker with read access to the database can extract any active verification or reset token and use it to verify an arbitrary account's email or reset any user's password. This is a defense-in-depth gap rather than a primary vulnerability because DB access is already highly privileged, and tokens expire in 24 hours.
- **Fix:** Store a SHA-256 hash of the token in the database (e.g., `crypto.createHash('sha256').update(token).digest('hex')`); send the raw token in the email link; on consumption, hash the incoming token and look up by hash. This follows the same model as server-side session token storage.

---

### LOW

#### L1. Register endpoint reveals existing accounts via distinct error message and 409 status

- **File:** `src/app/api/auth/register/route.ts:47–51`
- **What:** If the email is already registered, the endpoint returns HTTP 409 with `"A user with this email already exists"`. This is distinct from a successful registration (HTTP 201) and allows an unauthenticated requester to confirm whether a given email has an account, one request at a time.

```ts
if (existing) {
  return NextResponse.json(
    { success: false, error: "A user with this email already exists" },
    { status: 409 },
  );
}
```

- **Risk:** Account enumeration at registration. Lower severity than the forgot-password case (M1) because an attacker would naturally attempt to register with an email to see if it bounces — this is a well-known limitation of any registration flow. The 409 vs. 201 distinction makes it trivially automatable.
- **Fix:** This is a deliberate UX trade-off. The most privacy-preserving response is to always return HTTP 200 with a message like "If this email is not already registered, your account has been created" and send a "someone tried to register with your email" notification to existing users. In practice, many reputable services (GitHub, Google) still return a visible "email taken" error. Evaluate against your threat model; flag as acceptable if enumeration risk is tolerable.

---

### INFO

#### I1. Verify-email page uses the same VerificationToken table as password-reset but does not filter by prefix — currently harmless, worth hardening

- **File:** `src/app/(auth)/verify-email/page.tsx:15–33`
- **What:** The verify-email page fetches a token with `prisma.verificationToken.findUnique({ where: { token } })` and does not check that `record.identifier` is a bare email (i.e., does not start with `reset:`). The reset-password handler (`src/app/api/auth/reset-password/route.ts:42`) correctly enforces `record.identifier.startsWith(PASSWORD_RESET_TOKEN_PREFIX)`, so a password-reset token cannot be used to reset a password via the verify-email path. However, if a password-reset token were submitted to the verify-email endpoint, the code would proceed to `prisma.user.update({ where: { email: "reset:user@example.com" } })`, which would simply be a no-op (no user with that email exists) and then delete the token. Net effect: the reset token is burned with no harm done. This is not exploitable today, but the defensive prefix check that exists on the reset path is absent here.
- **Risk:** No exploitable impact in the current schema. The risk would only materialize if a future code path introduced a user whose email happened to begin with `reset:`.
- **Fix:** Add a guard at the top of the verify-email consume path: `if (record.identifier.startsWith(PASSWORD_RESET_TOKEN_PREFIX)) redirect("/sign-in?verify_error=invalid")`. Mirrors the existing defense in the reset handler.

#### I2. Change-password success leaves the current device signed in — no "sign out all other sessions" option

- **File:** `src/components/profile/ChangePasswordForm.tsx:49`, `src/app/api/auth/change-password/route.ts`
- **What:** The UI explicitly tells users "You'll stay signed in on this device." There is no opt-in to revoke other sessions. This is a deliberate UX choice, but note it compounds finding M2: if the JWT strategy is kept and `passwordChangedAt` is not implemented, other devices/stolen tokens are never invalidated.
- **Risk:** Low in isolation; elevated in combination with M2.
- **Fix:** Considered resolved if M2 is addressed. If JWT strategy is retained without a `passwordChangedAt` mechanism, consider offering a "Sign out all other sessions" button in the profile UI.

---

## Passed Checks

- Passwords hashed with `bcrypt.hash(password, 12)` on registration (`src/app/api/auth/register/route.ts:54`), password reset (`src/app/api/auth/reset-password/route.ts:61`), and change-password (`src/app/api/auth/change-password/route.ts:69`). Cost factor 12 meets current OWASP guidance (minimum 10, 12 recommended for new systems).
- Bcrypt algorithm in use (`bcryptjs@3.0.3`) — not SHA, MD5, or plaintext. (`package.json:26`)
- Reset tokens generated with `randomBytes(32).toString("hex")` — 256 bits of entropy (`src/app/api/auth/forgot-password/route.ts:49`).
- Email verification tokens generated with `randomBytes(32).toString("hex")` — 256 bits of entropy (`src/app/api/auth/register/route.ts:68`). `Math.random` is not used anywhere in the auth layer.
- Reset tokens are single-use: deleted after successful consumption (`src/app/api/auth/reset-password/route.ts:64`).
- Email-verification tokens are single-use: deleted after successful consumption (`src/app/(auth)/verify-email/page.tsx:33`).
- Token expiry enforced on both consume paths: `record.expires < new Date()` checked before acting (`src/app/api/auth/reset-password/route.ts:49`; `src/app/(auth)/verify-email/page.tsx:23`).
- Expired tokens are cleaned up from the database on access (`src/app/api/auth/reset-password/route.ts:50`; `src/app/(auth)/verify-email/page.tsx:24`).
- Old tokens deleted before issuing a new reset token, preventing token accumulation (`src/app/api/auth/forgot-password/route.ts:47`; `src/app/api/auth/register/route.ts:71–73`).
- Password-reset tokens use a namespaced identifier prefix (`"reset:"` defined in `src/lib/constants.ts:3`) that is enforced on consumption, preventing email-verification tokens from being accepted on the reset-password path (`src/app/api/auth/reset-password/route.ts:42`).
- Change-password endpoint verifies the session server-side via `await auth()` and returns 401 on absence (`src/app/api/auth/change-password/route.ts:20–25`).
- Delete-account endpoint verifies the session server-side via `await auth()` and returns 401 on absence (`src/app/api/auth/delete-account/route.ts:13–18`).
- Both mutation endpoints use `session.user.id` from the server-side session to identify the user — no client-supplied user ID is trusted (`src/app/api/auth/change-password/route.ts:47–49`; `src/app/api/auth/delete-account/route.ts:62`).
- No mass-assignment: Prisma `data` fields are explicitly named on all routes; no `...parsedBody` spread into Prisma calls anywhere in the auth layer.
- Change-password requires current password verification before accepting a new one (`src/app/api/auth/change-password/route.ts:61–67`) — re-authentication enforced for this sensitive operation.
- Delete-account requires the user to type their email address as a confirmation step, verified server-side against `session.user.email` (`src/app/api/auth/delete-account/route.ts:39–47`).
- Zod validation applied on all request bodies: register (`src/app/api/auth/register/route.ts:9–19`), forgot-password (`src/app/api/auth/forgot-password/route.ts:11–13`), reset-password (`src/app/api/auth/reset-password/route.ts:8–17`), change-password (`src/app/api/auth/change-password/route.ts:8–17`), delete-account (`src/app/api/auth/delete-account/route.ts:8–10`).
- Profile page (`src/app/profile/page.tsx:21–25`) enforces authentication server-side via `await auth()` and redirects unauthenticated users before rendering any user data.
- No plain passwords logged or included in any API response body — `console.log`/`console.error`/`console.warn` grep across `src/app/api/auth/` returned zero matches.
- Credentials `authorize` callback uses `bcrypt.compare` (timing-safe at the bcrypt level) and returns a uniform `null` for both "user not found" and "wrong password" paths (`src/auth.ts:48–51`), avoiding different error messages at the NextAuth layer for invalid credentials.
- `select` projection used on `prisma.user.findUnique` in change-password to avoid fetching unnecessary fields (`src/app/api/auth/change-password/route.ts:48–50`).
- `select` projection used in profile page to avoid returning the password hash to the client render tree (`src/app/profile/page.tsx:29–36`), though `hasPassword` boolean is derived server-side.

---

## Methodology

**Files read in full:**
- `prisma/schema.prisma`
- `src/auth.ts`
- `src/auth.config.ts`
- `src/lib/constants.ts`
- `src/lib/email.ts`
- `src/lib/prisma.ts` (via Glob — no auth-specific logic)
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/delete-account/route.ts`
- `src/app/(auth)/verify-email/page.tsx`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/profile/page.tsx`
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/profile/ChangePasswordForm.tsx`
- `src/components/profile/DeleteAccountDialog.tsx`
- `package.json`

**Grep queries run with zero matches (negative findings):**
- `rateLimit|Ratelimit|rate-limit|upstash|express-rate-limit|next-rate-limit|limiter` across `src/` — confirmed no rate-limiting library in use.
- `Math\.random` across `src/` — confirmed no weak randomness in token generation.
- `console\.log|console\.error|console\.warn` across `src/app/api/auth/` — confirmed no credential logging.
- `passwordChangedAt|changedAt|invalidate|signOut.*everywhere|forceRefresh` across `src/` — confirmed no JWT invalidation mechanism exists.
- `\.\.\.body|\.\.\.payload|\.\.\.parsed\.data` across `src/app/api/auth/` — confirmed no mass-assignment patterns.
- `identifier.*startsWith|startsWith.*PREFIX` in `src/app/(auth)/verify-email/` — confirmed the prefix guard is absent on the verify-email consume path (finding I1).

**WebSearch queries performed:**
- "bcrypt cost factor recommendation 2025 OWASP password hashing" — OWASP currently recommends minimum cost 10, with 12 as the modern preferred default for new systems. Cost factor 12 in use here passes. Source: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- "OWASP account enumeration forgot password timing attack defense 2024" — OWASP Forgot Password Cheat Sheet explicitly requires returning a consistent message regardless of whether the email exists, and consistent response timing. The current 404 response on unknown email (finding M1) violates this. Source: [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
- "NextAuth v5 JWT strategy password change session invalidation passwordChangedAt" — Confirmed that NextAuth v5 JWT strategy does not invalidate tokens on password change; `passwordChangedAt` pattern or switching to database sessions are the two conventional mitigations. Source: [NextAuth FAQ](https://next-auth.js.org/faq), [Auth.js discussions](https://github.com/nextauthjs/next-auth/discussions/4687).
