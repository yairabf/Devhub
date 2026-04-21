export interface SystemItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SeedCollection {
  id: string;
  name: string;
  description: string;
  isFavorite?: boolean;
}

export interface SeedItem {
  id: string;
  collectionId: string;
  itemTypeId: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

export const SYSTEM_ITEM_TYPES: SystemItemType[] = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280" },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "type_link", name: "link", icon: "Link", color: "#10b981" },
];

export const COLLECTIONS: SeedCollection[] = [
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
  },
  {
    id: "col_terminal_commands",
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
  },
  {
    id: "col_design_resources",
    name: "Design Resources",
    description: "UI/UX resources and references",
  },
];

export const ITEMS: SeedItem[] = [
  // --- React Patterns (3 TypeScript snippets) ---
  {
    id: "item_use_debounce",
    collectionId: "col_react_patterns",
    itemTypeId: "type_snippet",
    title: "useDebounce Hook",
    description: "Debounce a rapidly-changing value (typing, resizing, etc.)",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "item_theme_provider",
    collectionId: "col_react_patterns",
    itemTypeId: "type_snippet",
    title: "Theme Context Provider",
    description: "Minimal theme context with a typed useTheme hook",
    language: "typescript",
    content: `import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeCtx { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const value = useMemo<ThemeCtx>(
    () => ({ theme, toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")) }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}`,
  },
  {
    id: "item_cn_utility",
    collectionId: "col_react_patterns",
    itemTypeId: "type_snippet",
    title: "cn() Class Merger",
    description: "Tailwind-aware className merger used across shadcn components",
    language: "typescript",
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}`,
  },

  // --- AI Workflows (3 prompts) ---
  {
    id: "item_prompt_code_review",
    collectionId: "col_ai_workflows",
    itemTypeId: "type_prompt",
    title: "Senior Code Review",
    description: "System prompt for a rigorous, structured code review",
    isFavorite: true,
    content: `You are a staff engineer performing a code review. For the diff below, produce feedback organised as:

1. Correctness & edge cases — bugs, off-by-ones, race conditions, missed inputs.
2. Security — injection, authz, secrets, unsafe deserialisation.
3. Performance — algorithmic complexity, N+1 queries, wasted allocations, re-renders.
4. Clarity & maintainability — naming, structure, duplication, missing tests.

Cite specific line numbers. Flag the top three issues first. If the code is fine, say so plainly — do not invent problems.`,
  },
  {
    id: "item_prompt_docs_generation",
    collectionId: "col_ai_workflows",
    itemTypeId: "type_prompt",
    title: "Generate Module Docs",
    description: "Produce README-style documentation from source files",
    content: `Read the source files I provide and produce concise documentation in Markdown. Include:

- A one-paragraph overview of what the module does and why it exists.
- A "Public API" section listing exported functions/classes with their signatures and one-line descriptions.
- A "Usage" section with a minimal, runnable example.
- A "Gotchas" section only if there is something non-obvious; otherwise omit it.

Do not paraphrase the code line-by-line. Do not invent capabilities that are not in the source.`,
  },
  {
    id: "item_prompt_refactor",
    collectionId: "col_ai_workflows",
    itemTypeId: "type_prompt",
    title: "Refactoring Assistant",
    description: "Surgical, behaviour-preserving refactors with justifications",
    content: `Refactor the code below while preserving its observable behaviour. Before writing code:

1. List the concrete smells you see (long function, unclear names, duplicated branches, etc.).
2. Propose the smallest set of changes that addresses them.

Then produce the refactored code. Keep the public API stable unless I explicitly ask otherwise. Do not introduce new dependencies. Do not add speculative abstractions for "future flexibility".`,
  },

  // --- DevOps (1 snippet + 1 command + 2 links) ---
  {
    id: "item_dockerfile_node",
    collectionId: "col_devops",
    itemTypeId: "type_snippet",
    title: "Multi-stage Node Dockerfile",
    description: "Slim production image for a Node/Next.js app",
    language: "dockerfile",
    content: `# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]`,
  },
  {
    id: "item_deploy_vercel",
    collectionId: "col_devops",
    itemTypeId: "type_command",
    title: "Deploy to Vercel (prod)",
    description: "Build and promote the current commit to production",
    content: "vercel deploy --prebuilt --prod",
  },
  {
    id: "item_link_docker_docs",
    collectionId: "col_devops",
    itemTypeId: "type_link",
    title: "Docker Documentation",
    description: "Official Docker docs — reference, guides, and manuals",
    url: "https://docs.docker.com/",
  },
  {
    id: "item_link_gh_actions",
    collectionId: "col_devops",
    itemTypeId: "type_link",
    title: "GitHub Actions Docs",
    description: "Workflow syntax, reusable workflows, and runners",
    url: "https://docs.github.com/en/actions",
  },

  // --- Terminal Commands (4) ---
  {
    id: "item_cmd_git_log_graph",
    collectionId: "col_terminal_commands",
    itemTypeId: "type_command",
    title: "Pretty git log graph",
    description: "Branch topology with abbreviated hashes, one line per commit",
    content: "git log --oneline --graph --decorate --all",
  },
  {
    id: "item_cmd_docker_prune",
    collectionId: "col_terminal_commands",
    itemTypeId: "type_command",
    title: "Nuke dangling Docker state",
    description: "Reclaim disk by removing unused containers, images, networks and volumes",
    content: "docker system prune -af --volumes",
  },
  {
    id: "item_cmd_kill_port",
    collectionId: "col_terminal_commands",
    itemTypeId: "type_command",
    title: "Kill whatever is on :3000",
    description: "Find and terminate the process holding a local port",
    content: "lsof -ti:3000 | xargs kill -9",
  },
  {
    id: "item_cmd_npm_outdated",
    collectionId: "col_terminal_commands",
    itemTypeId: "type_command",
    title: "List outdated npm packages",
    description: "Show wanted vs latest versions for every dependency",
    content: "npm outdated --long",
  },

  // --- Design Resources (4 links) ---
  {
    id: "item_link_tailwind",
    collectionId: "col_design_resources",
    itemTypeId: "type_link",
    title: "Tailwind CSS Docs",
    description: "Utility classes, theming, and v4 migration notes",
    url: "https://tailwindcss.com/docs",
  },
  {
    id: "item_link_shadcn",
    collectionId: "col_design_resources",
    itemTypeId: "type_link",
    title: "shadcn/ui",
    description: "Copy-in React components built on Radix + Tailwind",
    url: "https://ui.shadcn.com/",
  },
  {
    id: "item_link_material_design",
    collectionId: "col_design_resources",
    itemTypeId: "type_link",
    title: "Material Design 3",
    description: "Google's design system — foundations, components, tokens",
    url: "https://m3.material.io/",
  },
  {
    id: "item_link_lucide",
    collectionId: "col_design_resources",
    itemTypeId: "type_link",
    title: "Lucide Icons",
    description: "Open-source icon set used throughout this app",
    url: "https://lucide.dev/",
  },
];
