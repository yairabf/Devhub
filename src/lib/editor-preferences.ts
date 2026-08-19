import { z } from "zod";

import {
  DEFAULT_EDITOR_PREFERENCES,
  EDITOR_THEMES,
  type EditorPreferences,
} from "@/types/editor-preferences";

/**
 * Literal unions, not `z.number().refine(...)`: a refine keeps zod's inferred
 * type as plain `number`, which doesn't match `EditorFontSize`/`EditorTabSize`
 * downstream. Kept in sync with `EDITOR_FONT_SIZES`/`EDITOR_TAB_SIZES` by
 * `editor-preferences.test.ts`, which asserts every listed size validates.
 */
const fontSizeSchema = z.union([z.literal(12), z.literal(13), z.literal(14), z.literal(16)]);
const tabSizeSchema = z.union([z.literal(2), z.literal(4), z.literal(8)]);

export const editorPreferencesSchema = z.object({
  fontSize: fontSizeSchema,
  tabSize: tabSizeSchema,
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

/**
 * `editorPreferences` is a freeform Json column — a hand-edited row, a value
 * saved by an older shape of this schema, or plain `null` for a user who has
 * never opened Settings all reach here. Anything that doesn't validate falls
 * back to defaults rather than reaching Monaco with a bad option.
 */
export function parseEditorPreferences(value: unknown): EditorPreferences {
  const result = editorPreferencesSchema.safeParse(value);
  return result.success ? result.data : DEFAULT_EDITOR_PREFERENCES;
}
