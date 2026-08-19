import { describe, it, expect } from "vitest";

import { sortFavoriteCollections, sortFavoriteItems } from "@/lib/favorites-sort";
import type { FavoriteCollectionData } from "@/lib/db/collections";
import type { FavoriteItemData } from "@/lib/db/items";

function makeItem(overrides: Partial<FavoriteItemData>): FavoriteItemData {
  return {
    id: "item_1",
    title: "Untitled",
    itemTypeId: "type_snippet",
    itemTypeName: "Snippet",
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeCollection(overrides: Partial<FavoriteCollectionData>): FavoriteCollectionData {
  return {
    id: "col_1",
    name: "Untitled",
    itemCount: 0,
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("sortFavoriteItems", () => {
  const zebra = makeItem({ id: "1", title: "Zebra Snippet", itemTypeName: "Snippet", updatedAt: new Date("2026-01-01") });
  const apple = makeItem({ id: "2", title: "Apple Prompt", itemTypeName: "Prompt", updatedAt: new Date("2026-03-01") });
  const mango = makeItem({ id: "3", title: "Mango Command", itemTypeName: "Command", updatedAt: new Date("2026-02-01") });

  it("sorts by name ascending", () => {
    const sorted = sortFavoriteItems([zebra, apple, mango], "name");
    expect(sorted.map(item => item.title)).toEqual([
      "Apple Prompt",
      "Mango Command",
      "Zebra Snippet",
    ]);
  });

  it("sorts by date descending (most recently updated first)", () => {
    const sorted = sortFavoriteItems([zebra, apple, mango], "date");
    expect(sorted.map(item => item.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by item type, then by title within the same type", () => {
    const bravo = makeItem({ id: "4", title: "Bravo Note", itemTypeName: "Note" });
    const alpha = makeItem({ id: "5", title: "Alpha Note", itemTypeName: "Note" });
    const sorted = sortFavoriteItems([zebra, apple, mango, bravo, alpha], "type");
    expect(sorted.map(item => item.itemTypeName)).toEqual([
      "Command",
      "Note",
      "Note",
      "Prompt",
      "Snippet",
    ]);
    expect(sorted.map(item => item.title)).toContain("Alpha Note");
    expect(sorted[1].title).toBe("Alpha Note");
    expect(sorted[2].title).toBe("Bravo Note");
  });

  it("does not mutate the input array", () => {
    const input = [zebra, apple, mango];
    const original = [...input];
    sortFavoriteItems(input, "name");
    expect(input).toEqual(original);
  });
});

describe("sortFavoriteCollections", () => {
  const zebra = makeCollection({ id: "1", name: "Zebra Collection", updatedAt: new Date("2026-01-01") });
  const apple = makeCollection({ id: "2", name: "Apple Collection", updatedAt: new Date("2026-03-01") });
  const mango = makeCollection({ id: "3", name: "Mango Collection", updatedAt: new Date("2026-02-01") });

  it("sorts by name ascending", () => {
    const sorted = sortFavoriteCollections([zebra, apple, mango], "name");
    expect(sorted.map(c => c.name)).toEqual([
      "Apple Collection",
      "Mango Collection",
      "Zebra Collection",
    ]);
  });

  it("sorts by date descending (most recently updated first)", () => {
    const sorted = sortFavoriteCollections([zebra, apple, mango], "date");
    expect(sorted.map(c => c.id)).toEqual(["2", "3", "1"]);
  });

  it("leaves order unchanged for 'type' since collections have no item type", () => {
    const sorted = sortFavoriteCollections([zebra, apple, mango], "type");
    expect(sorted.map(c => c.id)).toEqual(["1", "2", "3"]);
  });

  it("does not mutate the input array", () => {
    const input = [zebra, apple, mango];
    const original = [...input];
    sortFavoriteCollections(input, "name");
    expect(input).toEqual(original);
  });
});
