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

export function getTypeLeftBorderClass(typeId: string | null): string {
  if (!typeId) return "border-l-border";
  return TYPE_LEFT_BORDER_CLASS[typeId] ?? "border-l-border";
}

export function getTypeDotClass(typeId: string | null): string {
  if (!typeId) return "bg-muted-foreground";
  return TYPE_DOT_CLASS[typeId] ?? "bg-muted-foreground";
}
