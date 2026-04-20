import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_USER_ID = "user_demo";

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

interface ExpectedCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

const EXPECTED_COLLECTIONS: ExpectedCollection[] = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
  },
  {
    id: "col_ai_workflows",
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: true,
  },
  {
    id: "col_devops",
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: false,
  },
  {
    id: "col_terminal_commands",
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    isFavorite: false,
  },
  {
    id: "col_design_resources",
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: false,
  },
];

interface ExpectedItem {
  id: string;
  title: string;
  itemTypeId: string;
  collectionId: string;
  isFavorite: boolean;
  isPinned: boolean;
}

const EXPECTED_ITEMS: ExpectedItem[] = [
  { id: "item_use_debounce",          title: "useDebounce Hook",            itemTypeId: "type_snippet", collectionId: "col_react_patterns",    isFavorite: true,  isPinned: true  },
  { id: "item_theme_provider",        title: "Theme Context Provider",      itemTypeId: "type_snippet", collectionId: "col_react_patterns",    isFavorite: false, isPinned: false },
  { id: "item_cn_utility",            title: "cn() Class Merger",           itemTypeId: "type_snippet", collectionId: "col_react_patterns",    isFavorite: false, isPinned: false },
  { id: "item_prompt_code_review",    title: "Senior Code Review",          itemTypeId: "type_prompt",  collectionId: "col_ai_workflows",      isFavorite: true,  isPinned: false },
  { id: "item_prompt_docs_generation",title: "Generate Module Docs",        itemTypeId: "type_prompt",  collectionId: "col_ai_workflows",      isFavorite: false, isPinned: false },
  { id: "item_prompt_refactor",       title: "Refactoring Assistant",       itemTypeId: "type_prompt",  collectionId: "col_ai_workflows",      isFavorite: false, isPinned: false },
  { id: "item_dockerfile_node",       title: "Multi-stage Node Dockerfile", itemTypeId: "type_snippet", collectionId: "col_devops",            isFavorite: false, isPinned: false },
  { id: "item_deploy_vercel",         title: "Deploy to Vercel (prod)",     itemTypeId: "type_command", collectionId: "col_devops",            isFavorite: false, isPinned: false },
  { id: "item_link_docker_docs",      title: "Docker Documentation",        itemTypeId: "type_link",    collectionId: "col_devops",            isFavorite: false, isPinned: false },
  { id: "item_link_gh_actions",       title: "GitHub Actions Docs",         itemTypeId: "type_link",    collectionId: "col_devops",            isFavorite: false, isPinned: false },
  { id: "item_cmd_git_log_graph",     title: "Pretty git log graph",        itemTypeId: "type_command", collectionId: "col_terminal_commands", isFavorite: false, isPinned: false },
  { id: "item_cmd_docker_prune",      title: "Nuke dangling Docker state",  itemTypeId: "type_command", collectionId: "col_terminal_commands", isFavorite: false, isPinned: false },
  { id: "item_cmd_kill_port",         title: "Kill whatever is on :3000",   itemTypeId: "type_command", collectionId: "col_terminal_commands", isFavorite: false, isPinned: false },
  { id: "item_cmd_npm_outdated",      title: "List outdated npm packages",  itemTypeId: "type_command", collectionId: "col_terminal_commands", isFavorite: false, isPinned: false },
  { id: "item_link_tailwind",         title: "Tailwind CSS Docs",           itemTypeId: "type_link",    collectionId: "col_design_resources",  isFavorite: false, isPinned: false },
  { id: "item_link_shadcn",           title: "shadcn/ui",                   itemTypeId: "type_link",    collectionId: "col_design_resources",  isFavorite: false, isPinned: false },
  { id: "item_link_material_design",  title: "Material Design 3",           itemTypeId: "type_link",    collectionId: "col_design_resources",  isFavorite: false, isPinned: false },
  { id: "item_link_lucide",           title: "Lucide Icons",                itemTypeId: "type_link",    collectionId: "col_design_resources",  isFavorite: false, isPinned: false },
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
