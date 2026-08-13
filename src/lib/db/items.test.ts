import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  createItem,
  deleteItem,
  getItemDetail,
  getItemsByCollection,
  getRecentItems,
  updateItem,
} from "@/lib/db/items";

const findMany = vi.mocked(prisma.item.findMany);
const findFirst = vi.mocked(prisma.item.findFirst);
const create = vi.mocked(prisma.item.create);
const update = vi.mocked(prisma.item.update);
const destroy = vi.mocked(prisma.item.delete);

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
  create.mockReset();
  update.mockReset();
  destroy.mockReset();
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

describe("getItemsByCollection", () => {
  it("scopes the query to the owner as well as the collection", async () => {
    findMany.mockResolvedValue([] as never);

    await getItemsByCollection("user_demo", "col_react_patterns");

    // Dropping userId would return another user's items to anyone who knows
    // (or guesses) a collection id, so this is the access-control guard.
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0]).toMatchObject({
      where: {
        userId: "user_demo",
        collections: { some: { collectionId: "col_react_patterns" } },
      },
    });
  });

  it("breaks updatedAt ties on id so the order is deterministic", async () => {
    findMany.mockResolvedValue([] as never);

    await getItemsByCollection("user_demo", "col_react_patterns");

    // Matches every other list query in this module; the seed writes items in
    // one transaction, so updatedAt values collide.
    expect(findMany.mock.calls[0][0]).toMatchObject({
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });
  });

  it("flattens the raw Prisma rows into ItemCardData", async () => {
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

    const result = await getItemsByCollection("user_demo", "col_react_patterns");

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

  it("returns an empty array for a collection with no items", async () => {
    findMany.mockResolvedValue([] as never);

    await expect(
      getItemsByCollection("user_demo", "col_empty"),
    ).resolves.toEqual([]);
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

describe("updateItem", () => {
  const INPUT = {
    title: "useDebounce",
    description: "A debounce hook",
    content: "const x = 1;",
    url: null,
    language: "typescript",
    tags: ["react", "hooks"],
  };

  const UPDATED_ROW = {
    id: "item_1",
    title: "useDebounce",
    description: "A debounce hook",
    content: "const x = 1;",
    url: null,
    isFavorite: false,
    isPinned: false,
    language: "typescript",
    itemTypeId: "type_snippet",
    itemType: { name: "snippet" },
    tags: [
      { id: "tag_1", name: "react" },
      { id: "tag_2", name: "hooks" },
    ],
    collections: [{ collection: { id: "col_1", name: "React Patterns" } }],
    createdAt: new Date("2026-04-10T12:30:00.000Z"),
    updatedAt: new Date("2026-08-04T09:00:00.000Z"),
  };

  it("refuses to update an item the user does not own", async () => {
    findFirst.mockResolvedValue(null as never);

    const result = await updateItem("user_other", "item_1", INPUT);

    expect(result).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it("checks ownership with both the item id and the user id", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);

    await updateItem("user_demo", "item_1", INPUT);

    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: { id: "item_1", userId: "user_demo" },
    });
  });

  it("replaces tags by clearing the links then connect-or-creating each name", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);

    await updateItem("user_demo", "item_1", INPUT);

    const args = update.mock.calls[0][0];
    expect(args).toMatchObject({
      where: { id: "item_1" },
      data: {
        title: "useDebounce",
        description: "A debounce hook",
        content: "const x = 1;",
        url: null,
        language: "typescript",
        tags: {
          set: [],
          connectOrCreate: [
            { where: { name: "react" }, create: { name: "react" } },
            { where: { name: "hooks" }, create: { name: "hooks" } },
          ],
        },
      },
    });
  });

  it("asks for the full detail select so the caller can refresh without a re-fetch", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);

    await updateItem("user_demo", "item_1", INPUT);

    const select = update.mock.calls[0][0].select;
    expect(select).toMatchObject({
      language: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
    });
    expect(select).toHaveProperty("collections");
    expect(select).toHaveProperty("tags");
  });

  it("clears every tag link when no tags are given", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue({ ...UPDATED_ROW, tags: [] } as never);

    await updateItem("user_demo", "item_1", { ...INPUT, tags: [] });

    const args = update.mock.calls[0][0];
    expect(args).toMatchObject({
      data: { tags: { set: [], connectOrCreate: [] } },
    });
  });

  it("returns the refreshed detail with ISO timestamps", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);

    const result = await updateItem("user_demo", "item_1", INPUT);

    expect(result).toEqual({
      id: "item_1",
      title: "useDebounce",
      description: "A debounce hook",
      content: "const x = 1;",
      url: null,
      isFavorite: false,
      isPinned: false,
      language: "typescript",
      itemTypeId: "type_snippet",
      itemTypeName: "snippet",
      tags: [
        { id: "tag_1", name: "react" },
        { id: "tag_2", name: "hooks" },
      ],
      collections: [{ id: "col_1", name: "React Patterns" }],
      createdAt: "2026-04-10T12:30:00.000Z",
      updatedAt: "2026-08-04T09:00:00.000Z",
    });
  });
});

