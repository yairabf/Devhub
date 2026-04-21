---
name: DevStash project conventions
description: Confirmed architectural and convention facts for DevStash — use before flagging any absence as an issue
type: project
---

Authentication is NOT yet implemented. All data access uses a hardcoded `DEMO_USER_ID = "user_demo"` constant defined in BOTH `src/app/dashboard/layout.tsx` (line 8) and `src/app/dashboard/page.tsx` (line 17). Do NOT flag missing auth checks as a bug — the app is in pre-auth state by design. Flag the duplicated constant as a Medium code quality issue.

There are no Server Actions (`src/actions/` directory does not exist). All data fetching is done directly in server components via Prisma helper functions in `src/lib/db/`.

There are no API route handlers (`src/app/**/route.ts` does not exist).

Tailwind v4 is correctly configured via `src/app/globals.css` using `@theme inline` — no `tailwind.config.ts` exists (correct).

Mock data file `src/lib/mock-data.ts` exists and is largely superseded by real Prisma queries, but is still used by `UserMenu` (imports `CURRENT_USER` for the demo user display). The data helper functions in that file (getItemsByCollection, getPinnedItems, etc.) are DEAD CODE — they are no longer imported anywhere since real DB queries were wired up. This is a legitimate Medium code quality finding.

`prisma.config.ts` correctly separates migration (DIRECT_URL unpooled) from runtime (DATABASE_URL pooled via adapter). Both URLs expected from env.

`src/lib/prisma.ts` uses `process.env.DATABASE_URL` without a runtime null guard — if the env var is missing at runtime, PrismaNeon is instantiated with `undefined` and will throw a cryptic error instead of a clear one.

`getRecentCollections` in `src/lib/db/collections.ts` includes ALL items in a collection (line 45-53) to compute item count and type distribution. This will over-fetch for large collections but is currently fine for demo data.

`DEMO_USER_ID` is defined as a module-level constant in both `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx`. Should be extracted to a shared file (e.g., `src/lib/constants.ts`).

`SidebarNav.tsx` has `"use client"` (line 1) but contains no hooks — it delegates `usePathname` to child `SidebarLink`. The directive is unnecessary and the component could be a server component if it accepted static JSX from the parent.

`capitalize` utility is defined inline in `Sidebar.tsx` (line 36-39) — should be in `src/lib/format.ts`.

`force-dynamic` is set on both the dashboard layout and page — this is correct given the demo setup, but should be removed from the page once auth + Next.js caching is wired.

**Why:** Early-stage app, auth/backend partially wired, mock data mostly replaced.
**How to apply:** Never flag DEMO_USER_ID or mock-data usage as a security hole — it is the intended current state. Flag the dead code in mock-data.ts and the duplicated DEMO_USER_ID as Medium quality issues.
