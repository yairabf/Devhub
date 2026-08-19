"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createItem as createItemInDb,
  deleteItem as deleteItemInDb,
  toggleItemFavorite as toggleItemFavoriteInDb,
  updateItem as updateItemInDb,
  type ItemDetailData,
} from "@/lib/db/items";
import { getEditableFields, isCreatableType, LINK_TYPE_ID } from "@/lib/item-form";

/** Empty strings from the form mean "cleared", which the DB stores as null. */
const nullableText = z
  .string()
  .trim()
  .transform(value => (value === "" ? null : value))
  .nullable()
  .default(null);

/**
 * Like `nullableText` but keeps whitespace verbatim — content is often code,
 * where leading indentation and trailing newlines are significant. Only a
 * blank value collapses to null.
 */
const nullableBody = z
  .string()
  .transform(value => (value.trim() === "" ? null : value))
  .nullable()
  .default(null);

const tagList = z
  .array(z.string())
  .default([])
  .transform(names => [
    ...new Set(names.map(name => name.trim()).filter(Boolean)),
  ]);

/** De-duplicated collection ids; ownership is verified in the db layer. */
const collectionIdList = z
  .array(z.string())
  .default([])
  .transform(ids => [...new Set(ids)]);

const isValidUrl = (value: string) => z.string().url().safeParse(value).success;

/** Fields both the create and update forms submit identically. */
const sharedItemFields = {
  title: z.string().trim().min(1, "Title is required"),
  description: nullableText,
  content: nullableBody,
  language: nullableText,
  tags: tagList,
  collectionIds: collectionIdList,
};

const updateItemSchema = z.object({
  ...sharedItemFields,
  url: nullableText.refine(
    value => value === null || isValidUrl(value),
    "Enter a valid URL",
  ),
});

const createItemSchema = z
  .object({
    ...sharedItemFields,
    itemTypeId: z.string(),
    url: nullableText,
  })
  .superRefine((value, ctx) => {
    if (!isCreatableType(value.itemTypeId)) {
      ctx.addIssue({
        code: "custom",
        path: ["itemTypeId"],
        message: "Choose an item type.",
      });
    }

    // Links are the one type whose URL carries the whole item.
    if (value.itemTypeId === LINK_TYPE_ID && value.url === null) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL is required for links",
      });
      return;
    }

    if (value.url !== null && !isValidUrl(value.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Enter a valid URL",
      });
    }
  });

export type CreateItemPayload = z.input<typeof createItemSchema>;

export type CreateItemResult =
  | { success: true; data: ItemDetailData }
  | { success: false; error: string };

export async function createItem(
  payload: CreateItemPayload,
): Promise<CreateItemResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to create items." };
    }

    const parsed = createItemSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? "Invalid input" };
    }

    // Drop anything the chosen type does not use, so a client sending content
    // for a link (or a URL for a note) cannot store an unreachable field.
    const fields = getEditableFields(parsed.data.itemTypeId);
    const item = await createItemInDb(session.user.id, {
      itemTypeId: parsed.data.itemTypeId,
      title: parsed.data.title,
      description: parsed.data.description,
      content: fields.content ? parsed.data.content : null,
      language: fields.language ? parsed.data.language : null,
      url: fields.url ? parsed.data.url : null,
      tags: parsed.data.tags,
      collectionIds: parsed.data.collectionIds,
    });

    return { success: true, data: item };
  } catch {
    return {
      success: false,
      error: "Could not create this item. Please try again.",
    };
  }
}

export type UpdateItemPayload = z.input<typeof updateItemSchema>;

export type UpdateItemResult =
  | { success: true; data: ItemDetailData }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  payload: UpdateItemPayload,
): Promise<UpdateItemResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to edit items." };
    }

    const parsed = updateItemSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? "Invalid input" };
    }

    const item = await updateItemInDb(session.user.id, itemId, parsed.data);
    if (!item) {
      return { success: false, error: "Item not found." };
    }

    return { success: true, data: item };
  } catch {
    return { success: false, error: "Could not save this item. Please try again." };
  }
}

export type ToggleItemFavoriteResult =
  | { success: true; data: { isFavorite: boolean } }
  | { success: false; error: string };

export async function toggleItemFavorite(
  itemId: string,
): Promise<ToggleItemFavoriteResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to favorite items." };
    }

    if (!itemId?.trim()) {
      return { success: false, error: "Item not found." };
    }

    const isFavorite = await toggleItemFavoriteInDb(session.user.id, itemId);
    if (isFavorite === null) {
      return { success: false, error: "Item not found." };
    }

    return { success: true, data: { isFavorite } };
  } catch {
    return {
      success: false,
      error: "Could not update this item. Please try again.",
    };
  }
}

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to delete items." };
    }

    // A blank id can only ever miss, so fail before spending a query on it.
    // Optional chaining guards a JS caller passing undefined.
    if (!itemId?.trim()) {
      return { success: false, error: "Item not found." };
    }

    const deleted = await deleteItemInDb(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found." };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Could not delete this item. Please try again.",
    };
  }
}
