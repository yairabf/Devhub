import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getRecentCollections } from "@/lib/db/collections";

const findMany = vi.mocked(prisma.collection.findMany);

beforeEach(() => {
  findMany.mockReset();
});

describe("getRecentCollections", () => {
  it("computes itemCount, uniqueTypeIds, and the dominant type", async () => {
    findMany.mockResolvedValue([
      {
        id: "col_1",
        name: "React Patterns",
        description: "Reusable patterns",
        isFavorite: true,
        _count: { items: 3 },
        items: [
          { item: { itemTypeId: "type_snippet" } },
          { item: { itemTypeId: "type_snippet" } },
          { item: { itemTypeId: "type_note" } },
        ],
      },
    ] as never);

    const result = await getRecentCollections("user_demo");

    expect(result).toEqual([
      {
        id: "col_1",
        name: "React Patterns",
        description: "Reusable patterns",
        isFavorite: true,
        itemCount: 3,
        uniqueTypeIds: ["type_snippet", "type_note"],
        dominantTypeId: "type_snippet",
      },
    ]);
  });

  it("returns a null dominant type for an empty collection", async () => {
    findMany.mockResolvedValue([
      {
        id: "col_empty",
        name: "Empty",
        description: null,
        isFavorite: false,
        _count: { items: 0 },
        items: [],
      },
    ] as never);

    const [collection] = await getRecentCollections("user_demo");

    expect(collection.itemCount).toBe(0);
    expect(collection.uniqueTypeIds).toEqual([]);
    expect(collection.dominantTypeId).toBeNull();
  });

  it("passes the userId and limit through to Prisma", async () => {
    findMany.mockResolvedValue([] as never);

    await getRecentCollections("user_demo", 3);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: { userId: "user_demo" }, take: 3 });
  });
});
