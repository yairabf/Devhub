# Current Feature

<!-- Feature Name -->

##

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-04-17: **Dashboard UI Phase 1** — Initialized ShadCN UI, created /dashboard route with TopBar (search + new item button), sidebar and main placeholders, dark mode by default.
- 2026-04-17: **Dashboard UI Phase 2** — Collapsible sidebar (desktop), mobile drawer via Sheet, Favorites/Recent/Types sections wired to mock data, user avatar area (AR initials), hamburger toggle in TopBar. Completed 2026-04-20.
- 2026-04-20: **Dashboard UI Phase 3** — Main content area with StatsGrid (items, collections, favorite items, favorite collections), Recent Collections grid, Pinned Items, and Recent Items. Added reusable Card and Badge UI primitives plus CollectionCard, ItemCard, StatCard, and DashboardSection server components. Completed 2026-04-20.
- 2026-04-20: **Prisma + Neon PostgreSQL Setup** — Installed Prisma 7 with `prisma-client` generator (output `src/generated/prisma`) and the `@prisma/adapter-neon` serverless driver. Added `prisma.config.ts` (Prisma 7 moved datasource URLs out of schema) pointing migrations at the unpooled `DIRECT_URL` while runtime uses pooled `DATABASE_URL` via the adapter. Schema includes app models (User, Item, ItemType, Collection, ItemCollection, Tag) with indexes and cascade deletes, plus NextAuth v5 models (Account, Session, VerificationToken). `src/lib/prisma.ts` exports a singleton client. Initial migration `20260420165113_init` applied to the Neon dev branch. Added idempotent `prisma/seed.ts` (upsert by stable ids) wired via `prisma.config.ts` — seeds the 7 system `ItemType` rows (Snippet, Prompt, Command, Note, Link, File, Image). Completed 2026-04-20.
