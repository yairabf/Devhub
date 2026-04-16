export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  title: string;
  contentType: "text" | "file";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  description?: string;
  isFavorite: boolean;
  isPinned: boolean;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  itemTypeId: string;
  itemType: ItemType;
  collectionIds: string[];
  tags: Tag[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  itemIds: string[];
}

export const CURRENT_USER: User = {
  id: "user_1",
  name: "Alex Rivera",
  email: "alex@devlevlab.io",
  isPro: false,
};

export const ITEM_TYPES: ItemType[] = [
  { id: "type_snippet", name: "Snippet", icon: "</>",  color: "#3b82f6", isSystem: true },
  { id: "type_prompt",  name: "Prompt",  icon: "✨",   color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "Command", icon: "⌘",    color: "#f97316", isSystem: true },
  { id: "type_note",    name: "Note",    icon: "📝",   color: "#fde047", isSystem: true },
  { id: "type_link",    name: "Link",    icon: "🔗",   color: "#10b981", isSystem: true },
  { id: "type_file",    name: "File",    icon: "📄",   color: "#6b7280", isSystem: true },
  { id: "type_image",   name: "Image",   icon: "🖼️",  color: "#ec4899", isSystem: true },
];

const [SNIPPET, PROMPT, COMMAND, NOTE, LINK] = ITEM_TYPES;

