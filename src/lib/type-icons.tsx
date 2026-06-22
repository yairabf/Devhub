import {
  Code2,
  FileText,
  ImageIcon,
  Link2,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  type_snippet: Code2,
  type_prompt: Sparkles,
  type_command: Terminal,
  type_note: StickyNote,
  type_link: Link2,
  type_file: FileText,
  type_image: ImageIcon,
};

export function getTypeIcon(typeId: string): LucideIcon {
  return TYPE_ICONS[typeId] ?? FileText;
}
