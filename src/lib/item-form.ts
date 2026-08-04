import type { UpdateItemPayload } from "@/actions/items";
import type { ItemDetailData } from "@/lib/db/items";

/** Types whose body is free text the user edits directly. */
const TYPES_WITH_CONTENT = new Set([
  "type_snippet",
  "type_prompt",
  "type_command",
  "type_note",
]);
const TYPES_WITH_LANGUAGE = new Set(["type_snippet", "type_command"]);
const TYPES_WITH_URL = new Set(["type_link"]);

export interface EditableFields {
  content: boolean;
  language: boolean;
  url: boolean;
}

/** Which type-specific inputs the edit form shows for this item type. */
export function getEditableFields(itemTypeId: string): EditableFields {
  return {
    content: TYPES_WITH_CONTENT.has(itemTypeId),
    language: TYPES_WITH_LANGUAGE.has(itemTypeId),
    url: TYPES_WITH_URL.has(itemTypeId),
  };
}

/** Raw form state — every field is a string, tags still comma-separated. */
export interface ItemDraft {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

/**
 * Turns form state into the action payload. Fields the form does not show for
 * this type are carried over from the stored item so saving never clears them.
 */
export function buildUpdatePayload(
  item: ItemDetailData,
  draft: ItemDraft,
): UpdateItemPayload {
  const fields = getEditableFields(item.itemTypeId);

  return {
    title: draft.title,
    description: draft.description,
    content: fields.content ? draft.content : item.content,
    language: fields.language ? draft.language : item.language,
    url: fields.url ? draft.url : item.url,
    tags: draft.tags.split(","),
  };
}
