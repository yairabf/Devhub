"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  type CollectionCardData,
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
