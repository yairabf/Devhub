import { describe, expect, it } from "vitest";

import {
  getLanguageLabel,
  getMonacoLanguageId,
  PLAIN_TEXT_LANGUAGE_ID,
} from "@/lib/code-language";

describe("getMonacoLanguageId", () => {
  it("passes through a language Monaco already knows by that name", () => {
    expect(getMonacoLanguageId("typescript")).toBe("typescript");
    expect(getMonacoLanguageId("python")).toBe("python");
    expect(getMonacoLanguageId("dockerfile")).toBe("dockerfile");
  });

  it("resolves the abbreviations a user actually types", () => {
    expect(getMonacoLanguageId("ts")).toBe("typescript");
    expect(getMonacoLanguageId("js")).toBe("javascript");
    expect(getMonacoLanguageId("py")).toBe("python");
    expect(getMonacoLanguageId("rs")).toBe("rust");
  });

  it("folds shell dialects onto Monaco's single shell tokenizer", () => {
    expect(getMonacoLanguageId("bash")).toBe("shell");
    expect(getMonacoLanguageId("zsh")).toBe("shell");
    expect(getMonacoLanguageId("sh")).toBe("shell");
  });

  it("folds tsx and jsx onto their base language, which is all Monaco has", () => {
    expect(getMonacoLanguageId("tsx")).toBe("typescript");
    expect(getMonacoLanguageId("jsx")).toBe("javascript");
  });

  it("ignores casing and surrounding whitespace", () => {
    expect(getMonacoLanguageId("TypeScript")).toBe("typescript");
    expect(getMonacoLanguageId("  BASH ")).toBe("shell");
  });

  it("falls back to plaintext for missing or unknown languages", () => {
    expect(getMonacoLanguageId(null)).toBe(PLAIN_TEXT_LANGUAGE_ID);
    expect(getMonacoLanguageId(undefined)).toBe(PLAIN_TEXT_LANGUAGE_ID);
    expect(getMonacoLanguageId("")).toBe(PLAIN_TEXT_LANGUAGE_ID);
    expect(getMonacoLanguageId("   ")).toBe(PLAIN_TEXT_LANGUAGE_ID);
    expect(getMonacoLanguageId("brainfuck")).toBe(PLAIN_TEXT_LANGUAGE_ID);
  });
});

describe("getLanguageLabel", () => {
  it("uses the canonical spelling for a known language", () => {
    expect(getLanguageLabel("typescript")).toBe("TypeScript");
    expect(getLanguageLabel("ts")).toBe("TypeScript");
    expect(getLanguageLabel("bash")).toBe("Bash");
    expect(getLanguageLabel("css")).toBe("CSS");
  });

  it("keeps tsx and jsx distinct in the header even though they share a tokenizer", () => {
    expect(getLanguageLabel("tsx")).toBe("TSX");
    expect(getLanguageLabel("jsx")).toBe("JSX");
  });

  // An unmapped language is still the user's own word for it — showing it beats
  // showing nothing or mislabelling it "Plain text".
  it("echoes an unknown language back, trimmed", () => {
    expect(getLanguageLabel(" Brainfuck ")).toBe("Brainfuck");
  });

  it("is empty when there is no language", () => {
    expect(getLanguageLabel(null)).toBe("");
    expect(getLanguageLabel(undefined)).toBe("");
    expect(getLanguageLabel("  ")).toBe("");
  });
});
