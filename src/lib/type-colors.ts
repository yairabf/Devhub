const TYPE_BORDER_CLASS: Record<string, string> = {
  type_snippet: "border-blue-500/60",
  type_prompt: "border-purple-500/60",
  type_command: "border-orange-500/60",
  type_note: "border-yellow-400/60",
  type_link: "border-emerald-500/60",
  type_file: "border-gray-500/60",
  type_image: "border-pink-500/60",
};

export function getTypeBorderClass(typeId: string | null): string {
  if (!typeId) return "border-border";
  return TYPE_BORDER_CLASS[typeId] ?? "border-border";
}
