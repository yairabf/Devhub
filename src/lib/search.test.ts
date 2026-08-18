import { describe, it, expect } from "vitest";
import { searchIndex, type SearchIndex } from "@/lib/search";

const INDEX: SearchIndex = {
  items: [
    {
      id: "item_1",
      title: "React Hook Form Snippet",
      itemTypeId: "type_snippet",
      itemTypeName: "Snippet",
      preview: "const form = useForm();",
    },
    {
      id: "item_2",
      title: "Global Search Notes",
      itemTypeId: "type_note",
      itemTypeName: "Note",
      preview: "Ideas for the command palette",
    },
    {
      id: "item_3",
      title: "Unrelated Link",
      itemTypeId: "type_link",
      itemTypeName: "Link",
      preview: "https://example.com",
    },
  ],
  collections: [
    { id: "col_1", name: "React Patterns", itemCount: 3 },
    { id: "col_2", name: "DevOps", itemCount: 5 },
  ],
};

describe("searchIndex", () => {
  it("returns no results for an empty query", () => {
    expect(searchIndex(INDEX, "")).toEqual({ items: [], collections: [] });
  });

  it("returns no results for a whitespace-only query", () => {
    expect(searchIndex(INDEX, "   ")).toEqual({ items: [], collections: [] });
  });

  it("matches items case-insensitively on title", () => {
    const results = searchIndex(INDEX, "react");
    expect(results.items.map(i => i.id)).toContain("item_1");
  });

  it("matches items via a subsequence, not just a substring", () => {
    // "gsrch" is a subsequence of "Global Search Notes" but not a substring.
    const results = searchIndex(INDEX, "gsrch");
    expect(results.items.map(i => i.id)).toEqual(["item_2"]);
  });

  it("matches items on preview text too", () => {
    const results = searchIndex(INDEX, "useForm");
    expect(results.items.map(i => i.id)).toEqual(["item_1"]);
  });

  it("excludes items that don't match at all", () => {
    const results = searchIndex(INDEX, "react");
    expect(results.items.map(i => i.id)).not.toContain("item_3");
  });

  it("matches collections by name", () => {
    const results = searchIndex(INDEX, "devops");
    expect(results.collections.map(c => c.id)).toEqual(["col_2"]);
  });

  it("ranks a tighter, earlier match above a looser, later one", () => {
    const index: SearchIndex = {
      items: [
        {
          id: "loose",
          title: "z r e a c t further away loose match",
          itemTypeId: "type_note",
          itemTypeName: "Note",
          preview: "",
        },
        {
          id: "tight",
          title: "React exact prefix match",
          itemTypeId: "type_note",
          itemTypeName: "Note",
          preview: "",
        },
      ],
      collections: [],
    };
    const results = searchIndex(index, "react");
    expect(results.items.map(i => i.id)).toEqual(["tight", "loose"]);
  });

  it("caps results per group", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `item_${i}`,
      title: `Match ${i}`,
      itemTypeId: "type_note",
      itemTypeName: "Note",
      preview: "",
    }));
    const results = searchIndex({ items, collections: [] }, "match");
    expect(results.items).toHaveLength(8);
  });
});
