import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  createCollection,
  getCollectionById,
  getCollectionOptions,
  getCollections,
} from "@/lib/db/collections";

const findMany = vi.mocked(prisma.collection.findMany);
const findFirst = vi.mocked(prisma.collection.findFirst);
const create = vi.mocked(prisma.collection.create);

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
  create.mockReset();
});

describe("getCollections", () => {
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

    const result = await getCollections("user_demo");

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

    const [collection] = await getCollections("user_demo");

    expect(collection.itemCount).toBe(0);
    expect(collection.uniqueTypeIds).toEqual([]);
    expect(collection.dominantTypeId).toBeNull();
  });

  it("passes the userId and limit through to Prisma", async () => {
    findMany.mockResolvedValue([] as never);

    await getCollections("user_demo", 3);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: { userId: "user_demo" }, take: 3 });
  });

  it("omits the take clause entirely when no limit is given", async () => {
    findMany.mockResolvedValue([] as never);

    await getCollections("user_demo");

    // Prisma treats `undefined` as "argument not supplied", which is what lets
    // one function serve both the capped dashboard and the full list page.
    const args = findMany.mock.calls[0][0];
    expect(args).toBeDefined();
    expect(args?.take).toBeUndefined();
  });

  it("breaks updatedAt ties on id so the order is deterministic", async () => {
    findMany.mockResolvedValue([] as never);

    await getCollections("user_demo");

    // The seed writes every collection in one transaction, so updatedAt values
    // collide and Postgres is free to return them in any order without this.
    expect(findMany.mock.calls[0][0]).toMatchObject({
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });
  });
});

describe("getCollectionById", () => {
  it("scopes the lookup to both the id and the owner", async () => {
    findFirst.mockResolvedValue(null as never);

    await getCollectionById("user_demo", "col_react_patterns");

    // Dropping userId here would let anyone with the URL read another user's
    // collection, so this is the access-control guard for the detail page.
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: { id: "col_react_patterns", userId: "user_demo" },
    });
  });

  it("returns the collection when the user owns it", async () => {
    findFirst.mockResolvedValue({
      id: "col_react_patterns",
      name: "React Patterns",
      description: "Reusable patterns",
      isFavorite: true,
    } as never);

    const result = await getCollectionById("user_demo", "col_react_patterns");

    expect(result).toEqual({
      id: "col_react_patterns",
      name: "React Patterns",
      description: "Reusable patterns",
      isFavorite: true,
    });
  });

  it("returns null for a missing or foreign collection", async () => {
    findFirst.mockResolvedValue(null as never);

    await expect(getCollectionById("user_demo", "col_someone_else")).resolves.toBeNull();
  });
});

describe("createCollection", () => {
  it("scopes the new row to the given owner", async () => {
    create.mockResolvedValue({
      id: "col_new",
      name: "React Patterns",
      description: "Reusable patterns",
      isFavorite: false,
    } as never);

    await createCollection("user_demo", { name: "React Patterns", description: "Reusable patterns" });

    expect(create.mock.calls[0][0]).toMatchObject({
      data: { name: "React Patterns", description: "Reusable patterns", userId: "user_demo" },
    });
  });

  it("returns a zeroed CollectionCardData for the empty, freshly created collection", async () => {
    create.mockResolvedValue({
      id: "col_new",
      name: "React Patterns",
      description: null,
      isFavorite: false,
    } as never);

    const result = await createCollection("user_demo", { name: "React Patterns", description: null });

    expect(result).toEqual({
      id: "col_new",
      name: "React Patterns",
      description: null,
      isFavorite: false,
      itemCount: 0,
      uniqueTypeIds: [],
      dominantTypeId: null,
    });
  });
});

describe("getCollectionOptions", () => {
  it("scopes the query to the owner and orders alphabetically", async () => {
    findMany.mockResolvedValue([] as never);

    await getCollectionOptions("user_demo");

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: "user_demo" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  });

  it("returns the trimmed id + name shape", async () => {
    findMany.mockResolvedValue([
      { id: "col_1", name: "React Patterns" },
      { id: "col_2", name: "DevOps" },
    ] as never);

    await expect(getCollectionOptions("user_demo")).resolves.toEqual([
      { id: "col_1", name: "React Patterns" },
      { id: "col_2", name: "DevOps" },
    ]);
  });
});
