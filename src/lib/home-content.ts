import {
  Code2,
  FileText,
  FolderOpen,
  Search,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/**
 * The homepage borrows the item-type accent palette for decoration. `accentTypeId`
 * only picks a colour — it does not claim the surface is an item of that type.
 */
export interface HomeFeature {
  title: string;
  description: string;
  icon: LucideIcon;
  accentTypeId: string;
}

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: "Code Snippets",
    description:
      "Syntax-highlighted blocks with language detection. Stop rewriting the same hook for the fourth time.",
    icon: Code2,
    accentTypeId: "type_snippet",
  },
  {
    title: "AI Prompts",
    description:
      "Version your system messages and prompt templates. The good ones are worth keeping.",
    icon: Sparkles,
    accentTypeId: "type_prompt",
  },
  {
    title: "Instant Search",
    description:
      "Fuzzy search across titles, content, tags and types. Hit ⌘K from anywhere and start typing.",
    icon: Search,
    accentTypeId: "type_link",
  },
  {
    title: "Commands",
    description:
      "That one-liner you found at 2am and never wrote down. Now it has a home.",
    icon: Terminal,
    accentTypeId: "type_command",
  },
  {
    title: "Files & Docs",
    description:
      "Upload context files, diagrams and assets. Attach them to the work they belong to.",
    icon: FileText,
    accentTypeId: "type_file",
  },
  {
    title: "Collections",
    description:
      "Group anything with anything. An item can live in as many collections as it needs to.",
    icon: FolderOpen,
    accentTypeId: "type_image",
  },
];

export const AI_CAPABILITIES = [
  "Auto-tagging from content and language",
  "One-line summaries for long notes",
  "Plain-English code explanation",
  "Prompt optimization and rewriting",
  "Suggested collections for new items",
];

/** Tags in the AI demo are freeform tags, not item types — their colours are decorative. */
export const AI_DEMO_TAGS = [
  { label: "react", className: "border-blue-500/40 bg-blue-500/10 text-blue-500" },
  { label: "typescript", className: "border-blue-500/40 bg-blue-500/10 text-blue-500" },
  { label: "hooks", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" },
  { label: "debounce", className: "border-orange-500/40 bg-orange-500/10 text-orange-500" },
  { label: "performance", className: "border-purple-500/40 bg-purple-500/10 text-purple-500" },
];

export interface PlanFeature {
  label: string;
  included: boolean;
}

export const FREE_PLAN_FEATURES: PlanFeature[] = [
  { label: "50 items", included: true },
  { label: "3 collections", included: true },
  { label: "Snippets, prompts, notes, commands, links", included: true },
  { label: "Instant search & tags", included: true },
  { label: "File & image uploads", included: false },
  { label: "AI features", included: false },
];

export const PRO_PLAN_FEATURES: PlanFeature[] = [
  { label: "Unlimited items & collections", included: true },
  { label: "File & image uploads", included: true },
  { label: "AI auto-tagging & summaries", included: true },
  { label: "Code explanation & prompt optimization", included: true },
  { label: "Custom item types", included: true },
  { label: "Import & export tools", included: true },
];

export type BillingCycle = "monthly" | "yearly";

export interface ProPricing {
  amount: string;
  per: string;
  note: string;
}

export const PRO_PRICING: Record<BillingCycle, ProPricing> = {
  monthly: { amount: "$8", per: "/month", note: "Billed monthly" },
  yearly: {
    amount: "$72",
    per: "/year",
    note: "Billed yearly — $6/month, save $24",
  },
};

/**
 * Sidebar rows in the preview mirror the real sidebar, which marks each row with a
 * type-coloured dot; `dotTypeId` picks the colour out of the app's own palette.
 */
export const PREVIEW_NAV = [
  { label: "Dashboard", dotTypeId: "type_snippet", active: true },
  { label: "Favorites", dotTypeId: "type_prompt", active: false },
  { label: "Collections", dotTypeId: "type_command", active: false },
  { label: "Recent", dotTypeId: "type_note", active: false },
  { label: "Tags", dotTypeId: "type_link", active: false },
];

export interface PreviewCard {
  typeId: string;
  typeName: string;
  title: string;
  meta: string;
}

export const PREVIEW_CARDS: PreviewCard[] = [
  { typeId: "type_snippet", typeName: "Snippet", title: "useDebounce.ts", meta: "react · hooks" },
  { typeId: "type_prompt", typeName: "Prompt", title: "Code Reviewer", meta: "ai · review" },
  { typeId: "type_command", typeName: "Command", title: "docker prune", meta: "cli · docker" },
  { typeId: "type_note", typeName: "Note", title: "Deploy runbook", meta: "ops · infra" },
  { typeId: "type_link", typeName: "Link", title: "Tailwind docs", meta: "css · ref" },
  { typeId: "type_image", typeName: "Image", title: "arch-diagram", meta: "design" },
];

/** Only routes that exist — the mockup's placeholder columns are deliberately dropped. */
export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/register" },
    ],
  },
];
