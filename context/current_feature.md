# Current Feature

## Dashboard Collections (Real Data)

## Status

Completed

## Goals

Replace the dummy Recent Collections data in the dashboard main area (per `context/features/dashboard-collections-spec.md`) with real data from the Neon/Postgres database via Prisma. Keep the existing 6-card grid layout and visual design — only the data source changes.

- Create `src/lib/db/collections.ts` with data-fetching functions (e.g. `getRecentCollections(userId, limit)`).
- Fetch collections directly in the dashboard server component (no client fetching, no Server Action — per coding standards: server components fetch with Prisma).
- Drop mock imports from `src/lib/mock-data.ts` for collections on the dashboard.
- Collection card border color is derived from the **most-used content type** in that collection (based on linked `ItemCollection` → `Item.typeId` counts; fall back to a neutral color when the collection is empty).
- Show small icons for **all content types** present in the collection (deduped).
- Update collection stats display (item count, etc.) to reflect real DB values.
- Do **not** render the items underneath collections yet — that comes in a later feature.

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png` (layout/design is already implemented — no visual changes expected).
- Demo data is seeded by `prisma/seed.ts` (demo user `demo@devstash.io`, 5 collections). Use that user's id as the current user while auth is not yet wired.
- Preserve existing `CollectionCard` / `DashboardSection` components; only swap the data source and extend props if needed for type icons / border color.
- Keep queries indexed-friendly (use existing `Collection.userId` / `ItemCollection` indexes); avoid N+1 by including the needed relations in a single query.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-04-17: **Dashboard UI Phase 1** — Initialized ShadCN UI, created /dashboard route with TopBar (search + new item button), sidebar and main placeholders, dark mode by default.
- 2026-04-17: **Dashboard UI Phase 2** — Collapsible sidebar (desktop), mobile drawer via Sheet, Favorites/Recent/Types sections wired to mock data, user avatar area (AR initials), hamburger toggle in TopBar. Completed 2026-04-20.
- 2026-04-20: **Dashboard UI Phase 3** — Main content area with StatsGrid (items, collections, favorite items, favorite collections), Recent Collections grid, Pinned Items, and Recent Items. Added reusable Card and Badge UI primitives plus CollectionCard, ItemCard, StatCard, and DashboardSection server components. Completed 2026-04-20.
- 2026-04-20: **Prisma + Neon PostgreSQL Setup** — Installed Prisma 7 with `prisma-client` generator (output `src/generated/prisma`) and the `@prisma/adapter-neon` serverless driver. Added `prisma.config.ts` (Prisma 7 moved datasource URLs out of schema) pointing migrations at the unpooled `DIRECT_URL` while runtime uses pooled `DATABASE_URL` via the adapter. Schema includes app models (User, Item, ItemType, Collection, ItemCollection, Tag) with indexes and cascade deletes, plus NextAuth v5 models (Account, Session, VerificationToken). `src/lib/prisma.ts` exports a singleton client. Initial migration `20260420165113_init` applied to the Neon dev branch. Added idempotent `prisma/seed.ts` (upsert by stable ids) wired via `prisma.config.ts` — seeds the 7 system `ItemType` rows (Snippet, Prompt, Command, Note, Link, File, Image). Completed 2026-04-20.
- 2026-04-20: **Database Seed Script** — Implemented `prisma/seed.ts` per `context/features/seed-spec.md`. Added `bcryptjs` + `@types/bcryptjs`. Seeds demo user (`demo@devstash.io` / password `12345678`, bcrypt 12 rounds, `isPro: false`, `emailVerified` now), aligned 7 system `ItemType` rows with spec colors/Lucide icons, and created 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with their items linked via `ItemCollection` and tagged with the correct system `ItemType`. Idempotent via upsert on stable ids. Completed 2026-04-20.
- 2026-04-20: **Dashboard Collections (Real Data)** — Replaced mock Recent Collections on the dashboard main area with real data from Neon via Prisma. Added `src/lib/db/collections.ts#getRecentCollections(userId, limit)` (single query with ItemCollection → Item.itemTypeId include; computes item count, unique type ids, and dominant type id). Added `src/lib/type-colors.ts` mapping system type ids to Tailwind border classes. Updated `CollectionCard` to take `CollectionCardData`, render Lucide icons per unique type, and apply dominant-type border color. Dashboard page (`/dashboard`) now server-renders per request (`force-dynamic`) fetching for demo user `user_demo` until auth is wired. StatsGrid, Pinned/Recent Items, and Sidebar remain on mock data (out of scope). Completed 2026-04-20.
