/**
 * Font sizes are capped at 16: `EDITOR_LINE_HEIGHT` (src/lib/code-editor.ts)
 * is a fixed 20px, and anything larger starts crowding the line box.
 */
export const EDITOR_FONT_SIZES = [12, 13, 14, 16] as const;
export const EDITOR_TAB_SIZES = [2, 4, 8] as const;
export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorFontSize = (typeof EDITOR_FONT_SIZES)[number];
export type EditorTabSize = (typeof EDITOR_TAB_SIZES)[number];
export type EditorTheme = (typeof EDITOR_THEMES)[number];

export interface EditorPreferences {
  fontSize: EditorFontSize;
  tabSize: EditorTabSize;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

/**
 * `vs-dark` reproduces today's behavior exactly (the editor follows the app's
 * own light/dark theme) — see `getMonacoTheme` in code-editor.ts for how the
 * other two options override that instead of falling back to it.
 */
export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};
