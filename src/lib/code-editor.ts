/**
 * Geometry shared by the code editor and its loading placeholder.
 *
 * These live outside both components on purpose: `CodeEditor` only imports the
 * Monaco surface dynamically, so importing a constant from that module would
 * drag monaco into the parent chunk and undo the lazy load.
 */

/** Tall enough to still look like an editor for a one-line command. */
export const EDITOR_MIN_HEIGHT = 56;
/** Per spec: the box grows with its content and stops here. */
export const EDITOR_MAX_HEIGHT = 400;
/** Monaco's configured line height and vertical padding. */
export const EDITOR_LINE_HEIGHT = 20;
export const EDITOR_VERTICAL_PADDING = 20;

/** Clamps a measured or estimated height into the editor's range. */
export function clampEditorHeight(height: number): number {
  return Math.min(Math.max(height, EDITOR_MIN_HEIGHT), EDITOR_MAX_HEIGHT);
}

/**
 * The height Monaco will most likely settle on, from the line count alone —
 * used to size the placeholder so the box does not collapse and jump while the
 * editor chunk loads. An estimate, not a measurement: it assumes no wrapping,
 * which holds because the editor scrolls horizontally instead.
 */
export function estimateEditorHeight(value: string): number {
  const lines = value ? value.split("\n").length : 1;
  return clampEditorHeight(
    lines * EDITOR_LINE_HEIGHT + EDITOR_VERTICAL_PADDING,
  );
}
