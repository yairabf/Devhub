import { describe, it, expect } from "vitest";
import { getInitials, getTypeSlug, capitalize } from "@/lib/format";

describe("getInitials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("uses a single initial for a one-word name", () => {
    expect(getInitials("Grace")).toBe("G");
  });

  it("caps at two initials for three or more words", () => {
    expect(getInitials("Alan Mathison Turing")).toBe("AM");
  });

  it("returns an empty string for an empty name", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("getTypeSlug", () => {
  it("lowercases and pluralizes the type name", () => {
    expect(getTypeSlug("Snippet")).toBe("snippets");
    expect(getTypeSlug("Link")).toBe("links");
  });
});

describe("capitalize", () => {
  it("uppercases the first character", () => {
    expect(capitalize("snippet")).toBe("Snippet");
  });

  it("leaves the rest of the string untouched", () => {
    expect(capitalize("aPI")).toBe("API");
  });

  it("returns the value unchanged when empty", () => {
    expect(capitalize("")).toBe("");
  });
});
