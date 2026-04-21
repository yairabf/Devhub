import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { COLLECTIONS, ITEMS, SYSTEM_ITEM_TYPES } from "./seed-data";

const DEMO_USER = {
  id: "user_demo",
  email: "demo@devstash.io",
  name: "Demo User",
  password: process.env.SEED_DEMO_PASSWORD ?? "12345678",
  isPro: false,
};

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
    const now = new Date();

    await prisma.user.upsert({
      where: { id: DEMO_USER.id },
      create: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        emailVerified: now,
        password: passwordHash,
        isPro: DEMO_USER.isPro,
      },
      update: {
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        emailVerified: now,
        password: passwordHash,
        isPro: DEMO_USER.isPro,
      },
    });

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

    for (const collection of COLLECTIONS) {
      await prisma.collection.upsert({
        where: { id: collection.id },
        create: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          isFavorite: collection.isFavorite ?? false,
          userId: DEMO_USER.id,
        },
        update: {
          name: collection.name,
          description: collection.description,
          isFavorite: collection.isFavorite ?? false,
        },
      });
    }

    for (const item of ITEMS) {
      const contentType = item.url ? "link" : "text";
      await prisma.item.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          title: item.title,
          description: item.description,
          contentType,
          content: item.content,
          url: item.url,
          language: item.language,
          isFavorite: item.isFavorite ?? false,
          isPinned: item.isPinned ?? false,
          userId: DEMO_USER.id,
          itemTypeId: item.itemTypeId,
        },
        update: {
          title: item.title,
          description: item.description,
          contentType,
          content: item.content,
          url: item.url,
          language: item.language,
          isFavorite: item.isFavorite ?? false,
          isPinned: item.isPinned ?? false,
          itemTypeId: item.itemTypeId,
        },
      });

      await prisma.itemCollection.upsert({
        where: {
          itemId_collectionId: {
            itemId: item.id,
            collectionId: item.collectionId,
          },
        },
        create: {
          itemId: item.id,
          collectionId: item.collectionId,
        },
        update: {},
      });
    }

    const [typeCount, collectionCount, itemCount] = await Promise.all([
      prisma.itemType.count({ where: { isSystem: true } }),
      prisma.collection.count({ where: { userId: DEMO_USER.id } }),
      prisma.item.count({ where: { userId: DEMO_USER.id } }),
    ]);

    console.log(
      `Seed complete — demo user + ${typeCount} system types, ${collectionCount} collections, ${itemCount} items.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
