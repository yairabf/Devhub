import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_ID } from "../src/lib/constants";

/**
 * Fixture CLI for the Playwright suite: creates and removes throwaway items so
 * specs never delete seeded data.
 *
 * It runs as a `tsx` subprocess rather than being imported by the specs
 * directly — Playwright transpiles test files to CJS, and the generated Prisma
 * client is ESM (`import.meta`), so it cannot be loaded in-process.
 *
 * Usage: tsx scripts/e2e-item-fixture.ts <command> <arg> [title] [itemTypeId]
 *   create <suffix> [title] [itemTypeId]
 *                             create a throwaway item at a known id; defaults to
 *                             a snippet, pass type_note/type_prompt for prose
 *   remove <id>               delete by id
 *   backdate <id> <iso>       force `updatedAt` to an older instant, so a spec can
 *                             tell a real timestamp bump from a stale render
 *                             (`formatIsoDate` is day-granular, so a same-day
 *                             bump is invisible in the UI)
 *   exists <id>               report whether the id is present
 *   findByTitle <title>       read back an item the UI created (ids are cuids)
 *   removeByTitle <title>     clean up items the UI created
 *
 * Prints a single JSON line on stdout.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing required env var: DATABASE_URL");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
  log: ["error"],
});

/**
 * Prose types render in the Markdown editor and carry no language, so a
 * throwaway of one of those types is seeded with Markdown source instead of
 * code. Kept as a local set rather than importing `usesMarkdownEditor`: this
 * script runs under `tsx` with relative imports, and the ids it already
 * hardcodes (collection, type) are in the same spirit.
 */
const PROSE_TYPE_IDS = new Set(["type_note", "type_prompt"]);

const CODE_CONTENT = "console.log('e2e throwaway');";
const PROSE_CONTENT = [
  "# E2E heading",
  "",
  "Paragraph with **bold** text and `inline code`.",
  "",
  "- first",
  "- second",
  "",
].join("\n");

async function create(
  suffix: string,
  explicitTitle?: string,
  explicitTypeId?: string,
) {
  const id = `item_e2e_${suffix}`;
  // Empty rather than absent: the caller passes placeholders for the arguments
  // it does not care about, since these are positional.
  const title = explicitTitle || `E2E throwaway ${suffix}`;
  const itemTypeId = explicitTypeId || "type_snippet";
  const isProse = PROSE_TYPE_IDS.has(itemTypeId);

  await prisma.item.deleteMany({ where: { id } });
  await prisma.item.create({
    data: {
      id,
      title,
      contentType: "text",
      content: isProse ? PROSE_CONTENT : CODE_CONTENT,
      description: "Created by the Playwright suite — safe to delete.",
      language: isProse ? null : "typescript",
      userId: DEMO_USER_ID,
      itemTypeId,
      collections: { create: { collectionId: "col_react_patterns" } },
      tags: {
        connectOrCreate: [{ where: { name: "e2e" }, create: { name: "e2e" } }],
      },
    },
  });

  return { id, title };
}

/**
 * Bulk variant for the pagination specs, which need more rows than a page
 * holds. One subprocess for the whole batch: the per-item `create` helper
 * would mean ~25 `tsx` startups, which dominates the spec's runtime.
 *
 * Titles are zero-padded so they sort predictably when read back, and every
 * row shares the `prefix` so cleanup is a single `deleteMany`.
 */
async function createMany(prefix: string, count: number, itemTypeId?: string) {
  const type = itemTypeId || "type_snippet";
  const created: { id: string; title: string }[] = [];

  for (let i = 0; i < count; i++) {
    const ordinal = String(i + 1).padStart(3, "0");
    const id = `item_e2e_${prefix}_${ordinal}`;
    const title = `${prefix} ${ordinal}`;
    await prisma.item.deleteMany({ where: { id } });
    await prisma.item.create({
      data: {
        id,
        title,
        contentType: "text",
        content: CODE_CONTENT,
        description: "Created by the Playwright suite — safe to delete.",
        language: "typescript",
        userId: DEMO_USER_ID,
        itemTypeId: type,
        // Linked like the single-item fixture, so one batch can exercise both
        // the by-type listing and the collection detail listing.
        collections: { create: { collectionId: "col_react_patterns" } },
      },
    });
    created.push({ id, title });
  }

  return { created: created.length, items: created };
}

