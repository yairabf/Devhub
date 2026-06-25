# Vitest Unit Testing Setup — Design

> **Date:** 2026-06-25
> **Status:** Approved — ready for implementation
> **Scope:** Set up Vitest to unit-test server-side utilities and `lib/db` helpers. Update workflow docs.

---

## Goal

Introduce a unit test harness for the project, scoped to **server actions and utilities only** — explicitly **not** React components. Wire it into the documented feature workflow so future work adds/updates tests for the code it touches.

Note: the codebase currently has effectively one server action (`signInWithGitHub`), and it is a thin delegate to NextAuth's `signIn` — not worth testing in isolation. The meaningful testable logic lives in the pure utilities (`src/lib/*`) and the data-shaping inside `src/lib/db/*`. The harness is built so route-handler and additional action tests can be added later without rework.

## Decisions

- **Runner:** Vitest, `environment: "node"` (no jsdom — we don't test components).
- **Coverage:** `@vitest/coverage-v8`, opted in from the start.
- **Test location:** Colocated — `src/lib/format.test.ts` next to `src/lib/format.ts`.
- **Alias resolution:** Vitest 4 resolves `tsconfig.json` paths natively via `resolve.tsconfigPaths: true`, so tests import via `@/*` exactly like the app — no extra plugin needed. (Original plan used `vite-tsconfig-paths`; dropped after Vitest's own runtime hint recommended the native option.)
- **No Vitest globals:** explicit `import { describe, it, expect, vi } from "vitest"` per file — avoids modifying `tsconfig.json` types and keeps strict mode clean.

## Dependencies (devDependencies)

- `vitest`
- `@vitest/coverage-v8`

## Config — `vitest.config.ts` (repo root)

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/prisma.ts", "src/lib/mock-data.ts", "src/lib/type-icons.tsx"],
    },
  },
});
```

This is a JS/TS config file, not a Tailwind config — it does not violate the Tailwind v4 "no config file" coding standard.

## `package.json` scripts

- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:coverage": "vitest run --coverage"`

## Test files (initial coverage)

| File | Covers |
|------|--------|
| `src/lib/format.test.ts` | `getInitials` (multi-word, single, empty), `getTypeSlug`, `capitalize` (empty-string guard) |
| `src/lib/type-colors.test.ts` | `getTypeLeftBorderClass` / `getTypeDotClass`: known id, unknown id, `null` fallback |
| `src/lib/rate-limit.test.ts` | `getClientIp` (x-forwarded-for first hop, x-real-ip, "unknown"), `rateLimitMessage` (singular vs plural) |
| `src/lib/db/collections.test.ts` | `getRecentCollections` with `vi.mock("@/lib/prisma")`; asserts `dominantTypeId`, `uniqueTypeIds`, `itemCount` |
| `src/lib/db/items.test.ts` | `getRecentItems` with mocked Prisma; asserts `toCardData` shaping (`itemTypeName` flattened from `itemType.name`) |

**Prisma mocking pattern** (for `lib/db` tests):

```ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { findMany: vi.fn() },
    item: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getRecentCollections } from "@/lib/db/collections";
```

## Doc updates

- **`context/ai-interaction.md`** — rewrite Workflow step 4 (currently "Verify it works in the browser. Implement unit testing later.") to: run `npm test` and the build, and add/update unit tests for any utility or `lib/db` change. Add a short Testing subsection describing scope (server-side logic & utilities, not components).
- **`context/coding-standards.md`** — add a **Testing** section: Vitest, node env, colocated `*.test.ts`, what to test (utilities, `lib/db`, server actions, eventually route handlers) and what not to (components).
- **`CLAUDE.md`** — add `npm test` (and `npm run test:coverage`) to the Commands list.

## Out of scope

- React component tests (no jsdom / React Testing Library).
- API route handler tests (harness supports them later; not written now).
- Testing the trivial `signInWithGitHub` server action.

## Verification

- `npm test` passes (all 5 files green).
- `npm run test:coverage` produces a coverage report.
- `npm run build` still passes (test files are not in the Next build graph).
