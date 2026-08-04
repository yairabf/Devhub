import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getItemDetail, getRecentItems } from "@/lib/db/items";

const findMany = vi.mocked(prisma.item.findMany);
const findFirst = vi.mocked(prisma.item.findFirst);

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
});

describe("getRecentItems", () => {
  it("flattens the raw Prisma row into ItemCardData", async () => {
    findMany.mockResolvedValue([
      {
        id: "item_1",
        title: "useDebounce",
        description: "A debounce hook",
        content: "const x = 1;",
        url: null,
        isFavorite: true,
        itemTypeId: "type_snippet",
        itemType: { name: "Snippet" },
        tags: [{ id: "tag_1", name: "react" }],
      },
    ] as never);

    const result = await getRecentItems("user_demo");

    expect(result).toEqual([
      {
        id: "item_1",
        title: "useDebounce",
        description: "A debounce hook",
        content: "const x = 1;",
        url: null,
        isFavorite: true,
        itemTypeId: "type_snippet",
        itemTypeName: "Snippet",
        tags: [{ id: "tag_1", name: "react" }],
      },
    ]);
  });

  it("applies the default limit of 10", async () => {
    findMany.mockResolvedValue([] as never);

    await getRecentItems("user_demo");

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: { userId: "user_demo" }, take: 10 });
  });

  it("honors an explicit limit", async () => {
    findMany.mockResolvedValue([] as never);

    await getRecentItems("user_demo", 5);

    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ take: 5 });
  });
});

describe("getItemDetail", () => {
  it("flattens the raw Prisma row into ItemDetailData", async () => {
    findFirst.mockResolvedValue({
      id: "item_1",
      title: "useDebounce",
      description: "A debounce hook",
      content: "const x = 1;",
      url: null,
      isFavorite: true,
      isPinned: true,
      language: "typescript",
      itemTypeId: "type_snippet",
      itemType: { name: "Snippet" },
      tags: [{ id: "tag_1", name: "react" }],
      collections: [{ collection: { id: "col_1", name: "React Patterns" } }],
      createdAt: new Date("2026-04-10T12:30:00.000Z"),
      updatedAt: new Date("2026-04-12T08:00:00.000Z"),
    } as never);

    const result = await getItemDetail("user_demo", "item_1");

    expect(result).toEqual({
      id: "item_1",
      title: "useDebounce",
      description: "A debounce hook",
      content: "const x = 1;",
      url: null,
      isFavorite: true,
      isPinned: true,
      language: "typescript",
      itemTypeId: "type_snippet",
      itemTypeName: "Snippet",
      tags: [{ id: "tag_1", name: "react" }],
      collections: [{ id: "col_1", name: "React Patterns" }],
      createdAt: "2026-04-10T12:30:00.000Z",
      updatedAt: "2026-04-12T08:00:00.000Z",
    });
  });

  it("scopes the lookup to the owning user", async () => {
    findFirst.mockResolvedValue(null as never);

    await getItemDetail("user_demo", "item_1");

    const args = findFirst.mock.calls[0][0];
    expect(args).toMatchObject({ where: { id: "item_1", userId: "user_demo" } });
  });

  it("returns null when the item does not belong to the user", async () => {
    findFirst.mockResolvedValue(null as never);

    await expect(getItemDetail("user_other", "item_1")).resolves.toBeNull();
  });
});
