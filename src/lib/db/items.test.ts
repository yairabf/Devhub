import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
    },
  },
}));

import { DASHBOARD_PINNED_ITEMS_LIMIT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  countItemsByCollection,
  countItemsByType,
  createItem,
  deleteItem,
  getFavoriteItems,
  getItemDetail,
  getItemsByCollection,
  getItemsByType,
  getPinnedItems,
  getRecentItems,
  getSearchableItems,
  toggleItemFavorite,
  toggleItemPin,
  updateItem,
} from "@/lib/db/items";

/** Fixed so the toggle tests can assert the timestamp they hand back. */
const STAMP = new Date("2026-08-19T10:00:00.000Z");

const findMany = vi.mocked(prisma.item.findMany);
const findFirst = vi.mocked(prisma.item.findFirst);
const create = vi.mocked(prisma.item.create);
const update = vi.mocked(prisma.item.update);
const destroy = vi.mocked(prisma.item.delete);
const count = vi.mocked(prisma.item.count);
const collectionFindMany = vi.mocked(prisma.collection.findMany);

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
  create.mockReset();
  update.mockReset();
  destroy.mockReset();
  count.mockReset();
  collectionFindMany.mockReset();
  collectionFindMany.mockResolvedValue([] as never);
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
        isPinned: true,
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
        isPinned: true,
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

describe("getFavoriteItems", () => {
  it("flattens the raw Prisma row into FavoriteItemData", async () => {
    const updatedAt = new Date("2026-08-04T00:00:00.000Z");
    findMany.mockResolvedValue([
      {
        id: "item_1",
        title: "Senior Code Review",
        itemTypeId: "type_prompt",
        itemType: { name: "Prompt" },
        updatedAt,
      },
    ] as never);

    const result = await getFavoriteItems("user_demo");

    expect(result).toEqual([
      {
        id: "item_1",
        title: "Senior Code Review",
        itemTypeId: "type_prompt",
        itemTypeName: "Prompt",
        updatedAt,
      },
    ]);
  });

  it("scopes to the user and favorited items, sorted by recency", async () => {
    findMany.mockResolvedValue([] as never);

    await getFavoriteItems("user_demo");

    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({
      where: { userId: "user_demo", isFavorite: true },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });
  });
});

describe("getSearchableItems", () => {
  it("builds a preview from description, falling back to content then url", async () => {
    findMany.mockResolvedValue([
      {
        id: "item_1",
        title: "useDebounce",
        itemTypeId: "type_snippet",
        itemType: { name: "Snippet" },
        description: "A debounce hook",
        content: "const x = 1;",
        url: null,
      },
      {
        id: "item_2",
        title: "Command palette notes",
        itemTypeId: "type_note",
        itemType: { name: "Note" },
        description: null,
        content: "Ideas for the palette",
        url: null,
      },
      {
        id: "item_3",
        title: "Anthropic docs",
        itemTypeId: "type_link",
        itemType: { name: "Link" },
        description: null,
        content: null,
        url: "https://docs.anthropic.com",
      },
    ] as never);

    const result = await getSearchableItems("user_demo");

    expect(result).toEqual([
      {
        id: "item_1",
        title: "useDebounce",
        itemTypeId: "type_snippet",
        itemTypeName: "Snippet",
        preview: "A debounce hook",
      },
      {
        id: "item_2",
        title: "Command palette notes",
        itemTypeId: "type_note",
        itemTypeName: "Note",
        preview: "Ideas for the palette",
      },
      {
        id: "item_3",
        title: "Anthropic docs",
        itemTypeId: "type_link",
        itemTypeName: "Link",
        preview: "https://docs.anthropic.com",
      },
    ]);
  });

  it("truncates a long preview to 140 characters", async () => {
    findMany.mockResolvedValue([
      {
        id: "item_1",
        title: "Long note",
        itemTypeId: "type_note",
        itemType: { name: "Note" },
        description: null,
        content: "x".repeat(200),
        url: null,
      },
    ] as never);

    const result = await getSearchableItems("user_demo");

    expect(result[0].preview).toHaveLength(140);
  });

  it("scopes the query to the owner", async () => {
    findMany.mockResolvedValue([] as never);

    await getSearchableItems("user_demo");

    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: { userId: "user_demo" } });
  });

  it("caps the index rather than fetching every item unbounded", async () => {
    findMany.mockResolvedValue([] as never);

    await getSearchableItems("user_demo");

    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ take: 500 });
  });
});

describe("getPinnedItems", () => {
  it("caps the dashboard section instead of fetching every pinned row", async () => {
    findMany.mockResolvedValue([] as never);

    await getPinnedItems("user_demo");

    // Pinning used to be seed-only (2 rows); now any user can pin without
    // limit, and this section sits above two already-capped siblings.
    expect(findMany.mock.calls[0][0]).toMatchObject({
      take: DASHBOARD_PINNED_ITEMS_LIMIT,
    });
  });

  it("honours an explicit limit", async () => {
    findMany.mockResolvedValue([] as never);

    await getPinnedItems("user_demo", 3);

    expect(findMany.mock.calls[0][0]).toMatchObject({ take: 3 });
  });
});

