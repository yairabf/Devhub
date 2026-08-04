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
 * Usage: tsx scripts/e2e-item-fixture.ts <create|remove|exists> <arg> [title]
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

async function create(suffix: string, explicitTitle?: string) {
  const id = `item_e2e_${suffix}`;
  const title = explicitTitle ?? `E2E throwaway ${suffix}`;

  await prisma.item.deleteMany({ where: { id } });
  await prisma.item.create({
    data: {
      id,
      title,
      contentType: "text",
      content: "console.log('e2e throwaway');",
      description: "Created by the Playwright suite — safe to delete.",
      language: "typescript",
      userId: DEMO_USER_ID,
      itemTypeId: "type_snippet",
      collections: { create: { collectionId: "col_react_patterns" } },
      tags: {
        connectOrCreate: [{ where: { name: "e2e" }, create: { name: "e2e" } }],
      },
    },
  });

  return { id, title };
}

async function main() {
  const [command, arg, title] = process.argv.slice(2);

  switch (command) {
    case "create":
      return create(requireArg(command, arg), title);
    case "remove":
      await prisma.item.deleteMany({ where: { id: requireArg(command, arg) } });
      return { removed: true };
    case "exists":
      return {
        exists:
          (await prisma.item.count({ where: { id: requireArg(command, arg) } })) === 1,
      };
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