export const ITEMS: Item[] = [
  {
    id: "item_1",
    title: "useDebounce Hook",
    contentType: "text",
    description: "Custom React hook for debouncing values",
    content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-10"),
    userId: "user_1",
    itemTypeId: "type_snippet",
    itemType: SNIPPET,
    collectionIds: ["col_1"],
    tags: [{ id: "tag_1", name: "react" }, { id: "tag_2", name: "hooks" }],
  },
  {
    id: "item_2",
    title: "Docker Compose Up",
    contentType: "text",
    description: "Start all services in detached mode",
    content: "docker compose up -d --build",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-02"),
    updatedAt: new Date("2026-04-02"),
    userId: "user_1",
    itemTypeId: "type_command",
    itemType: COMMAND,
    collectionIds: ["col_2"],
    tags: [{ id: "tag_3", name: "docker" }, { id: "tag_4", name: "devops" }],
  },
  {
    id: "item_3",
    title: "Code Review Prompt",
    contentType: "text",
    description: "Senior dev code review system prompt",
    content: `You are a senior software engineer performing a code review. Analyze the following code for:
- Correctness and edge cases
- Performance issues
- Security vulnerabilities
- Code clarity and maintainability
- Adherence to best practices

Provide structured feedback with specific line references where applicable.`,
    isFavorite: true,
    isPinned: false,
    createdAt: new Date("2026-04-03"),
    updatedAt: new Date("2026-04-12"),
    userId: "user_1",
    itemTypeId: "type_prompt",
    itemType: PROMPT,
    collectionIds: ["col_4"],
    tags: [{ id: "tag_5", name: "ai" }, { id: "tag_6", name: "review" }],
  },
  {
    id: "item_4",
    title: "Next.js App Router Setup",
    contentType: "text",
    description: "Starter file structure for App Router projects",
    content: `src/
  app/
    layout.tsx
    page.tsx
    (auth)/
      login/page.tsx
  components/
  lib/
  actions/`,
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-04"),
    updatedAt: new Date("2026-04-04"),
    userId: "user_1",
    itemTypeId: "type_note",
    itemType: NOTE,
    collectionIds: ["col_3"],
    tags: [{ id: "tag_7", name: "nextjs" }],
  },
  {
    id: "item_5",
    title: "Tailwind CSS v4 Docs",
    contentType: "text",
    description: "Official Tailwind CSS v4 documentation",
    url: "https://tailwindcss.com/docs",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-05"),
    updatedAt: new Date("2026-04-05"),
    userId: "user_1",
    itemTypeId: "type_link",
    itemType: LINK,
    collectionIds: ["col_3"],
    tags: [{ id: "tag_8", name: "tailwind" }, { id: "tag_7", name: "nextjs" }],
  },
  {
    id: "item_6",
    title: "Git Force Push Safe",
    contentType: "text",
    description: "Force push with lease — safer than --force",
    content: "git push --force-with-lease origin HEAD",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-06"),
    updatedAt: new Date("2026-04-06"),
    userId: "user_1",
    itemTypeId: "type_command",
    itemType: COMMAND,
    collectionIds: ["col_2"],
    tags: [{ id: "tag_9", name: "git" }],
  },
  {
    id: "item_7",
    title: "System Prompt – Explain Code",
    contentType: "text",
    description: "AI prompt for clear code explanations",
    content: `Explain the following code to a mid-level developer. Be concise but thorough. Cover what it does, how it works, and any gotchas or non-obvious behavior.`,
    isFavorite: true,
    isPinned: false,
    createdAt: new Date("2026-04-07"),
    updatedAt: new Date("2026-04-07"),
    userId: "user_1",
    itemTypeId: "type_prompt",
    itemType: PROMPT,
    collectionIds: ["col_4"],
    tags: [{ id: "tag_5", name: "ai" }],
  },
  {
    id: "item_8",
    title: "Big O Cheat Sheet",
    contentType: "text",
    description: "Time complexity reference for common operations",
    content: `Array access: O(1)
Array search: O(n)
Array insert/delete (end): O(1)
Array insert/delete (middle): O(n)
HashMap get/set: O(1) avg
Binary search: O(log n)
Sorting (avg): O(n log n)`,
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-08"),
    updatedAt: new Date("2026-04-08"),
    userId: "user_1",
    itemTypeId: "type_note",
    itemType: NOTE,
    collectionIds: ["col_5"],
    tags: [{ id: "tag_10", name: "algorithms" }],
  },
  {
    id: "item_9",
    title: "useFetch Hook",
    contentType: "text",
    description: "Generic data fetching hook with loading and error states",
    content: `import { useState, useEffect } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-09"),
    updatedAt: new Date("2026-04-09"),
    userId: "user_1",
    itemTypeId: "type_snippet",
    itemType: SNIPPET,
    collectionIds: ["col_1"],
    tags: [{ id: "tag_1", name: "react" }, { id: "tag_2", name: "hooks" }],
  },
  {
    id: "item_10",
    title: "Interview: Flatten Array",
    contentType: "text",
    description: "Recursive and iterative solutions for flattening nested arrays",
    content: `// Recursive
function flatten(arr: unknown[]): unknown[] {
  return arr.reduce<unknown[]>((acc, val) =>
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}

// Built-in
const flat = arr.flat(Infinity);`,
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-10"),
    userId: "user_1",
    itemTypeId: "type_snippet",
    itemType: SNIPPET,
    collectionIds: ["col_5"],
    tags: [{ id: "tag_10", name: "algorithms" }, { id: "tag_11", name: "interview" }],
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Reusable React hooks, components and utilities",
    isFavorite: true,
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-10"),
    userId: "user_1",
    itemIds: ["item_1", "item_9"],
  },
  {
    id: "col_2",
    name: "DevOps Toolkit",
    description: "Docker, CI/CD commands and infra notes",
    isFavorite: false,
    createdAt: new Date("2026-04-02"),
    updatedAt: new Date("2026-04-06"),
    userId: "user_1",
    itemIds: ["item_2", "item_6"],
  },
  {
    id: "col_3",
    name: "Next.js Boilerplate",
    description: "Starter patterns and deployment commands",
    isFavorite: false,
    createdAt: new Date("2026-04-03"),
    updatedAt: new Date("2026-04-05"),
    userId: "user_1",
    itemIds: ["item_4", "item_5"],
  },
  {
    id: "col_4",
    name: "AI Prompts",
    description: "System prompts and reusable AI workflows",
    isFavorite: true,
    createdAt: new Date("2026-04-04"),
    updatedAt: new Date("2026-04-12"),
    userId: "user_1",
    itemIds: ["item_3", "item_7"],
  },
  {
    id: "col_5",
    name: "Interview Prep",
    description: "Resources, notes, and algorithms practice",
    isFavorite: false,
    createdAt: new Date("2026-04-05"),
    updatedAt: new Date("2026-04-10"),
    userId: "user_1",
    itemIds: ["item_8", "item_10"],
  },
];

export function getItemsByCollection(collectionId: string): Item[] {
  const collection = COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return [];
  return ITEMS.filter(item => collection.itemIds.includes(item.id));
}

export function getPinnedItems(): Item[] {
  return ITEMS.filter(item => item.isPinned);
}

export function getFavoriteItems(): Item[] {
  return ITEMS.filter(item => item.isFavorite);
}

export function getRecentItems(limit = 5): Item[] {
  return [...ITEMS]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}
