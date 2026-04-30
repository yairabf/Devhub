# Forgot Password — Design Spec

**Date:** 2026-04-30  
**Status:** Approved  

---

## Overview

Add a standard forgot password flow to DevStash. Users can request a reset link by email, click it to land on a reset page, and set a new password. The flow reuses the existing `VerificationToken` model and Resend email infrastructure.

---

## Data & Token Strategy

- Reuse the `VerificationToken` model — no schema migration required.
- Reset tokens use a **prefixed identifier**: `reset:user@example.com`. This cleanly separates them from email verification tokens (which use `identifier = email`) so `deleteMany` on reset tokens never touches verification tokens.
- Token value: `randomBytes(32).toString("hex")` (same as email verification).
- TTL: **24 hours** from creation.
- Single-use: token is deleted on successful password reset.
- On each new request, any existing `reset:email` token is deleted before creating a new one (prevents accumulation).

---

## Pages & Components

### `/forgot-password`

- **Server page** under the existing `(auth)` route group.
- Renders `ForgotPasswordForm` client component.
- Form: single email input + submit button.
- On submit: calls `forgotPassword` Server Action.
- On success: inline "Check your email" message replaces the form (stays on page, no redirect).
- On error (email not found): inline error message below the form.

### `/reset-password`

- **Server page** under `(auth)` route group.
- Reads `?token` from `searchParams` and pre-validates: looks up token, checks it starts with `reset:`, checks expiry.
- **Invalid/expired**: renders an error card with a "Request a new link" → `/forgot-password` link.
- **Valid**: renders `ResetPasswordForm` client component with the token passed as a prop.
- Form: password + confirm password fields (token passed as hidden state, not a hidden input).
- On success: server action returns success → client redirects to `/sign-in?password_reset=1`.

### Sign-in page changes

- Add a "Forgot password?" link below the password input in `SignInForm`.
- Add `?password_reset=1` handler to the existing `useEffect` in `SignInFields` → fires a Sonner success toast: "Password updated! You can now sign in."

---

## Server Actions (`src/actions/auth.ts`)

### `forgotPassword(email: string)`

1. Normalize email to lowercase.
2. Find user by email — return `{ success: false, error: "No account found with that email." }` if not found.
3. Delete any existing `VerificationToken` where `identifier = "reset:" + email`.
4. Create new `VerificationToken`: `{ identifier: "reset:" + email, token: hex(32), expires: now + 24h }`.
5. Call `sendPasswordResetEmail(email, token)`.
6. Return `{ success: true }`.

### `resetPassword(token: string, password: string, confirmPassword: string)`

1. Zod-validate: password min 8 chars, passwords match.
2. Look up `VerificationToken` by `token` value.
3. Verify `identifier` starts with `reset:` — reject if not (prevents reuse of email verification tokens).
4. Check `expires > now` — return expired error if not.
5. Extract email from identifier (`identifier.slice(6)`).
6. Hash new password with bcrypt (12 rounds).
7. Update `User.password` where `email = extracted email`.
8. Delete the `VerificationToken`.
9. Return `{ success: true }`.

The action re-validates the token even though the page pre-checked it, preventing replay with a stale or tampered token submitted directly to the action.

---

## Email (`src/lib/email.ts`)

Add `sendPasswordResetEmail(email: string, token: string)`:

- Same structure as `sendVerificationEmail`.
- Subject: "Reset your DevStash password".
- Link: `${APP_URL}/reset-password?token=${token}`.
- Body: "Click below to reset your password. This link expires in 24 hours."

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Email not in system | Inline error in `ForgotPasswordForm` |
| Token missing from URL | Server page shows invalid-link error card |
| Token not found in DB | Server page shows invalid-link error card |
| Token expired | Server page shows expired error card with re-request link |
| Passwords don't match | Inline validation error in `ResetPasswordForm` |
| Password too short | Inline validation error in `ResetPasswordForm` |
| Resend API failure | Action returns generic error; form shows it inline |

---

## File Checklist

| File | Change |
|---|---|
| `src/lib/email.ts` | Add `sendPasswordResetEmail` |
| `src/actions/auth.ts` | New file — `forgotPassword` + `resetPassword` actions |
| `src/app/(auth)/forgot-password/page.tsx` | New page |
| `src/components/auth/ForgotPasswordForm.tsx` | New client component |
| `src/app/(auth)/reset-password/page.tsx` | New page (server validates token) |
| `src/components/auth/ResetPasswordForm.tsx` | New client component |
| `src/components/auth/SignInForm.tsx` | Add "Forgot password?" link + `password_reset` toast |
