import type { CreateItemPayload, UpdateItemPayload } from "@/actions/items";
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

export const LINK_TYPE_ID = "type_link";

/**
 * System types a user can create from the New Item dialog, in the order the
 * selector shows them — most-reached-for first, which is also the spec's order.
 * File and image are Pro-only uploads with their own flow, so they are excluded.
 * The DB returns types alphabetically, so this array is what fixes the order.
 */
export const CREATABLE_TYPE_IDS = [
  "type_snippet",
  "type_prompt",
  "type_command",
  "type_note",
  LINK_TYPE_ID,
] as const;

export function isCreatableType(itemTypeId: string): boolean {
  return (CREATABLE_TYPE_IDS as readonly string[]).includes(itemTypeId);
}

/**
 * Keeps only creatable types and puts them in selector order. Types missing
 * from the database are simply absent rather than breaking the order.
 */
export function orderCreatableTypes<T extends { id: string }>(types: T[]): T[] {
  return CREATABLE_TYPE_IDS.map(id =>
    types.find(type => type.id === id),
  ).filter((type): type is T => type !== undefined);
}

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

/**
 * Turns form state into the create payload. Unlike the update builder there is
 * no stored item to fall back on, so fields this type does not use are sent as
 * null rather than carried over.
 */
export function buildCreatePayload(
  itemTypeId: string,
  draft: ItemDraft,
): CreateItemPayload {
  const fields = getEditableFields(itemTypeId);

  return {
    itemTypeId,
    title: draft.title,
    description: draft.description,
    content: fields.content ? draft.content : null,
    language: fields.language ? draft.language : null,
    url: fields.url ? draft.url : null,
    tags: draft.tags.split(","),
  };
}
