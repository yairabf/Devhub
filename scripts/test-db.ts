import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { COLLECTIONS, ITEMS, SYSTEM_ITEM_TYPES } from "../prisma/seed-data";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_ID } from "../src/lib/constants";

interface ExpectedCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

interface ExpectedItem {
  id: string;
  title: string;
  itemTypeId: string;
  collectionId: string;
  isFavorite: boolean;
  isPinned: boolean;
}

const EXPECTED_COLLECTIONS: ExpectedCollection[] = COLLECTIONS.map(c => ({
  id: c.id,
  name: c.name,
  description: c.description,
  isFavorite: c.isFavorite ?? false,
}));

const EXPECTED_ITEMS: ExpectedItem[] = ITEMS.map(i => ({
  id: i.id,
  title: i.title,
  itemTypeId: i.itemTypeId,
  collectionId: i.collectionId,
  isFavorite: i.isFavorite ?? false,
  isPinned: i.isPinned ?? false,
}));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL is not set. Check your .env file.");
    process.exit(1);
  }

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  let failures = 0;

  try {
    console.log("→ Connecting to Neon…");
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Connection OK\n");

    const [users, items, itemTypes, collections, tags] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.itemType.count(),
      prisma.collection.count(),
      prisma.tag.count(),
    ]);

    console.log("Row counts:");
    console.log(`  users       ${users}`);
    console.log(`  items       ${items}`);
    console.log(`  itemTypes   ${itemTypes}`);
    console.log(`  collections ${collections}`);
    console.log(`  tags        ${tags}\n`);

    console.log("System item types:");
    const systemTypes = await prisma.itemType.findMany({
      where: { isSystem: true },
      orderBy: { name: "asc" },
    });

    for (const expected of SYSTEM_ITEM_TYPES) {
      const actual = systemTypes.find(t => t.id === expected.id);
      if (!actual) {
        console.log(`  ✗ ${expected.name.padEnd(8)} missing (expected id=${expected.id})`);
        failures++;
        continue;
      }

      const mismatches: string[] = [];
      if (actual.name !== expected.name) mismatches.push(`name: ${actual.name} ≠ ${expected.name}`);
      if (actual.icon !== expected.icon) mismatches.push(`icon: ${actual.icon} ≠ ${expected.icon}`);
      if (actual.color !== expected.color) mismatches.push(`color: ${actual.color} ≠ ${expected.color}`);
      if (actual.userId !== null) mismatches.push(`userId should be null, got ${actual.userId}`);

      if (mismatches.length > 0) {
        console.log(`  ✗ ${expected.name.padEnd(8)} ${mismatches.join("; ")}`);
        failures++;
      } else {
        console.log(`  ✓ ${expected.name.padEnd(8)} ${actual.icon}  ${actual.color}`);
      }
    }

    const unexpected = systemTypes.filter(
      t => !SYSTEM_ITEM_TYPES.some(e => e.id === t.id)
    );
    if (unexpected.length > 0) {
      console.log(`\n  ✗ ${unexpected.length} unexpected system type(s): ${unexpected.map(u => u.name).join(", ")}`);
      failures++;
    }

    console.log("\nCollections (demo user):");
    const demoCollections = await prisma.collection.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { id: "asc" },
    });

    for (const expected of EXPECTED_COLLECTIONS) {
      const actual = demoCollections.find(c => c.id === expected.id);
      if (!actual) {
        console.log(`  ✗ ${expected.name.padEnd(20)} missing (expected id=${expected.id})`);
        failures++;
        continue;
      }

      const mismatches: string[] = [];
      if (actual.name !== expected.name) mismatches.push(`name: ${actual.name} ≠ ${expected.name}`);
      if (actual.description !== expected.description) mismatches.push(`description mismatch`);
      if (actual.isFavorite !== expected.isFavorite) mismatches.push(`isFavorite: ${actual.isFavorite} ≠ ${expected.isFavorite}`);
      if (actual.userId !== DEMO_USER_ID) mismatches.push(`userId: ${actual.userId} ≠ ${DEMO_USER_ID}`);

      if (mismatches.length > 0) {
        console.log(`  ✗ ${expected.name.padEnd(20)} ${mismatches.join("; ")}`);
        failures++;
      } else {
        console.log(`  ✓ ${expected.name.padEnd(20)} ${expected.isFavorite ? "★" : " "}`);
      }
    }

    const unexpectedCollections = demoCollections.filter(
      c => !EXPECTED_COLLECTIONS.some(e => e.id === c.id)
    );
    if (unexpectedCollections.length > 0) {
      console.log(`\n  ✗ ${unexpectedCollections.length} unexpected collection(s): ${unexpectedCollections.map(u => u.name).join(", ")}`);
      failures++;
    }

    console.log("\nItems (demo user):");
    const demoItems = await prisma.item.findMany({
      where: { userId: DEMO_USER_ID },
      include: { collections: { select: { collectionId: true } } },
      orderBy: { id: "asc" },
    });

    for (const expected of EXPECTED_ITEMS) {
      const actual = demoItems.find(i => i.id === expected.id);
      if (!actual) {
        console.log(`  ✗ ${expected.title.padEnd(36)} missing (expected id=${expected.id})`);
        failures++;
        continue;
      }

      const mismatches: string[] = [];
      if (actual.title !== expected.title) mismatches.push(`title: ${actual.title} ≠ ${expected.title}`);
      if (actual.itemTypeId !== expected.itemTypeId) mismatches.push(`itemTypeId: ${actual.itemTypeId} ≠ ${expected.itemTypeId}`);
      if (actual.isFavorite !== expected.isFavorite) mismatches.push(`isFavorite: ${actual.isFavorite} ≠ ${expected.isFavorite}`);
      if (actual.isPinned !== expected.isPinned) mismatches.push(`isPinned: ${actual.isPinned} ≠ ${expected.isPinned}`);
      if (actual.userId !== DEMO_USER_ID) mismatches.push(`userId: ${actual.userId} ≠ ${DEMO_USER_ID}`);

      const collectionIds = actual.collections.map(c => c.collectionId);
      if (!collectionIds.includes(expected.collectionId)) {
        mismatches.push(`not linked to collection ${expected.collectionId} (has: ${collectionIds.join(", ") || "none"})`);
      }

      if (mismatches.length > 0) {
        console.log(`  ✗ ${expected.title.padEnd(36)} ${mismatches.join("; ")}`);
        failures++;
      } else {
        const flags = `${expected.isPinned ? "📌" : "  "}${expected.isFavorite ? "★" : " "}`;
        console.log(`  ✓ ${expected.title.padEnd(36)} ${flags} ${expected.itemTypeId}`);
      }
    }

    const unexpectedItems = demoItems.filter(
      i => !EXPECTED_ITEMS.some(e => e.id === i.id)
    );
    if (unexpectedItems.length > 0) {
      console.log(`\n  ✗ ${unexpectedItems.length} unexpected item(s): ${unexpectedItems.map(u => u.title).join(", ")}`);
      failures++;
    }

    console.log(
      failures === 0
        ? "\n✓ All checks passed."
        : `\n✗ ${failures} check(s) failed.`
    );
    process.exit(failures === 0 ? 0 : 1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
