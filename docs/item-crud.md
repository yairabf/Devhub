# Item CRUD — Current State & Readiness

> Research snapshot of how Item create/read/update/delete is implemented in DevStash.
> Sources: `prisma/schema.prisma`, `src/lib/db/items.ts`, `src/components/dashboard/*`, `src/app/api/auth/*` (validation patterns), `context/project-overview.md`, `context/coding-standards.md`.

## TL;DR

**Only the READ half of CRUD exists.** There is **no create, update, or delete** path for items anywhere in the codebase — no Server Actions, no API routes, no mutation helpers. Items are seeded via `prisma/seed.ts` and only ever displayed. The "New Item" button is a static UI element with no handler.

| Operation | Status | Where |
|-----------|--------|-------|
| **Create** | ❌ Not implemented | — (only seed-time `prisma.item.upsert` in `prisma/seed.ts`) |
| **Read**   | ✅ Implemented (display only) | `src/lib/db/items.ts` |
| **Update** | ❌ Not implemented | — |
| **Delete** | ❌ Not implemented | — (cascade-delete on user removal only, via schema `onDelete: Cascade`) |

---

## What exists today (Read layer)

All read helpers live in **`src/lib/db/items.ts`** and are called from server components (dashboard layout/page). They are query-only — none mutate.

| Function | Returns | Notes |
|----------|---------|-------|
| `getPinnedItems(userId)` | `ItemCardData[]` | `where: { userId, isPinned: true }`, ordered `updatedAt desc, id desc` |
| `getRecentItems(userId, limit=10)` | `ItemCardData[]` | same ordering, `take: limit` |
| `getItemsCount(userId)` | `number` | `prisma.item.count` |
| `getFavoriteItemsCount(userId)` | `number` | count where `isFavorite: true` |
| `getSystemItemTypes()` | `SidebarItemType[]` | the 7 system types for the sidebar |
| `getItemsCountByType(userId)` | `ItemTypeBreakdown[]` | `_count` per system type (zero-inclusive) |

**`ItemCardData`** (the read DTO) selects a subset of `Item`:
`id, title, description, content, url, isFavorite, itemTypeId, itemType.name, tags[]`.
Notably **absent** from the read DTO: `contentType`, `language`, `fileUrl`, `fileName`, `fileSize`, `isPinned`, `collections`, `createdAt`, `updatedAt`.

### Display surface
- **`ItemCard.tsx`** (server component) renders a card: title, favorite star, description, a `content` code block *or* a `url` line, tag badges, and a type badge (icon + name). Border color is type-derived via `getTypeBorderClass`.
- Items appear in the dashboard's "Pinned Items" and "Recent Items" sections only.

---

## UI entry points that are NOT wired

- **`TopBar.tsx`** — `<Button>New Item</Button>` and `<Button variant="outline">New Collection</Button>` have **no `onClick`/handler**. They are presentational placeholders.
- The "drawer-based item editing" described in `context/project-overview.md` (UI/UX Principles) is **not built**. The only drawer in the app is the mobile sidebar (`Sheet` in `DashboardShell`), unrelated to item editing.
- There is no `/items/[type]` or `/items/[id]` route — `find src/app -name "*item*"` returns nothing. (The sidebar Types section links to `/items/[typename]`, but those routes don't exist yet.)

---

## Data model relevant to CRUD (`prisma/schema.prisma`)

The `Item` model is ready for full CRUD:

```prisma
model Item {
  id          String   @id @default(cuid())
  title       String          // required
  contentType String          // "text" | "link" (seed) | "file" (intended)
  content     String?         // text types
  fileUrl     String?         // file/image (Pro)
  fileName    String?
  fileSize    Int?
  url         String?         // link type
  description String?
  language    String?         // snippet type
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String          // owner
  user        User     @relation(..., onDelete: Cascade)
  itemTypeId  String
  itemType    ItemType @relation(..., onDelete: Restrict)  // can't delete a type in use
  collections ItemCollection[]   // many-to-many
  tags        Tag[]    @relation("ItemTags")  // many-to-many; Tag.name is globally @unique
}
```

Indexes: `@@index([userId])`, `@@index([itemTypeId])`, `@@index([userId, createdAt])`.

**CRUD implications baked into the schema:**
- Deleting a `User` cascades to their items; deleting an `Item` cascades its `ItemCollection` join rows (`onDelete: Cascade` on `ItemCollection.item`).
- An `ItemType` cannot be deleted while items reference it (`onDelete: Restrict`) — relevant for custom types later, not the 7 system types.
- `Tag.name` is globally `@unique` (not user-scoped) — create/update of item tags must **upsert** tags by name and connect, not blindly create. (This matches the still-open question in `project-overview.md`: "Should tags be global or user-scoped?" — currently global.)
- `updatedAt` is auto-managed; ordering everywhere relies on `updatedAt desc, id desc`.

---

## Building blocks already in place for implementing CRUD

The auth feature established the patterns a future Item CRUD should follow:

1. **Validation** — Zod is a direct dependency and used in all auth API routes (`src/app/api/auth/*`) and `src/auth.ts`. Coding standards require "Validate all inputs with Zod."
2. **API route envelope** — auth routes return `{ success, error? }` JSON with semantic status codes (200/400/404/409/410/502). Item mutations could follow the same envelope, or use Server Actions.
3. **Server Actions vs API routes** — `context/coding-standards.md` says: Server Actions for "form submissions and simple mutations" (the natural fit for item create/edit/delete); API routes reserved for webhooks, uploads with progress, etc. `src/actions/auth.ts` (`"use server"`, `signInWithGitHub`) is the existing Server Action precedent. **File/image upload** (Pro) would justify an API route for upload handling (Cloudflare R2 per the architecture).
4. **Auth/ownership** — every mutation must scope by `userId` from `auth()` session (`session.user.id`). All current reads already take a `userId`; the dashboard sources it from the session.
5. **Error handling** — coding standards: `try/catch` in Server Actions, return `{ success, data, error }`, surface errors via toast (note: `sonner` was **removed** in the 2026-05-26 refactor; current pattern is server-rendered status banners).

---

## Free-tier limits to enforce on CREATE (`context/project-overview.md`)

CRUD create logic must enforce monetization gates (not yet implemented anywhere):

| Limit | Free | Pro |
|-------|------|-----|
| Items | **50** | Unlimited |
| Collections | **3** | Unlimited |
| File / Image types | ❌ blocked | ✅ allowed |
| AI features | ❌ | ✅ |

`User.isPro` (Boolean, default false) is the gate flag. The `type_file` and `type_image` item types are Pro-only (`PRO_TYPE_IDS` in the sidebar). A create action should: check `isPro`, count existing items (`getItemsCount`) against the 50 cap for free users, and reject `type_file`/`type_image` for non-Pro users.

---

## Gaps / open questions for a CRUD spec

- No mutation layer (`src/lib/db/items.ts` is read-only; needs create/update/delete or Server Actions in `src/actions/items.ts`).
- No item form component or edit drawer (project overview calls for drawer-based editing).
- No `/items/*` routes despite sidebar links pointing there.
- Tag handling strategy (global unique tags → upsert-and-connect).
- Collection assignment on create/update (`ItemCollection` join writes).
- File/image upload pipeline (Cloudflare R2) — out of scope until Pro/upload work.
- Free-tier enforcement (item count cap, Pro-type gating).
- `contentType` derivation on write (seed uses `url ? "link" : "text"`; "file" never produced yet).