describe("pinned-first ordering", () => {
  it.each([
    ["getItemsByType", () => getItemsByType("user_demo", "type_snippet")],
    [
      "getItemsByCollection",
      () => getItemsByCollection("user_demo", "col_react_patterns"),
    ],
  ])("sorts pinned items to the top in %s", async (_name, call) => {
    findMany.mockResolvedValue([] as never);

    await call();

    // In the query, not after it: these listings are paginated, so sorting a
    // single page in memory would leave pinned items stranded on later pages.
    expect(findMany.mock.calls[0][0]).toMatchObject({
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    });
  });

  it.each([
    ["getRecentItems", () => getRecentItems("user_demo")],
    ["getFavoriteItems", () => getFavoriteItems("user_demo")],
    ["getSearchableItems", () => getSearchableItems("user_demo")],
    ["getPinnedItems", () => getPinnedItems("user_demo")],
  ])("leaves %s on plain recency order", async (_name, call) => {
    findMany.mockResolvedValue([] as never);

    await call();

    // Deliberate exclusions. "Recent" means recently touched, and a permanent
    // pinned-first key would park pinned items at its head and crowd out the
    // actual recent activity the section exists to show. (It does *not* prevent
    // overlap with the Pinned section above it — a pin bumps updatedAt, so the
    // item surfaces in Recent regardless.) /favorites re-sorts client-side by
    // the user's chosen key; the search index is ranked by fuzzy score, not DB
    // order; and getPinnedItems already filters to isPinned, so a key there
    // could never do anything.
    const orderBy = findMany.mock.calls[0][0]?.orderBy;
    expect(orderBy).not.toContainEqual({ isPinned: "desc" });
  });
});

