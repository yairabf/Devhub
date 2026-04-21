import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_ID } from "../src/lib/constants";

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  const targets = await prisma.user.findMany({
    where: { NOT: [{ id: DEMO_USER_ID }, { email: DEMO_EMAIL }] },
    select: { id: true, email: true },
  });

  if (targets.length === 0) {
    console.log("No users to delete.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Deleting ${targets.length} user(s):`);
  for (const u of targets) console.log(`  - ${u.email} (${u.id})`);

  const ids = targets.map((u) => u.id);

  // cascade-deletes handle Item, Collection, ItemCollection, Account, Session
  const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } });

  // clean up orphaned VerificationTokens (not tied to User via FK)
  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: targets.map((u) => u.email!) } },
  });

  console.log(`Done. Deleted ${count} user(s) and their content.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