/**
 * Throwaway collections for the `/collections` pagination spec, which needs
 * more than a page holds. Same prefix/cleanup contract as `createMany`.
 */
async function createManyCollections(prefix: string, count: number) {
  const created: { id: string; name: string }[] = [];

  for (let i = 0; i < count; i++) {
    const ordinal = String(i + 1).padStart(3, "0");
    const id = `col_e2e_${prefix}_${ordinal}`;
    const name = `${prefix} ${ordinal}`;
    await prisma.collection.deleteMany({ where: { id } });
    await prisma.collection.create({
      data: {
        id,
        name,
        description: "Created by the Playwright suite — safe to delete.",
        userId: DEMO_USER_ID,
      },
    });
    created.push({ id, name });
  }

  return { created: created.length, collections: created };
}

async function main() {
  const [command, arg, title, itemTypeId] = process.argv.slice(2);

  switch (command) {
    case "create":
      return create(requireArg(command, arg), title, itemTypeId);
    case "createMany": {
      const count = Number(title);
      if (!Number.isInteger(count) || count < 1) {
        throw new Error(`"createMany" requires a positive count, got: ${title}`);
      }
      return createMany(requireArg(command, arg), count, itemTypeId);
    }
    case "removeMany": {
      const { count } = await prisma.item.deleteMany({
        where: { id: { startsWith: `item_e2e_${requireArg(command, arg)}_` } },
      });
      return { removed: count };
    }
    case "createManyCollections": {
      const count = Number(title);
      if (!Number.isInteger(count) || count < 1) {
        throw new Error(
          `"createManyCollections" requires a positive count, got: ${title}`,
        );
      }
      return createManyCollections(requireArg(command, arg), count);
    }
    case "removeManyCollections": {
      const { count } = await prisma.collection.deleteMany({
        where: { id: { startsWith: `col_e2e_${requireArg(command, arg)}_` } },
      });
      return { removed: count };
    }
    case "remove":
      await prisma.item.deleteMany({ where: { id: requireArg(command, arg) } });
      return { removed: true };
    case "backdate": {
      const iso = requireArg(`${command} <id>`, title);
      // Raw SQL: `updatedAt` carries @updatedAt, so Prisma's own update path
      // would overwrite whatever value we passed with `now()`.
      await prisma.$executeRaw`
        UPDATE "Item" SET "updatedAt" = ${new Date(iso)} WHERE "id" = ${requireArg(command, arg)}
      `;
      const item = await prisma.item.findUnique({
        where: { id: requireArg(command, arg) },
        select: { updatedAt: true },
      });
      return { updatedAt: item?.updatedAt.toISOString() ?? null };
    }
    case "exists":
      return {
        exists:
          (await prisma.item.count({ where: { id: requireArg(command, arg) } })) === 1,
      };
    case "findByTitle":
      return {
        item: await prisma.item.findFirst({
          where: { title: requireArg(command, arg), userId: DEMO_USER_ID },
          select: {
            id: true,
            title: true,
            contentType: true,
            content: true,
            description: true,
            language: true,
            url: true,
            itemTypeId: true,
            userId: true,
            tags: { select: { name: true }, orderBy: { name: "asc" } },
          },
        }),
      };
    case "removeByTitle": {
      const { count } = await prisma.item.deleteMany({
        where: { title: requireArg(command, arg), userId: DEMO_USER_ID },
      });
      return { removed: count };
    }
    default:
      throw new Error(`Unknown command: ${command ?? "(none)"}`);
  }
}

function requireArg(command: string, arg: string | undefined): string {
  if (!arg) throw new Error(`"${command}" requires an argument`);
  return arg;
}

main()
  .then(result => {
    process.stdout.write(JSON.stringify(result));
  })
  .catch((error: unknown) => {
    process.stderr.write(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
