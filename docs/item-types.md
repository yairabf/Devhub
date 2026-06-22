# Item Types

> Reference documentation for DevStash's 7 system item types.
> Generated from `prisma/schema.prisma`, `prisma/seed-data.ts`, `src/lib/type-colors.ts`, `src/lib/type-icons.tsx`, and `context/project-overview.md`.

System item types are **non-editable** and seeded once via `prisma/seed.ts` (`SYSTEM_ITEM_TYPES` in `prisma/seed-data.ts`). Each is stored as an `ItemType` row with `isSystem: true` and `userId: null`. Every `Item` references exactly one type via `itemTypeId` (FK with `onDelete: Restrict` — a type can't be deleted while items use it).

---

## The 7 Types

| Type | DB id | Hex color | Spec icon | Seed icon (`ItemType.icon`) | Rendered icon (Lucide) |
|------|-------|-----------|-----------|------------------------------|-------------------------|
| Snippet | `type_snippet` | `#3b82f6` (blue) | `</>` | `Code` | `Code2` |
| Prompt  | `type_prompt`  | `#8b5cf6` (purple) | `✨` | `Sparkles` | `Sparkles` |
| Command | `type_command` | `#f97316` (orange) | `⌘` | `Terminal` | `Command` |
| Note    | `type_note`    | `#fde047` (yellow) | `📝` | `StickyNote` | `StickyNote` |
| File (Pro)  | `type_file`  | `#6b7280` (gray) | `📄` | `File` | `FileText` |
| Image (Pro) | `type_image` | `#ec4899` (pink) | `🖼️` | `Image` | `ImageIcon` |
| Link    | `type_link`    | `#10b981` (emerald) | `🔗` | `Link` | `Link2` |

> ⚠️ **Icon naming drift:** three icon names differ between the seeded `ItemType.icon` string and the actual Lucide component rendered by `getTypeIcon` (`src/lib/type-icons.tsx`): `Terminal → Command`, `Link → Link2`, `File → FileText`, `Image → ImageIcon`. The UI renders by `typeId` lookup, not by the stored `icon` string, so the stored value is currently advisory/unused for rendering.

---

## Per-Type Detail

### Snippet — `type_snippet`
- **Purpose:** Reusable code blocks (hooks, utilities, config).
- **Color:** `#3b82f6` · border `border-blue-500/60` · dot `bg-blue-500`
- **Classification:** text
- **Key fields:** `title`, `content` (the code), `language` (e.g. `typescript`, `dockerfile`), `description`
- **Seed examples:** useDebounce Hook, Theme Context Provider, cn() Class Merger, Multi-stage Node Dockerfile

### Prompt — `type_prompt`
- **Purpose:** AI prompts and system messages.
- **Color:** `#8b5cf6` · border `border-purple-500/60` · dot `bg-purple-500`
- **Classification:** text
- **Key fields:** `title`, `content` (the prompt text), `description`. `language` not used.
- **Seed examples:** Senior Code Review, Generate Module Docs, Refactoring Assistant

### Command — `type_command`
- **Purpose:** CLI / shell commands.
- **Color:** `#f97316` · border `border-orange-500/60` · dot `bg-orange-500`
- **Classification:** text
- **Key fields:** `title`, `content` (the command line), `description`
- **Seed examples:** `vercel deploy --prebuilt --prod`, pretty git log graph, docker system prune, kill port :3000, npm outdated

### Note — `type_note`
- **Purpose:** Markdown notes and docs.
- **Color:** `#fde047` · border `border-yellow-400/60` · dot `bg-yellow-400`
- **Classification:** text
- **Key fields:** `title`, `content` (markdown body), `description`
- **Seed examples:** none currently seeded.

### File — `type_file` *(Pro)*
- **Purpose:** Uploaded files / assets.
- **Color:** `#6b7280` · border `border-gray-500/60` · dot `bg-gray-500`
- **Classification:** file
- **Key fields:** `title`, `fileUrl`, `fileName`, `fileSize`, `description`. `content` not used.
- **Seed examples:** none (Pro-gated; flagged with a `PRO` badge in the sidebar).

### Image — `type_image` *(Pro)*
- **Purpose:** Uploaded images.
- **Color:** `#ec4899` · border `border-pink-500/60` · dot `bg-pink-500`
- **Classification:** file
- **Key fields:** `title`, `fileUrl`, `fileName`, `fileSize`, `description`
- **Seed examples:** none (Pro-gated; flagged with a `PRO` badge in the sidebar).

### Link — `type_link`
- **Purpose:** Saved URLs / bookmarks.
- **Color:** `#10b981` · border `border-emerald-500/60` · dot `bg-emerald-500`
- **Classification:** URL
- **Key fields:** `title`, `url`, `description`. `content` not used.
- **Seed examples:** Docker Documentation, GitHub Actions Docs, Tailwind CSS Docs, shadcn/ui, Material Design 3, Lucide Icons

---

## Summaries

### Text vs File vs URL classification

The `Item.contentType` column captures the primary storage mode, **independent of `itemTypeId`**. The seed derives it simply: `const contentType = item.url ? "link" : "text";` — so today only `"text"` and `"link"` values are written. The conceptual mapping by type:

| Classification | `contentType` | Types | Primary field |
|----------------|---------------|-------|---------------|
| **Text** | `text` | snippet, prompt, command, note | `content` |
| **File** | `file` *(intended)* | file, image | `fileUrl` (+ `fileName`, `fileSize`) |
| **URL**  | `link` | link | `url` |

> Note: file/image are Pro-only and not yet exercised by the seed, so the `"file"` `contentType` value is not produced by current seed logic — it is the intended value once uploads land.

### Shared properties (all types)

Every item, regardless of type, carries the same `Item` row shape (`prisma/schema.prisma`):

- **Identity / content:** `id`, `title`, `description`, `contentType`, `content`, `url`, `language`, `fileUrl`, `fileName`, `fileSize`
- **Flags:** `isFavorite`, `isPinned` (both default `false`)
- **Timestamps:** `createdAt`, `updatedAt`
- **Relations:** `userId` → `User` (cascade delete), `itemTypeId` → `ItemType` (restrict delete), many-to-many `collections` (via `ItemCollection`) and `tags` (via `ItemTags`)

Fields are nullable and used selectively per type — e.g. `language` only matters for snippets; `url` only for links; the `file*` trio only for file/image.

### Display differences

Type identity drives three visual treatments, all keyed by `itemTypeId`:

1. **Icon** — `getTypeIcon(typeId)` in `src/lib/type-icons.tsx` returns a Lucide component (fallback `FileText`).
2. **Border color** — `getTypeBorderClass(typeId)` in `src/lib/type-colors.ts` returns a Tailwind border class (fallback `border-border`); used on cards.
3. **Dot color** — `getTypeDotClass(typeId)` returns a Tailwind background class (fallback `bg-muted-foreground`); used as the small colored dot in sidebar/lists.

Beyond color/icon, content rendering differs by classification: text types render `content` (snippets/commands as code, notes as markdown), links render the `url`, and file/image types render from `fileUrl`. File and Image additionally show a `PRO` badge in the sidebar Types section (`PRO_TYPE_IDS = { type_file, type_image }`).
