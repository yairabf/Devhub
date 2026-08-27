/**
 * Per-type accent colors. Each pair is `<light-shade> dark:<dark-shade>` —
 * the dark shade is the original palette (tuned and shipped against the dark
 * background); the light shade is a darker step of the same hue, picked so
 * text/dot/border usages clear WCAG contrast against a light background too.
 * `type_file` (gray-500) and the soft-bg tint already pass in both themes, so
 * they carry no light-mode override.
 */
const TYPE_LEFT_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-l-blue-600 dark:border-l-blue-500",
  type_prompt: "border-l-purple-600 dark:border-l-purple-500",
  type_command: "border-l-orange-700 dark:border-l-orange-500",
  type_note: "border-l-yellow-700 dark:border-l-yellow-400",
  type_link: "border-l-emerald-700 dark:border-l-emerald-500",
  type_file: "border-l-gray-500",
  type_image: "border-l-pink-600 dark:border-l-pink-500",
};

const TYPE_DOT_CLASS: Record<string, string> = {
  type_snippet: "bg-blue-600 dark:bg-blue-500",
  type_prompt: "bg-purple-600 dark:bg-purple-500",
  type_command: "bg-orange-700 dark:bg-orange-500",
  type_note: "bg-yellow-700 dark:bg-yellow-400",
  type_link: "bg-emerald-700 dark:bg-emerald-500",
  type_file: "bg-gray-500",
  type_image: "bg-pink-600 dark:bg-pink-500",
};

const TYPE_TOP_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-t-blue-600 dark:border-t-blue-500",
  type_prompt: "border-t-purple-600 dark:border-t-purple-500",
  type_command: "border-t-orange-700 dark:border-t-orange-500",
  type_note: "border-t-yellow-700 dark:border-t-yellow-400",
  type_link: "border-t-emerald-700 dark:border-t-emerald-500",
  type_file: "border-t-gray-500",
  type_image: "border-t-pink-600 dark:border-t-pink-500",
};

const TYPE_SOFT_BG_CLASS: Record<string, string> = {
  type_snippet: "bg-blue-500/10",
  type_prompt: "bg-purple-500/10",
  type_command: "bg-orange-500/10",
  type_note: "bg-yellow-400/10",
  type_link: "bg-emerald-500/10",
  type_file: "bg-gray-500/10",
  type_image: "bg-pink-500/10",
};

const TYPE_TEXT_CLASS: Record<string, string> = {
  type_snippet: "text-blue-600 dark:text-blue-500",
  type_prompt: "text-purple-600 dark:text-purple-500",
  type_command: "text-orange-700 dark:text-orange-500",
  type_note: "text-yellow-700 dark:text-yellow-400",
  type_link: "text-emerald-700 dark:text-emerald-500",
  type_file: "text-gray-500",
  type_image: "text-pink-600 dark:text-pink-500",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  type_snippet: "border-blue-600/40 text-blue-600 dark:border-blue-500/40 dark:text-blue-500",
  type_prompt: "border-purple-600/40 text-purple-600 dark:border-purple-500/40 dark:text-purple-500",
  type_command: "border-orange-700/40 text-orange-700 dark:border-orange-500/40 dark:text-orange-500",
  type_note: "border-yellow-700/40 text-yellow-700 dark:border-yellow-400/40 dark:text-yellow-400",
  type_link: "border-emerald-700/40 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-500",
  type_file: "border-gray-500/40 text-gray-500",
  type_image: "border-pink-600/40 text-pink-600 dark:border-pink-500/40 dark:text-pink-500",
};

export function getTypeLeftBorderClass(typeId: string | null): string {
  if (!typeId) return "border-l-border";
  return TYPE_LEFT_BORDER_CLASS[typeId] ?? "border-l-border";
}

export function getTypeDotClass(typeId: string | null): string {
  if (!typeId) return "bg-muted-foreground";
  return TYPE_DOT_CLASS[typeId] ?? "bg-muted-foreground";
}

export function getTypeTextClass(typeId: string | null): string {
  if (!typeId) return "text-muted-foreground";
  return TYPE_TEXT_CLASS[typeId] ?? "text-muted-foreground";
}

export function getTypeBadgeClass(typeId: string | null): string {
  if (!typeId) return "border-border text-foreground";
  return TYPE_BADGE_CLASS[typeId] ?? "border-border text-foreground";
}

export function getTypeTopBorderClass(typeId: string | null): string {
  if (!typeId) return "border-t-border";
  return TYPE_TOP_BORDER_CLASS[typeId] ?? "border-t-border";
}

export function getTypeSoftBgClass(typeId: string | null): string {
  if (!typeId) return "bg-muted";
  return TYPE_SOFT_BG_CLASS[typeId] ?? "bg-muted";
}
