import { describe, it, expect } from "vitest";

import { buildUpdatePayload, getEditableFields } from "@/lib/item-form";
import type { ItemDetailData } from "@/lib/db/items";

function makeItem(overrides: Partial<ItemDetailData> = {}): ItemDetailData {
  return {
    id: "item_1",
    title: "Stored title",
    description: "Stored description",
    content: "stored content",
    url: "https://stored.example.com/",
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    itemTypeName: "snippet",
    tags: [],
    collections: [],
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-10T00:00:00.000Z",
    ...overrides,
  };
}

const DRAFT = {
  title: "Draft title",
  description: "Draft description",
  content: "draft content",
  language: "javascript",
  url: "https://draft.example.com/",
  tags: "react, hooks",
};

describe("getEditableFields", () => {
  it("shows content and language for snippets and commands", () => {
    expect(getEditableFields("type_snippet")).toEqual({
      content: true,
      language: true,
      url: false,
    });
    expect(getEditableFields("type_command")).toEqual({
      content: true,
      language: true,
      url: false,
    });
  });

  it("shows content only for prompts and notes", () => {
    expect(getEditableFields("type_prompt")).toEqual({
      content: true,
      language: false,
      url: false,
    });
    expect(getEditableFields("type_note")).toEqual({
      content: true,
      language: false,
      url: false,
    });
  });

  it("shows url only for links", () => {
    expect(getEditableFields("type_link")).toEqual({
      content: false,
      language: false,
      url: true,
    });
  });

  it("shows no type-specific field for file, image or an unknown type", () => {
    const none = { content: false, language: false, url: false };
    expect(getEditableFields("type_file")).toEqual(none);
    expect(getEditableFields("type_image")).toEqual(none);
    expect(getEditableFields("type_unknown")).toEqual(none);
  });
});

describe("buildUpdatePayload", () => {
  it("sends the edited values for fields the form shows", () => {
    const payload = buildUpdatePayload(makeItem(), DRAFT);

    expect(payload).toMatchObject({
      title: "Draft title",
      description: "Draft description",
      content: "draft content",
      language: "javascript",
    });
  });

  it("keeps a link's stored content and language instead of clearing them", () => {
    const item = makeItem({
      itemTypeId: "type_link",
      content: "stored content",
      language: "typescript",
    });

    const payload = buildUpdatePayload(item, { ...DRAFT, content: "", language: "" });

    expect(payload.content).toBe("stored content");
    expect(payload.language).toBe("typescript");
    expect(payload.url).toBe("https://draft.example.com/");
  });

  it("keeps a snippet's stored url instead of clearing it", () => {
    const payload = buildUpdatePayload(makeItem(), { ...DRAFT, url: "" });

    expect(payload.url).toBe("https://stored.example.com/");
  });

  it("carries stored nulls through untouched", () => {
    const item = makeItem({
      itemTypeId: "type_note",
      language: null,
      url: null,
    });

    const payload = buildUpdatePayload(item, DRAFT);

    expect(payload.language).toBeNull();
    expect(payload.url).toBeNull();
  });

  it("splits the comma-separated tag input without trimming (the action normalises)", () => {
    const payload = buildUpdatePayload(makeItem(), { ...DRAFT, tags: "react, hooks" });

    expect(payload.tags).toEqual(["react", " hooks"]);
  });

  it("yields a single empty tag entry for an empty input", () => {
    const payload = buildUpdatePayload(makeItem(), { ...DRAFT, tags: "" });

    expect(payload.tags).toEqual([""]);
  });
});
