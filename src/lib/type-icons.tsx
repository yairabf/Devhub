import { createElement } from "react";
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

const TYPE_NAMES: Record<string, string> = {
  type_snippet: "Snippet",
  type_prompt: "Prompt",
  type_command: "Command",
  type_note: "Note",
  type_link: "Link",
  type_file: "File",
  type_image: "Image",
};

/**
 * Display name for a system type id. Some surfaces only carry the id, and the
 * raw `type_prompt` must never reach a label, a title, or the a11y tree.
 */
export function getTypeName(typeId: string): string {
  return TYPE_NAMES[typeId] ?? "Item";
}

/**
 * Renders a type's icon without binding it to a local component variable,
 * which would reset state on every render (react-hooks/static-components).
 */
export function TypeGlyph({
  typeId,
  className,
}: {
  typeId: string;
  className?: string;
}) {
  return createElement(getTypeIcon(typeId), { className, "aria-hidden": true });
}
