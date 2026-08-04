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
  extra?: string,
): Promise<T> {
  const args = ["tsx", FIXTURE, command, arg];
  if (extra !== undefined) args.push(extra);
  const { stdout } = await run("npx", args, { cwd: process.cwd() });
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
 */
export function createTestItem(
  suffix: string,
  title?: string,
): Promise<SeededTestItem> {
  return fixture<SeededTestItem>("create", suffix, title);
}

/** Idempotent cleanup — safe to call when the spec already deleted the item. */
export async function removeTestItem(id: string): Promise<void> {
  await fixture<{ removed: boolean }>("remove", id);
}

export async function itemExists(id: string): Promise<boolean> {
  const { exists } = await fixture<{ exists: boolean }>("exists", id);
  return exists;
}
