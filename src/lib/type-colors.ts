const TYPE_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-blue-500/60",
  type_prompt: "border-purple-500/60",
  type_command: "border-orange-500/60",
  type_note: "border-yellow-400/60",
  type_link: "border-emerald-500/60",
  type_file: "border-gray-500/60",
  type_image: "border-pink-500/60",
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

export function getTypeBorderClass(typeId: string | null): string {
  if (!typeId) return "border-border";
  return TYPE_BORDER_CLASS[typeId] ?? "border-border";
}

export function getTypeDotClass(typeId: string | null): string {
  if (!typeId) return "bg-muted-foreground";
  return TYPE_DOT_CLASS[typeId] ?? "bg-muted-foreground";
}
