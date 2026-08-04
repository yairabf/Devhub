"use client";

import dynamic from "next/dynamic";

import { CopyButton } from "@/components/dashboard/CopyButton";
import { useAppTheme } from "@/components/theme/useAppTheme";
import { estimateEditorHeight } from "@/lib/code-editor";
import { getLanguageLabel } from "@/lib/code-language";
import { cn } from "@/lib/utils";

/**
 * Monaco is loaded on demand and never on the server: the surface module
 * imports monaco at the top level, which touches `window`, and client
 * components are still server-rendered. Until the chunk arrives the placeholder
 * below holds the space, sized by the CSS variable the wrapper sets.
 */
const CodeEditorSurface = dynamic(
  () =>
    import("@/components/dashboard/CodeEditorSurface").then(
      module => module.CodeEditorSurface,
    ),
  { ssr: false, loading: () => <SurfacePlaceholder /> },
);

interface CodeEditorProps {
  value: string;
  /** Free-text language off the item; normalized for Monaco and the header. */
  language?: string | null;
  /** Omit to get a read-only display surface. */
  onChange?: (value: string) => void;
  /** Read-only for the duration of a request, without changing modes. */
  disabled?: boolean;
  /** Accessible name for the editing surface — it has no visible label. */
  ariaLabel: string;
  /** Accessible name for the header's copy button. */
  copyLabel?: string;
  className?: string;
}

export function CodeEditor({
  value,
  language,
  onChange,
  disabled = false,
  ariaLabel,
  copyLabel = "Copy code",
  className,
}: CodeEditorProps) {
  const theme = useAppTheme();
  const languageLabel = getLanguageLabel(language);
  const readOnly = !onChange || disabled;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
      // Read by globals.css to hide Monaco's caret in display mode.
      data-code-editor={readOnly ? "read-only" : "editable"}
      // Consumed by the loading placeholder, so the box opens at roughly the
      // height Monaco will settle on instead of collapsing and jumping.
      style={
        {
          "--code-editor-placeholder-height": `${estimateEditorHeight(value)}px`,
        } as React.CSSProperties
      }
    >
      {/* Fixed height: the copy button only appears once there is something to
          copy, and the header must not resize when it does. */}
      <div className="flex h-9 items-center gap-2 border-b border-border px-3">
        <WindowDots />
        <div className="ml-auto flex items-center gap-2">
          {languageLabel && (
            <span className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {languageLabel}
            </span>
          )}
          {value && <CopyButton value={value} label={copyLabel} />}
        </div>
      </div>

      <CodeEditorSurface
        value={value}
        language={language}
        readOnly={readOnly}
        theme={theme}
        ariaLabel={ariaLabel}
        onChange={onChange}
      />
    </div>
  );
}

/** The macOS traffic lights. Decorative — they do not close anything. */
function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
    </div>
  );
}

function SurfacePlaceholder() {
  return (
    <div className="h-(--code-editor-placeholder-height) animate-pulse bg-muted" />
  );
}
