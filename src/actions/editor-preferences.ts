"use server";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/user";
import { editorPreferencesSchema } from "@/lib/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";

export type UpdateEditorPreferencesResult =
  | { success: true; data: EditorPreferences }
  | { success: false; error: string };

export async function updateEditorPreferences(
  payload: EditorPreferences,
): Promise<UpdateEditorPreferencesResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to update editor preferences.",
      };
    }

    const parsed = editorPreferencesSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid editor preferences." };
    }

    const preferences = await updateEditorPreferencesInDb(
      session.user.id,
      parsed.data,
    );

    return { success: true, data: preferences };
  } catch {
    return {
      success: false,
      error: "Could not save editor preferences. Please try again.",
    };
  }
}
