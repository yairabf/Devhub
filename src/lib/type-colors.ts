const TYPE_LEFT_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-l-blue-500",
  type_prompt: "border-l-purple-500",
  type_command: "border-l-orange-500",
  type_note: "border-l-yellow-400",
  type_link: "border-l-emerald-500",
  type_file: "border-l-gray-500",
  type_image: "border-l-pink-500",
};

const TYPE_DOT_CLASS: Record<string, string> = {
  type_snippet: "bg-blue-500",
  type_prompt: "bg-purple-500",
  type_command: "bg-orange-500",
  type_note: "bg-yellow-400",
  type_link: "bg-emerald-500",
  type_file: "bg-gray-500",
  type_image: "bg-pink-500",
};

const TYPE_TOP_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-t-blue-500",
  type_prompt: "border-t-purple-500",
  type_command: "border-t-orange-500",
  type_note: "border-t-yellow-400",
  type_link: "border-t-emerald-500",
  type_file: "border-t-gray-500",
  type_image: "border-t-pink-500",
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
  type_snippet: "text-blue-500",
  type_prompt: "text-purple-500",
  type_command: "text-orange-500",
  type_note: "text-yellow-400",
  type_link: "text-emerald-500",
  type_file: "text-gray-500",
  type_image: "text-pink-500",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  type_snippet: "border-blue-500/40 text-blue-500",
  type_prompt: "border-purple-500/40 text-purple-500",
  type_command: "border-orange-500/40 text-orange-500",
  type_note: "border-yellow-400/40 text-yellow-400",
  type_link: "border-emerald-500/40 text-emerald-500",
  type_file: "border-gray-500/40 text-gray-500",
  type_image: "border-pink-500/40 text-pink-500",
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
