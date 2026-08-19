import type { Prisma } from "@/generated/prisma/client";
import { parseEditorPreferences } from "@/lib/editor-preferences";
import { prisma } from "@/lib/prisma";
import type { EditorPreferences } from "@/types/editor-preferences";

export async function getEditorPreferences(
  userId: string,
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });
  return parseEditorPreferences(user?.editorPreferences);
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences,
): Promise<EditorPreferences> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: preferences as unknown as Prisma.InputJsonValue },
    select: { editorPreferences: true },
  });
  return parseEditorPreferences(updated.editorPreferences);
}
