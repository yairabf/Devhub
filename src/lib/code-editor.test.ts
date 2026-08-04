import { describe, expect, it } from "vitest";

import {
  clampEditorHeight,
  EDITOR_MAX_HEIGHT,
  EDITOR_MIN_HEIGHT,
  estimateEditorHeight,
} from "@/lib/code-editor";

describe("clampEditorHeight", () => {
  it("keeps a height that is already in range", () => {
    expect(clampEditorHeight(200)).toBe(200);
  });

  it("lifts anything shorter than the floor", () => {
    expect(clampEditorHeight(0)).toBe(EDITOR_MIN_HEIGHT);
    expect(clampEditorHeight(EDITOR_MIN_HEIGHT - 1)).toBe(EDITOR_MIN_HEIGHT);
  });

  it("caps anything taller than the maximum", () => {
    expect(clampEditorHeight(EDITOR_MAX_HEIGHT + 1)).toBe(EDITOR_MAX_HEIGHT);
    expect(clampEditorHeight(10_000)).toBe(EDITOR_MAX_HEIGHT);
  });

  it("keeps both bounds themselves", () => {
    expect(clampEditorHeight(EDITOR_MIN_HEIGHT)).toBe(EDITOR_MIN_HEIGHT);
    expect(clampEditorHeight(EDITOR_MAX_HEIGHT)).toBe(EDITOR_MAX_HEIGHT);
  });
});

describe("estimateEditorHeight", () => {
  it("uses the floor for empty content, so the box never collapses", () => {
    expect(estimateEditorHeight("")).toBe(EDITOR_MIN_HEIGHT);
  });

  it("grows with the line count", () => {
    const oneLine = estimateEditorHeight("a");
    const tenLines = estimateEditorHeight("a\n".repeat(9) + "a");
    expect(tenLines).toBeGreaterThan(oneLine);
    // 10 lines × 20 + 20 padding.
    expect(tenLines).toBe(220);
  });

  it("counts a trailing newline as the empty line it leaves behind", () => {
    expect(estimateEditorHeight("a\n")).toBe(estimateEditorHeight("a\nb"));
  });

  it("stops at the cap for long content", () => {
    expect(estimateEditorHeight("x\n".repeat(500))).toBe(EDITOR_MAX_HEIGHT);
  });
});