describe("paginated listings", () => {
  it("passes the page window through to Prisma for a type listing", async () => {
    findMany.mockResolvedValue([] as never);

    await getItemsByType("user_demo", "type_snippet", { skip: 21, take: 21 });

    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 21, take: 21 });
  });

  it("passes the page window through to Prisma for a collection listing", async () => {
    findMany.mockResolvedValue([] as never);

    await getItemsByCollection("user_demo", "col_react_patterns", {
      skip: 42,
      take: 21,
    });

    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 42, take: 21 });
  });

  it.each([
    ["getItemsByType", () => getItemsByType("user_demo", "type_snippet")],
    [
      "getItemsByCollection",
      () => getItemsByCollection("user_demo", "col_react_patterns"),
    ],
  ])("omits skip and take when %s is called without a window", async (_name, call) => {
    findMany.mockResolvedValue([] as never);

    await call();

    // The unpaginated callers rely on this: Prisma drops `undefined`, so one
    // function serves both the windowed page and a full fetch.
    const args = findMany.mock.calls[0][0];
    expect(args?.skip).toBeUndefined();
    expect(args?.take).toBeUndefined();
  });

  it("counts a type listing scoped to the owner", async () => {
    count.mockResolvedValue(37 as never);

    await expect(countItemsByType("user_demo", "type_snippet")).resolves.toBe(37);
    expect(count.mock.calls[0][0]).toMatchObject({
      where: { userId: "user_demo", itemTypeId: "type_snippet" },
    });
  });

  it("counts a collection listing scoped to the owner as well as the collection", async () => {
    count.mockResolvedValue(5 as never);

    await expect(
      countItemsByCollection("user_demo", "col_react_patterns"),
    ).resolves.toBe(5);
    // Dropping userId here would leak another user's total as a page count,
    // even though the listing itself refuses to show the rows.
    expect(count.mock.calls[0][0]).toMatchObject({
      where: {
        userId: "user_demo",
        collections: { some: { collectionId: "col_react_patterns" } },
      },
    });
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

    // Pinned first, then recency; updatedAt ties break on id because the seed
    // writes items in one transaction, so those values collide.
    expect(findMany.mock.calls[0][0]).toMatchObject({
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
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
        isPinned: true,
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
        isPinned: true,
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
    collectionIds: [],
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

  it("skips the ownership query and clears every collection link when none are selected", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);

    await updateItem("user_demo", "item_1", INPUT);

    expect(collectionFindMany).not.toHaveBeenCalled();
    const args = update.mock.calls[0][0];
    expect(args).toMatchObject({
      data: { collections: { deleteMany: {}, create: [] } },
    });
  });

  it("replaces collection links by clearing them then re-creating only the verified ids", async () => {
    findFirst.mockResolvedValue({ id: "item_1" } as never);
    update.mockResolvedValue(UPDATED_ROW as never);
    // "col_foreign" is not owned by this user and must not be returned here.
    collectionFindMany.mockResolvedValue([
      { id: "col_1" },
      { id: "col_2" },
    ] as never);

    await updateItem("user_demo", "item_1", {
      ...INPUT,
      collectionIds: ["col_1", "col_2", "col_foreign"],
    });

    expect(collectionFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["col_1", "col_2", "col_foreign"] }, userId: "user_demo" },
      select: { id: true },
    });
    const args = update.mock.calls[0][0];
    expect(args).toMatchObject({
      data: {
        collections: {
          deleteMany: {},
          create: [{ collectionId: "col_1" }, { collectionId: "col_2" }],
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

describe("toggleItemFavorite", () => {
  it("refuses to toggle an item the user does not own", async () => {
    findFirst.mockResolvedValue(null as never);

    await expect(toggleItemFavorite("user_other", "item_1")).resolves.toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it("checks ownership with both the item id and the user id", async () => {
    findFirst.mockResolvedValue({ isFavorite: false } as never);
    update.mockResolvedValue({ isFavorite: true, updatedAt: STAMP } as never);

    await toggleItemFavorite("user_demo", "item_1");

    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: { id: "item_1", userId: "user_demo" },
    });
  });

  it("flips false to true and returns the new value", async () => {
    findFirst.mockResolvedValue({ isFavorite: false } as never);
    update.mockResolvedValue({ isFavorite: true, updatedAt: STAMP } as never);

    // The bumped timestamp comes back with the flag: @updatedAt moves on every
    // write, and the drawer footer renders it.
    await expect(toggleItemFavorite("user_demo", "item_1")).resolves.toEqual({
      isFavorite: true,
      updatedAt: STAMP,
    });
    expect(update.mock.calls[0][0]).toEqual({
      where: { id: "item_1" },
      data: { isFavorite: true },
      select: { isFavorite: true, updatedAt: true },
    });
  });

  it("flips true to false and returns the new value", async () => {
    findFirst.mockResolvedValue({ isFavorite: true } as never);
    update.mockResolvedValue({ isFavorite: false, updatedAt: STAMP } as never);

    await expect(toggleItemFavorite("user_demo", "item_1")).resolves.toMatchObject({
      isFavorite: false,
    });
    expect(update.mock.calls[0][0]).toMatchObject({ data: { isFavorite: false } });
  });
});

describe("toggleItemPin", () => {
  it("refuses to toggle an item the user does not own", async () => {
    findFirst.mockResolvedValue(null as never);

    await expect(toggleItemPin("user_other", "item_1")).resolves.toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it("checks ownership with both the item id and the user id", async () => {
    findFirst.mockResolvedValue({ isPinned: false } as never);
    update.mockResolvedValue({ isPinned: true, updatedAt: STAMP } as never);

    await toggleItemPin("user_demo", "item_1");

    expect(findFirst.mock.calls[0][0]).toMatchObject({
      where: { id: "item_1", userId: "user_demo" },
    });
  });

  it("flips false to true and returns the new value", async () => {
    findFirst.mockResolvedValue({ isPinned: false } as never);
    update.mockResolvedValue({ isPinned: true, updatedAt: STAMP } as never);

    // The bumped timestamp comes back with the flag: @updatedAt moves on every
    // write, and the drawer footer renders it.
    await expect(toggleItemPin("user_demo", "item_1")).resolves.toEqual({
      isPinned: true,
      updatedAt: STAMP,
    });
    expect(update.mock.calls[0][0]).toEqual({
      where: { id: "item_1" },
      data: { isPinned: true },
      select: { isPinned: true, updatedAt: true },
    });
  });

  it("flips true to false and returns the new value", async () => {
    findFirst.mockResolvedValue({ isPinned: true } as never);
    update.mockResolvedValue({ isPinned: false, updatedAt: STAMP } as never);

    await expect(toggleItemPin("user_demo", "item_1")).resolves.toMatchObject({
      isPinned: false,
    });
    expect(update.mock.calls[0][0]).toMatchObject({ data: { isPinned: false } });
  });

  it("leaves isFavorite alone", async () => {
    findFirst.mockResolvedValue({ isPinned: false } as never);
    update.mockResolvedValue({ isPinned: true, updatedAt: STAMP } as never);

    await toggleItemPin("user_demo", "item_1");

    // Pin and favorite are independent flags; writing both here would clobber
    // whichever one the user did not touch.
    expect(update.mock.calls[0][0].data).not.toHaveProperty("isFavorite");
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
    collectionIds: [],
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

  it("skips the ownership query and creates no collection links when none are selected", async () => {
    create.mockResolvedValue(CREATED_ROW as never);

    await createItem("user_demo", INPUT);

    expect(collectionFindMany).not.toHaveBeenCalled();
    expect(create.mock.calls[0][0]).toMatchObject({
      data: { collections: { create: [] } },
    });
  });

  it("links only the collections verified as owned by this user", async () => {
    create.mockResolvedValue(CREATED_ROW as never);
    // "col_foreign" is not owned by this user and must not be returned here.
    collectionFindMany.mockResolvedValue([{ id: "col_1" }] as never);

    await createItem("user_demo", {
      ...INPUT,
      collectionIds: ["col_1", "col_foreign"],
    });

    expect(collectionFindMany).toHaveBeenCalledWith({
      where: { id: { in: ["col_1", "col_foreign"] }, userId: "user_demo" },
      select: { id: true },
    });
    expect(create.mock.calls[0][0]).toMatchObject({
      data: { collections: { create: [{ collectionId: "col_1" }] } },
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
