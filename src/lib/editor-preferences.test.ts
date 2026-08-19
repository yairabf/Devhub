import { describe, it, expect } from "vitest";

import { editorPreferencesSchema, parseEditorPreferences } from "@/lib/editor-preferences";
import {
  DEFAULT_EDITOR_PREFERENCES,
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
} from "@/types/editor-preferences";

const VALID: typeof DEFAULT_EDITOR_PREFERENCES = {
  fontSize: 16,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "monokai",
};

describe("parseEditorPreferences", () => {
  it("returns a valid preferences object unchanged", () => {
    expect(parseEditorPreferences(VALID)).toEqual(VALID);
  });

  it("falls back to defaults for null", () => {
    expect(parseEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("falls back to defaults for undefined", () => {
    expect(parseEditorPreferences(undefined)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("falls back to defaults for an out-of-range font size", () => {
    expect(parseEditorPreferences({ ...VALID, fontSize: 24 })).toEqual(
      DEFAULT_EDITOR_PREFERENCES,
    );
  });

  it("falls back to defaults for an unknown theme string", () => {
    expect(parseEditorPreferences({ ...VALID, theme: "solarized" })).toEqual(
      DEFAULT_EDITOR_PREFERENCES,
    );
  });

  it("falls back to defaults for a stale shape missing fields", () => {
    expect(parseEditorPreferences({ fontSize: 14 })).toEqual(
      DEFAULT_EDITOR_PREFERENCES,
    );
  });

  it("falls back to defaults for a non-object value", () => {
    expect(parseEditorPreferences("vs-dark")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });
});

describe("editorPreferencesSchema font/tab size parity", () => {
  it("accepts every listed font size", () => {
    for (const fontSize of EDITOR_FONT_SIZES) {
      expect(editorPreferencesSchema.safeParse({ ...VALID, fontSize }).success).toBe(true);
    }
  });

  it("accepts every listed tab size", () => {
    for (const tabSize of EDITOR_TAB_SIZES) {
      expect(editorPreferencesSchema.safeParse({ ...VALID, tabSize }).success).toBe(true);
    }
  });
});
