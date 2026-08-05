"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CopyButton } from "@/components/dashboard/CopyButton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import {
  clampEditorHeight,
  EDITOR_MAX_HEIGHT,
  EDITOR_MIN_HEIGHT,
} from "@/lib/code-editor";
import { cn } from "@/lib/utils";

/**
 * The prose counterpart to `CodeEditor`: notes and prompts are Markdown, so they
 * get a Write/Preview pair instead of a syntax-highlighted buffer.
 *
 * Unlike the code editor this is not lazy-loaded. `react-markdown` renders fine
 * on the server, so the `ssr: false` dance that Monaco needs (it touches
 * `window` on import) would buy nothing here and would reintroduce the
 * placeholder-height problem that `CodeEditor` had to solve.
 */

const WRITE = "write";
const PREVIEW = "preview";

/**
 * The shared bounds reach CSS as custom properties rather than as interpolated
 * class names: Tailwind scans source statically, so a `max-h-[${n}px]` template
 * would compile to nothing at all. Same trick `CodeEditor` uses for its
 * placeholder height.
 */
const HEIGHT_VARS = {
  "--markdown-pane-min": `${EDITOR_MIN_HEIGHT}px`,
  "--markdown-pane-max": `${EDITOR_MAX_HEIGHT}px`,
} as React.CSSProperties;

/** Both panes share these, so switching tabs cannot resize the drawer past it. */
const PANE_BOUNDS =
  "min-h-(--markdown-pane-min) max-h-(--markdown-pane-max) overflow-auto";

interface MarkdownEditorProps {
  value: string;
  /** Omit to get a read-only preview with no Write tab. */
  onChange?: (value: string) => void;
  /**
   * Locks the textarea for the duration of a request without changing modes —
   * deliberately not folded into read-only, since dropping the Write tab
   * mid-save would move the box the user is looking at.
   */
  disabled?: boolean;
  /** Accessible name for the Write textarea, which has no label element. */
  ariaLabel: string;
  /** Accessible name for the header's copy button. */
  copyLabel?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  copyLabel = "Copy markdown",
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<string>(WRITE);

  const container = cn(
    "overflow-hidden rounded-lg border border-border bg-muted",
    className,
  );

  // Read-only display. A single tab would be a tablist that navigates nowhere,
  // so the header carries a static label in the slot where CodeEditor shows the
  // language instead. Checked as `!onChange` rather than through a boolean so
  // the handler is narrowed for the editable branch below.
  if (!onChange) {
    return (
      <div
        className={container}
        style={HEIGHT_VARS}
        data-markdown-editor="read-only"
      >
        <EditorHeader value={value} copyLabel={copyLabel}>
          <span className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Preview
          </span>
        </EditorHeader>
        <MarkdownPreview value={value} />
      </div>
    );
  }

  return (
    <Tabs
      value={tab}
      onValueChange={next => setTab(String(next))}
      className={container}
      style={HEIGHT_VARS}
      data-markdown-editor="editable"
    >
      <EditorHeader value={value} copyLabel={copyLabel}>
        {/* activateOnFocus: the primitive defaults to manual activation (arrow to
            move, Enter to switch), which earns its keep when a panel is expensive.
            Preview is derived from state already in memory, so an arrow key may as
            well just switch — one keystroke instead of two. */}
        <TabsList activateOnFocus>
          <TabsTab value={WRITE}>Write</TabsTab>
          <TabsTab value={PREVIEW}>Preview</TabsTab>
        </TabsList>
      </EditorHeader>

      {/* Both panels unmount when inactive, so the draft lives in `value` on the
          parent — which is also why the Write textarea is named by aria-label
          rather than a <label for>, which would point at nothing half the time. */}
      <TabsPanel value={WRITE}>
        <WritePane
          value={value}
          onChange={onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
        />
      </TabsPanel>
      <TabsPanel value={PREVIEW}>
        <MarkdownPreview value={value} />
      </TabsPanel>
    </Tabs>
  );
}

/**
 * Fixed height, matching `CodeEditor`: the copy button only appears once there
 * is something to copy, and the header must not resize when it does.
 */
function EditorHeader({
  children,
  value,
  copyLabel,
}: {
  children: React.ReactNode;
  value: string;
  copyLabel: string;
}) {
  return (
    <div className="flex h-9 items-center gap-2 border-b border-border px-3">
      {children}
      <div className="ml-auto flex items-center">
        {value && <CopyButton value={value} label={copyLabel} />}
      </div>
    </div>
  );
}

function WritePane({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grows with its content up to the shared cap, so the box behaves like the code
  // editor next to it rather than sitting at a fixed row count. Collapsing to
  // `auto` first is what lets it shrink again after a deletion — scrollHeight
  // never reports less than the height already set.
  const fit = useCallback(() => {
    const textarea = ref.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${clampEditorHeight(textarea.scrollHeight)}px`;
  }, []);

  useLayoutEffect(fit, [fit, value]);

  /**
   * Re-fit when the box gets narrower or wider, not only when the text changes:
   * the source wraps, so the same content needs a taller box in a narrower pane,
   * and without this a viewport resize strands the height at its old value. The
   * code editor gets the equivalent from Monaco's `automaticLayout`.
   */
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    // Width only: the observer also fires for the height changes `fit` itself
    // makes, and reacting to those would loop.
    let lastWidth = textarea.clientWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.clientWidth === lastWidth) return;
      lastWidth = textarea.clientWidth;
      fit();
    });

    observer.observe(textarea);
    return () => observer.disconnect();
  }, [fit]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={event => onChange(event.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      // Left on deliberately, unlike the code editor: this is prose the user is
      // composing, and the textarea this replaced spell-checked it too.
      spellCheck
      className={cn(
        "block w-full resize-none bg-transparent px-3 py-2.5",
        "font-mono text-xs text-foreground",
        "focus-visible:outline-none disabled:opacity-50",
        PANE_BOUNDS,
      )}
    />
  );
}

/**
 * Raw HTML in the source is left as text: `rehype-raw` is deliberately absent,
 * so stored content cannot inject markup into the drawer.
 */
function MarkdownPreview({ value }: { value: string }) {
  if (!value.trim()) {
    return (
      <p className="min-h-(--markdown-pane-min) px-3 py-2.5 text-xs text-muted-foreground italic">
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <div className={cn("markdown-preview px-3 py-2.5", PANE_BOUNDS)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // The one element with a React handle, so its blue comes from the
          // design system rather than a second copy of the palette in CSS. Same
          // target/rel treatment as the drawer's URL block: item content is the
          // user's own, but it still must not navigate the app frame.
          a: props => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            />
          ),
        }}
      >
        {value}
      </Markdown>
    </div>
  );
}