describe("deleteItem", () => {
  it("refuses to delete an item the user does not own", async () => {
    findFirst.mockResolvedValue(null as never);

    await expect(deleteItem("user_other", "item_1")).resolves.toBe(false);
    expect(destroy).not.toHaveBeenCalled();
  });

  it("checks ownership with both the item id and the user id", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    destroy.mockResolvedValue({ id: "item_1" } as never);

    await deleteItem("user_demo", "item_1");

    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: { id: "item_1", userId: "user_demo" },
    });
  });

  it("deletes the owned item by id and reports success", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    destroy.mockResolvedValue({ id: "item_1" } as never);

    await expect(deleteItem("user_demo", "item_1")).resolves.toBe(true);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(destroy.mock.calls[0][0]).toEqual({ where: { id: "item_1" } });
  });
});

describe("createItem", () => {
  const INPUT = {
    itemTypeId: "type_snippet",
    title: "useDebounce",
    description: "A debounce hook",
    content: "const x = 1;",
    url: null,
    language: "typescript",
    tags: ["react", "hooks"],
  };

  const CREATED_ROW = {
    id: "item_new",
    title: "useDebounce",
    description: "A debounce hook",
    content: "const x = 1;",
    url: null,
    isFavorite: false,
    isPinned: false,
    language: "typescript",
    itemTypeId: "type_snippet",
    itemType: { name: "snippet" },
    tags: [
      { id: "tag_1", name: "react" },
      { id: "tag_2", name: "hooks" },
    ],
    collections: [],
    createdAt: new Date("2026-08-04T09:00:00.000Z"),
    updatedAt: new Date("2026-08-04T09:00:00.000Z"),
  };

  it("scopes the row to the user and sets the required contentType", async () => {
    create.mockResolvedValue(CREATED_ROW as never);

    await createItem("user_demo", INPUT);

    expect(create.mock.calls[0][0]).toMatchObject({
      data: {
        userId: "user_demo",
        itemTypeId: "type_snippet",
        // Required by the schema with no default — the insert fails without it.
        contentType: "text",
        title: "useDebounce",
        description: "A debounce hook",
        content: "const x = 1;",
        url: null,
        language: "typescript",
      },
    });
  });

  it("connects or creates each tag", async () => {
    create.mockResolvedValue(CREATED_ROW as never);

    await createItem("user_demo", INPUT);

    expect(create.mock.calls[0][0]).toMatchObject({
      data: {
        tags: {
          connectOrCreate: [
            { where: { name: "react" }, create: { name: "react" } },
            { where: { name: "hooks" }, create: { name: "hooks" } },
          ],
        },
      },
    });
  });

  it("sends an empty connectOrCreate when there are no tags", async () => {
    create.mockResolvedValue({ ...CREATED_ROW, tags: [] } as never);

    await createItem("user_demo", { ...INPUT, tags: [] });

    expect(create.mock.calls[0][0]).toMatchObject({
      data: { tags: { connectOrCreate: [] } },
    });
  });

  it("returns the new item as detail data with ISO timestamps", async () => {
    create.mockResolvedValue(CREATED_ROW as never);

    const result = await createItem("user_demo", INPUT);

    expect(result).toEqual({
      id: "item_new",
      title: "useDebounce",
      description: "A debounce hook",
      content: "const x = 1;",
      url: null,
      isFavorite: false,
      isPinned: false,
      language: "typescript",
      itemTypeId: "type_snippet",
      itemTypeName: "snippet",
      tags: [
        { id: "tag_1", name: "react" },
        { id: "tag_2", name: "hooks" },
      ],
      collections: [],
      createdAt: "2026-08-04T09:00:00.000Z",
      updatedAt: "2026-08-04T09:00:00.000Z",
    });
  });
});
