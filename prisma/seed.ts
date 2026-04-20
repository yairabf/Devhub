import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

interface SystemItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const SYSTEM_ITEM_TYPES: SystemItemType[] = [
  { id: "type_snippet", name: "Snippet", icon: "</>", color: "#3b82f6" },
  { id: "type_prompt", name: "Prompt", icon: "✨", color: "#8b5cf6" },
  { id: "type_command", name: "Command", icon: "⌘", color: "#f97316" },
  { id: "type_note", name: "Note", icon: "📝", color: "#fde047" },
  { id: "type_link", name: "Link", icon: "🔗", color: "#10b981" },
  { id: "type_file", name: "File", icon: "📄", color: "#6b7280" },
  { id: "type_image", name: "Image", icon: "🖼️", color: "#ec4899" },
];

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const type of SYSTEM_ITEM_TYPES) {
      await prisma.itemType.upsert({
        where: { id: type.id },
        create: { ...type, isSystem: true, userId: null },
        update: {
          name: type.name,
          icon: type.icon,
          color: type.color,
          isSystem: true,
        },
      });
    }

    const count = await prisma.itemType.count({ where: { isSystem: true } });
    console.log(`Seeded ${SYSTEM_ITEM_TYPES.length} system item types (total system rows: ${count}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
