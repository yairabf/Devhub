"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  deleteItem as deleteItemInDb,
  updateItem as updateItemInDb,
  type ItemDetailData,
} from "@/lib/db/items";

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

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: nullableText,
  content: nullableBody,
  language: nullableText,
  url: nullableText.refine(
    value => value === null || z.string().url().safeParse(value).success,
    "Enter a valid URL",
  ),
  tags: z
    .array(z.string())
    .default([])
    .transform(names => [
      ...new Set(names.map(name => name.trim()).filter(Boolean)),
    ]),
});

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

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in to delete items." };
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
