import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const FIXTURE = "scripts/e2e-item-fixture.ts";

/**
 * Thin wrapper over the fixture CLI. Prisma cannot be imported here: Playwright
 * transpiles specs to CJS and the generated client is ESM, so all database work
 * happens in a `tsx` subprocess.
 */
async function fixture<T>(
  command: string,
  arg: string,
  ...extras: string[]
): Promise<T> {
  const { stdout } = await run(
    "npx",
    ["tsx", FIXTURE, command, arg, ...extras],
    { cwd: process.cwd() },
  );
  return JSON.parse(stdout) as T;
}

export interface SeededTestItem {
  id: string;
  title: string;
}

/**
 * Creates a throwaway item owned by the demo user so specs never delete seeded
 * data (which `npm run db:test` asserts on). Linked to a collection and tagged
 * so the drawer renders both sections.
 *
 * Defaults to a snippet. Pass `type_note` or `type_prompt` for an item that
 * renders in the Markdown editor — the fixture seeds those with Markdown source
 * and no language.
 */
export function createTestItem(
  suffix: string,
  title?: string,
  itemTypeId?: string,
): Promise<SeededTestItem> {
  // Empty string means "use the fixture's own default". The CLI arguments are
  // positional, so the type needs a placeholder in the title slot to reach it.
  return fixture<SeededTestItem>("create", suffix, title ?? "", itemTypeId ?? "");
}

/**
 * Forces an item's `updatedAt` back to `iso`. Needed because `formatIsoDate` is
 * day-granular: without an older starting point, a spec cannot tell a real
 * timestamp bump from a stale value re-rendered.
 */
export async function backdateTestItem(
  id: string,
  iso: string,
): Promise<string | null> {
  const { updatedAt } = await fixture<{ updatedAt: string | null }>(
    "backdate",
    id,
    iso,
  );
  return updatedAt;
}

/** Idempotent cleanup — safe to call when the spec already deleted the item. */
export async function removeTestItem(id: string): Promise<void> {
  await fixture<{ removed: boolean }>("remove", id);
}

/**
 * Bulk-creates `count` throwaway items sharing `prefix`, for specs that need
 * more rows than a page holds. Returns them in creation order — note the
 * listings sort newest-first, so the last created lands on page 1.
 */
export function createTestItems(
  prefix: string,
  count: number,
  itemTypeId?: string,
): Promise<{ created: number; items: SeededTestItem[] }> {
  return fixture("createMany", prefix, String(count), itemTypeId ?? "");
}

/** Removes every item created by `createTestItems` under `prefix`. */
export async function removeTestItems(prefix: string): Promise<void> {
  await fixture<{ removed: number }>("removeMany", prefix);
}

/** Bulk-creates throwaway collections, for the `/collections` paging spec. */
export function createTestCollections(
  prefix: string,
  count: number,
): Promise<{ created: number; collections: { id: string; name: string }[] }> {
  return fixture("createManyCollections", prefix, String(count));
}

/** Removes every collection created by `createTestCollections`. */
export async function removeTestCollections(prefix: string): Promise<void> {
  await fixture<{ removed: number }>("removeManyCollections", prefix);
}

export async function itemExists(id: string): Promise<boolean> {
  const { exists } = await fixture<{ exists: boolean }>("exists", id);
  return exists;
}

/** A row as stored, for asserting what the create dialog actually persisted. */
export interface StoredItem {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  description: string | null;
  language: string | null;
  url: string | null;
  itemTypeId: string;
  userId: string;
  tags: { name: string }[];
}

/** Items created through the UI get cuid ids, so they are read back by title. */
export async function findItemByTitle(title: string): Promise<StoredItem | null> {
  const { item } = await fixture<{ item: StoredItem | null }>(
    "findByTitle",
    title,
  );
  return item;
}

export async function removeItemsByTitle(title: string): Promise<number> {
  const { removed } = await fixture<{ removed: number }>(
    "removeByTitle",
    title,
  );
  return removed;
}
