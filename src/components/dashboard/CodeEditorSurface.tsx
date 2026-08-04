"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Editor,
  loader,
  type OnChange,
  type OnMount,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// Side-effect imports, order-sensitive: edcore.main registers the editor
// contributions (find, bracket matching, folding…) and basic-languages
// registers every Monarch tokenizer. Deliberately *not* `editor.main`, which
// also pulls in the TypeScript/JSON/CSS/HTML language services — those spawn
// their own web workers and give a snippet store nothing but squiggly lines.
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/basic-languages/monaco.contribution";

import {
  clampEditorHeight,
  EDITOR_LINE_HEIGHT,
  EDITOR_MIN_HEIGHT,
  EDITOR_VERTICAL_PADDING,
} from "@/lib/code-editor";
import { getMonacoLanguageId } from "@/lib/code-language";

/**
 * The Monaco surface, loaded lazily and client-only by `CodeEditor` — this
 * module imports monaco at the top level, which touches `window`, so it must
 * never be evaluated during a server render.
 */

/** Hands @monaco-editor/react our bundled copy so it never fetches from a CDN. */
loader.config({ monaco });

type MonacoWindow = Window & {
  MonacoEnvironment?: { getWorker: (workerId: string, label: string) => Worker };
  monaco?: typeof monaco;
};

/**
 * Parity with a CDN-loaded Monaco: its own AMD loader assigns `window.monaco`,
 * so anything used to inspecting or driving the editor from the console (or from
 * a test) finds it in the usual place even though this copy is bundled.
 */
(window as MonacoWindow).monaco = monaco;

/**
 * Without this Monaco logs "Could not create web worker" the first time
 * anything asks the editor worker service for something. Only the base editor
 * worker is wired up, which is all that is left once the language services are
 * out of the bundle.
 */
(window as MonacoWindow).MonacoEnvironment = {
  getWorker: () =>
    new Worker(
      new URL(
        "monaco-editor/esm/vs/editor/editor.worker.js",
        import.meta.url,
      ),
      { type: "module" },
    ),
};

/**
 * Monaco parses theme colours as hex only — it cannot read the `oklch()` custom
 * properties in globals.css — so these are the hex equivalents of the app's own
 * tokens (they land on Tailwind's neutral scale exactly). Keep them in step with
 * `--muted` / `--foreground` / `--muted-foreground` if the palette moves.
 */
const DARK_COLORS = {
  "editor.background": "#262626", // --muted
  "editor.foreground": "#e5e5e5",
  "editor.lineHighlightBackground": "#ffffff0d",
  "editor.selectionBackground": "#525252",
  "editorCursor.foreground": "#fafafa",
  "editorLineNumber.foreground": "#737373",
  "editorLineNumber.activeForeground": "#e5e5e5",
  "editorWidget.background": "#171717",
  "editorWidget.border": "#404040",
  "editorSuggestWidget.background": "#171717",
  "input.background": "#262626",
  "scrollbarSlider.background": "#a1a1a133",
  "scrollbarSlider.hoverBackground": "#a1a1a166",
  "scrollbarSlider.activeBackground": "#a1a1a199",
};

const LIGHT_COLORS = {
  "editor.background": "#f5f5f5", // --muted
  "editor.foreground": "#171717",
  "editor.lineHighlightBackground": "#0000000a",
  "editor.selectionBackground": "#d4d4d4",
  "editorCursor.foreground": "#171717",
  "editorLineNumber.foreground": "#a1a1a1",
  "editorLineNumber.activeForeground": "#525252",
  "editorWidget.background": "#ffffff",
  "editorWidget.border": "#e5e5e5",
  "editorSuggestWidget.background": "#ffffff",
  "input.background": "#ffffff",
  "scrollbarSlider.background": "#73737333",
  "scrollbarSlider.hoverBackground": "#73737359",
  "scrollbarSlider.activeBackground": "#7373738c",
};

export const DARK_THEME = "devstash-dark";
export const LIGHT_THEME = "devstash-light";

monaco.editor.defineTheme(DARK_THEME, {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: DARK_COLORS,
});

monaco.editor.defineTheme(LIGHT_THEME, {
  base: "vs",
  inherit: true,
  rules: [],
  colors: LIGHT_COLORS,
});

const BASE_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  // The editor mounts inside an animating Sheet and a scrollable Dialog, both
  // of which mis-measure on first paint; this is what recovers from that.
  automaticLayout: true,
  // Without this the editor always reports a content height of max-height
  // worth of empty space below the last line, so it could never hug content.
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  fontSize: 12.5,
  lineHeight: EDITOR_LINE_HEIGHT,
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  fontLigatures: false,
  lineNumbersMinChars: 3,
  lineDecorationsWidth: 8,
  glyphMargin: false,
  folding: false,
  padding: {
    top: EDITOR_VERTICAL_PADDING / 2,
    bottom: EDITOR_VERTICAL_PADDING / 2,
  },
  tabSize: 2,
  stickyScroll: { enabled: false },
  // Monaco's own menu is an IDE menu: it offers "Command Palette", which opens
  // a quick-input widget inside the item dialog, and it renders inside the
  // editor so the dialog's own overflow clips it. Off means the browser's
  // native menu — with working Cut/Copy/Paste — appears instead.
  contextmenu: false,
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
    // Let the drawer keep scrolling once the editor is at its own boundary,
    // instead of swallowing the wheel event.
    alwaysConsumeMouseWheel: false,
  },
};

interface CodeEditorSurfaceProps {
  value: string;
  language: string | null | undefined;
  readOnly: boolean;
  theme: "light" | "dark";
  ariaLabel: string;
  onChange?: (value: string) => void;
}

export function CodeEditorSurface({
  value,
  language,
  readOnly,
  theme,
  ariaLabel,
  onChange,
}: CodeEditorSurfaceProps) {
  const [height, setHeight] = useState(EDITOR_MIN_HEIGHT);

  const handleMount = useCallback<OnMount>(editor => {
    /**
     * Pin the model to LF. Monaco decides a model's EOL when it is created and
     * then rewrites every subsequent edit to match it, so setting it once here
     * is what keeps a snippet pasted from a CRLF source (Windows, some editors)
     * from being stored with `\r\n` — which the textarea this replaced would
     * have normalized away for free.
     */
    editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

    const syncHeight = () => {
      const next = clampEditorHeight(editor.getContentHeight());
      // Guarded: an unconditional set would re-render, which re-measures, which
      // sets again.
      setHeight(current => (current === next ? current : next));
    };

    syncHeight();
    editor.onDidContentSizeChange(syncHeight);
  }, []);

  // Monaco hands back undefined when it has no model; content is required
  // downstream, so it becomes an empty string here rather than at the far end
  // where it would silently overwrite a stored value.
  const handleChange = useCallback<OnChange>(
    next => onChange?.(next ?? ""),
    [onChange],
  );

  // Memoized because the library calls `updateOptions` whenever this object's
  // identity changes — a fresh literal would do that on every keystroke.
  const options = useMemo(
    () => ({
      ...BASE_OPTIONS,
      readOnly,
      // Also makes the underlying textarea readonly, so display mode does not
      // accept keystrokes that go nowhere.
      domReadOnly: readOnly,
      renderLineHighlight: readOnly ? ("none" as const) : ("line" as const),
      ariaLabel,
    }),
    [readOnly, ariaLabel],
  );

  return (
    <Editor
      value={value}
      language={getMonacoLanguageId(language)}
      theme={theme === "dark" ? DARK_THEME : LIGHT_THEME}
      height={height}
      onMount={handleMount}
      onChange={handleChange}
      options={options}
      loading={null}
    />
  );
}
