---
name: False positive traps for DevStash audits
description: Known patterns that look like issues but are not — prevents repeated false positives
type: feedback
---

1. `.env*` is covered by `.gitignore` line `.env*` — never report env files as exposed.

2. `src/lib/mock-data.ts` contains a `CURRENT_USER` object with a real-looking email. This is intentional demo data, not a leaked credential.

3. `Sidebar.tsx` line 182 uses `style={{ color: type.color }}` — this is intentional because `type.color` is a dynamic hex value from the database that cannot be expressed as a static Tailwind class. This is a justified inline style exception per project context (dynamic DB-driven colors). Flag it as a low/medium issue for the dynamic color pattern but acknowledge it is currently the only viable approach without CSS custom property injection.

4. `SidebarSection.tsx` uses the `inert` HTML attribute — this is intentional for accessibility (trapping focus out of collapsed sections). Not a bug.

5. `useCollapsedSections.ts` uses module-level mutable state (`cachedSnapshot`, `hasReadStorage`, `listeners`). This is a deliberate pattern for `useSyncExternalStore` — it's the correct external store API. Not a bug.

6. `SidebarNav.tsx` has `"use client"` directive even though it contains no hooks. This is because it renders `SidebarLink` which uses `usePathname` — the client boundary must be set on or above any component that uses client-only hooks transitively. However, since `SidebarLink` already declares its own `"use client"`, `SidebarNav` does NOT need the directive. This IS a real (low) finding.

7. `scripts/test-db.ts` and `prisma/seed.ts` use `console.log`/`console.error` — these are dev scripts, not production code. Console usage is correct here.

8. Both layout.tsx and page.tsx in `/dashboard` have `export const dynamic = "force-dynamic"` — this is intentional for the demo/pre-auth state (no caching while one hardcoded user). Not a bug, but the duplication is worth noting.

**Why:** These patterns recur in every audit and are always correct.
**How to apply:** Skip these as issues unless the context genuinely changes.
