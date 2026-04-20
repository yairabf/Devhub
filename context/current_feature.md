# Current Feature

## Dashboard Items

## Status

Completed

## Goals

Replace the mock item data currently rendered in the dashboard main area (Pinned Items + Recent Items) with real data fetched from Neon via Prisma. Preserve the existing layout and visual design — only the data source and derived presentation bits change.

- Fetch pinned and recent items for the current user directly in the dashboard server component (no client fetching).
- Derive each item card's icon and border color from its `ItemType` (same mapping used by collection cards).
- Continue to display item type tags and any other metadata that the current mock-driven cards show.
- If the user has no pinned items, render nothing in the Pinned section (no empty-state placeholder for this iteration).
- Update the Collection stat(s) on the dashboard so counts reflect real data.

## Notes

- Spec: `context/features/dashboard-items-spec.md`.
- Add data-fetching functions in `src/lib/db/items.ts` (mirrors the `src/lib/db/collections.ts` pattern established in Phase 3 dashboard work).
- Reuse `src/lib/type-colors.ts` for border/accent colors; reuse the Lucide icon mapping already wired for `ItemType`.
- Dashboard page already runs with `force-dynamic` and queries for demo user `user_demo` until auth lands — follow the same approach here.
- Out of scope: StatsGrid rewrite beyond the collection stat update, Sidebar data, pinned empty-state UI, auth wiring.
- Reference screenshot if needed: `context/screenshots/dashboard-ui-main.png`.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-04-17: **Dashboard UI Phase 1** — Initialized ShadCN UI, created /dashboard route with TopBar (search + new item button), sidebar and main placeholders, dark mode by default.
- 2026-04-17: **Dashboard UI Phase 2** — Collapsible sidebar (desktop), mobile drawer via Sheet, Favorites/Recent/Types sections wired to mock data, user avatar area (AR initials), hamburger toggle in TopBar. Completed 2026-04-20.
- 2026-04-20: **Dashboard UI Phase 3** — Main content area with StatsGrid (items, collections, favorite items, favorite collections), Recent Collections grid, Pinned Items, and Recent Items. Added reusable Card and Badge UI primitives plus CollectionCard, ItemCard, StatCard, and DashboardSection server components. Completed 2026-04-20.
- 2026-04-20: **Prisma + Neon PostgreSQL Setup** — Installed Prisma 7 with `prisma-client` generator (output `src/generated/prisma`) and the `@prisma/adapter-neon` serverless driver. Added `prisma.config.ts` (Prisma 7 moved datasource URLs out of schema) pointing migrations at the unpooled `DIRECT_URL` while runtime uses pooled `DATABASE_URL` via the adapter. Schema includes app models (User, Item, ItemType, Collection, ItemCollection, Tag) with indexes and cascade deletes, plus NextAuth v5 models (Account, Session, VerificationToken). `src/lib/prisma.ts` exports a singleton client. Initial migration `20260420165113_init` applied to the Neon dev branch. Added idempotent `prisma/seed.ts` (upsert by stable ids) wired via `prisma.config.ts` — seeds the 7 system `ItemType` rows (Snippet, Prompt, Command, Note, Link, File, Image). Completed 2026-04-20.
- 2026-04-20: **Database Seed Script** — Implemented `prisma/seed.ts` per `context/features/seed-spec.md`. Added `bcryptjs` + `@types/bcryptjs`. Seeds demo user (`demo@devstash.io` / password `12345678`, bcrypt 12 rounds, `isPro: false`, `emailVerified` now), aligned 7 system `ItemType` rows with spec colors/Lucide icons, and created 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with their items linked via `ItemCollection` and tagged with the correct system `ItemType`. Idempotent via upsert on stable ids. Completed 2026-04-20.
- 2026-04-20: **Dashboard Collections (Real Data)** — Replaced mock Recent Collections on the dashboard main area with real data from Neon via Prisma. Added `src/lib/db/collections.ts#getRecentCollections(userId, limit)` (single query with ItemCollection → Item.itemTypeId include; computes item count, unique type ids, and dominant type id). Added `src/lib/type-colors.ts` mapping system type ids to Tailwind border classes. Updated `CollectionCard` to take `CollectionCardData`, render Lucide icons per unique type, and apply dominant-type border color. Dashboard page (`/dashboard`) now server-renders per request (`force-dynamic`) fetching for demo user `user_demo` until auth is wired. StatsGrid, Pinned/Recent Items, and Sidebar remain on mock data (out of scope). Completed 2026-04-20.
- 2026-04-21: **Dashboard Items (Real Data)** — Replaced mock Pinned/Recent Items on the dashboard with real data from Neon via Prisma. Added `src/lib/db/items.ts` with `ItemCardData`, `getPinnedItems(userId)`, `getRecentItems(userId, limit)` (deterministic `updatedAt desc, id desc` ordering), and `getItemsCount(userId)`. Added `getCollectionsCount(userId)` in `src/lib/db/collections.ts`. Reworked `ItemCard` to take `ItemCardData`, derive border color via `getTypeBorderClass` and type-badge icon via `getTypeIcon` (matches `CollectionCard` pattern). `StatsGrid` now takes `itemsCount` + `collectionsCount` props (Favorite Items / Favorite Collections remain on mock). Pinned section is omitted entirely when the user has no pinned items. Dashboard page fetches everything in parallel with `Promise.all`. Extended `scripts/test-db.ts` with expected-vs-actual checks for all 5 collections and all 18 items (id, title, itemTypeId, isPinned/isFavorite flags, ItemCollection link). Completed 2026-04-21.
