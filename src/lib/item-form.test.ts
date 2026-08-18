import { describe, it, expect } from "vitest";

import {
  buildCreatePayload,
  buildUpdatePayload,
  getEditableFields,
  isCreatableType,
  orderCreatableTypes,
  usesCodeEditor,
  usesMarkdownEditor,
} from "@/lib/item-form";
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
  collectionIds: ["col_1"],
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

describe("usesCodeEditor", () => {
  it("is true for the code types", () => {
    expect(usesCodeEditor("type_snippet")).toBe(true);
    expect(usesCodeEditor("type_command")).toBe(true);
  });

  it("is false for prose and every other type", () => {
    expect(usesCodeEditor("type_prompt")).toBe(false);
    expect(usesCodeEditor("type_note")).toBe(false);
    expect(usesCodeEditor("type_link")).toBe(false);
    expect(usesCodeEditor("type_file")).toBe(false);
    expect(usesCodeEditor("type_image")).toBe(false);
    expect(usesCodeEditor("type_unknown")).toBe(false);
  });

  // The editor and the language field are driven by one set on purpose; if they
  // ever diverge, one of these two assertions is where it shows up.
  it("agrees with the language field on every creatable type", () => {
    for (const typeId of [
      "type_snippet",
      "type_prompt",
      "type_command",
      "type_note",
      "type_link",
    ]) {
      expect(usesCodeEditor(typeId)).toBe(getEditableFields(typeId).language);
    }
  });
});

describe("usesMarkdownEditor", () => {
  it("is true for the prose types", () => {
    expect(usesMarkdownEditor("type_prompt")).toBe(true);
    expect(usesMarkdownEditor("type_note")).toBe(true);
  });

  it("is false for the code types, which keep the code editor", () => {
    expect(usesMarkdownEditor("type_snippet")).toBe(false);
    expect(usesMarkdownEditor("type_command")).toBe(false);
  });

  it("is false for types with no content at all", () => {
    expect(usesMarkdownEditor("type_link")).toBe(false);
    expect(usesMarkdownEditor("type_file")).toBe(false);
    expect(usesMarkdownEditor("type_image")).toBe(false);
    expect(usesMarkdownEditor("type_unknown")).toBe(false);
  });

  /**
   * The whole point of deriving this from the same two sets: a type with a body
   * gets exactly one editor, and a type without one gets neither. If a future
   * type is added to only one set, this is where it surfaces.
   */
  it("pairs with the code editor to cover every content type exactly once", () => {
    for (const typeId of [
      "type_snippet",
      "type_prompt",
      "type_command",
      "type_note",
      "type_link",
      "type_file",
      "type_image",
      "type_unknown",
    ]) {
      const editors = [usesCodeEditor(typeId), usesMarkdownEditor(typeId)];

      expect(editors.filter(Boolean)).toHaveLength(
        getEditableFields(typeId).content ? 1 : 0,
      );
    }
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

  it("passes collectionIds through unconditionally, like tags", () => {
    const payload = buildUpdatePayload(makeItem(), {
      ...DRAFT,
      collectionIds: ["col_1", "col_2"],
    });

    expect(payload.collectionIds).toEqual(["col_1", "col_2"]);
  });
});

describe("isCreatableType", () => {
  it("accepts the five types the dialog offers", () => {
    for (const id of [
      "type_snippet",
      "type_prompt",
      "type_command",
      "type_note",
      "type_link",
    ]) {
      expect(isCreatableType(id)).toBe(true);
    }
  });

  it("rejects the Pro upload types and anything unknown", () => {
    for (const id of ["type_file", "type_image", "nonsense", ""]) {
      expect(isCreatableType(id)).toBe(false);
    }
  });
});

describe("buildCreatePayload", () => {
  const DRAFT = {
    title: "useDebounce",
    description: "A debounce hook",
    content: "const x = 1;",
    language: "typescript",
    url: "https://example.com",
    tags: "react, hooks",
    collectionIds: ["col_1"],
  };

  it("keeps content and language for a snippet and nulls the url", () => {
    expect(buildCreatePayload("type_snippet", DRAFT)).toEqual({
      itemTypeId: "type_snippet",
      title: "useDebounce",
      description: "A debounce hook",
      content: "const x = 1;",
      language: "typescript",
      url: null,
      tags: ["react", " hooks"],
      collectionIds: ["col_1"],
    });
  });

  it("keeps content but not language for a prompt", () => {
    const payload = buildCreatePayload("type_prompt", DRAFT);

    expect(payload.content).toBe("const x = 1;");
    expect(payload.language).toBeNull();
    expect(payload.url).toBeNull();
  });

  it("keeps only the url for a link", () => {
    const payload = buildCreatePayload("type_link", DRAFT);

    expect(payload.url).toBe("https://example.com");
    expect(payload.content).toBeNull();
    expect(payload.language).toBeNull();
  });

  // Unlike buildUpdatePayload there is no stored item to fall back on, so
  // hidden fields must be null rather than carried over.
  it("never carries a value into a field the type does not use", () => {
    const payload = buildCreatePayload("type_note", DRAFT);

    expect(payload).toMatchObject({ language: null, url: null });
    expect(payload.content).toBe("const x = 1;");
  });

  it("passes collectionIds through unconditionally, like tags", () => {
    const payload = buildCreatePayload("type_link", {
      ...DRAFT,
      collectionIds: ["col_1", "col_2"],
    });

    expect(payload.collectionIds).toEqual(["col_1", "col_2"]);
  });
});

describe("orderCreatableTypes", () => {
  // The DB returns types alphabetically; the selector wants spec order.
  const FROM_DB = [
    { id: "type_command" },
    { id: "type_file" },
    { id: "type_image" },
    { id: "type_link" },
    { id: "type_note" },
    { id: "type_prompt" },
    { id: "type_snippet" },
  ];

  it("drops Pro types and returns the rest in selector order", () => {
    expect(orderCreatableTypes(FROM_DB).map(t => t.id)).toEqual([
      "type_snippet",
      "type_prompt",
      "type_command",
      "type_note",
      "type_link",
    ]);
  });

  it("puts snippet first so it becomes the default selection", () => {
    expect(orderCreatableTypes(FROM_DB)[0].id).toBe("type_snippet");
  });

  it("omits types missing from the database without breaking the order", () => {
    const partial = [{ id: "type_link" }, { id: "type_command" }];

    expect(orderCreatableTypes(partial).map(t => t.id)).toEqual([
      "type_command",
      "type_link",
    ]);
  });

  it("returns an empty list when nothing is creatable", () => {
    expect(orderCreatableTypes([{ id: "type_file" }])).toEqual([]);
  });
});
