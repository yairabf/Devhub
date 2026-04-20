import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

interface ExpectedItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const EXPECTED_SYSTEM_TYPES: ExpectedItemType[] = [
  { id: "type_snippet", name: "Snippet", icon: "</>", color: "#3b82f6" },
  { id: "type_prompt", name: "Prompt", icon: "✨", color: "#8b5cf6" },
  { id: "type_command", name: "Command", icon: "⌘", color: "#f97316" },
  { id: "type_note", name: "Note", icon: "📝", color: "#fde047" },
  { id: "type_link", name: "Link", icon: "🔗", color: "#10b981" },
  { id: "type_file", name: "File", icon: "📄", color: "#6b7280" },
  { id: "type_image", name: "Image", icon: "🖼️", color: "#ec4899" },
];

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

    for (const expected of EXPECTED_SYSTEM_TYPES) {
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
      t => !EXPECTED_SYSTEM_TYPES.some(e => e.id === t.id)
    );
    if (unexpected.length > 0) {
      console.log(`\n  ✗ ${unexpected.length} unexpected system type(s): ${unexpected.map(u => u.name).join(", ")}`);
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
