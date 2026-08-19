"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  toggleCollectionFavorite as toggleCollectionFavoriteInDb,
  updateCollection as updateCollectionInDb,
  type CollectionCardData,
  type CollectionMeta,
} from "@/lib/db/collections";

/** An empty description from the form means "not set", which the DB stores as null. */
const nullableText = z
  .string()
  .trim()
  .transform(value => (value === "" ? null : value))
  .nullable()
  .default(null);

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: nullableText,
});

export type CreateCollectionPayload = z.input<typeof createCollectionSchema>;

export type CreateCollectionResult =
  | { success: true; data: CollectionCardData }
  | { success: false; error: string };

export async function createCollection(
  payload: CreateCollectionPayload,
): Promise<CreateCollectionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to create collections.",
      };
    }

    const parsed = createCollectionSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? "Invalid input" };
    }

    // The owner comes from the session, never from the payload.
    const collection = await createCollectionInDb(session.user.id, parsed.data);

    return { success: true, data: collection };
  } catch {
    return {
      success: false,
      error: "Could not create this collection. Please try again.",
    };
  }
}

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: nullableText,
});

export type UpdateCollectionPayload = z.input<typeof updateCollectionSchema>;

export type UpdateCollectionResult =
  | { success: true; data: CollectionMeta }
  | { success: false; error: string };

export async function updateCollection(
  collectionId: string,
  payload: UpdateCollectionPayload,
): Promise<UpdateCollectionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to edit collections.",
      };
    }

    const parsed = updateCollectionSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? "Invalid input" };
    }

    const collection = await updateCollectionInDb(
      session.user.id,
      collectionId,
      parsed.data,
    );
    if (!collection) {
      return { success: false, error: "Collection not found." };
    }

    return { success: true, data: collection };
  } catch {
    return {
      success: false,
      error: "Could not save this collection. Please try again.",
    };
  }
}

export type ToggleCollectionFavoriteResult =
  | { success: true; data: { isFavorite: boolean } }
  | { success: false; error: string };

export async function toggleCollectionFavorite(
  collectionId: string,
): Promise<ToggleCollectionFavoriteResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to favorite collections.",
      };
    }

    if (!collectionId?.trim()) {
      return { success: false, error: "Collection not found." };
    }

    const isFavorite = await toggleCollectionFavoriteInDb(
      session.user.id,
      collectionId,
    );
    if (isFavorite === null) {
      return { success: false, error: "Collection not found." };
    }

    return { success: true, data: { isFavorite } };
  } catch {
    return {
      success: false,
      error: "Could not update this collection. Please try again.",
    };
  }
}

export type DeleteCollectionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCollection(
  collectionId: string,
): Promise<DeleteCollectionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to delete collections.",
      };
    }

    if (!collectionId?.trim()) {
      return { success: false, error: "Collection not found." };
    }

    const deleted = await deleteCollectionInDb(session.user.id, collectionId);
    if (!deleted) {
      return { success: false, error: "Collection not found." };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Could not delete this collection. Please try again.",
    };
  }
}
