import { DASHBOARD_PINNED_ITEMS_LIMIT } from "@/lib/constants";
import type { PageWindow } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export interface ItemTagData {
  id: string;
  name: string;
}

export interface ItemCardData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  itemTypeName: string;
  tags: ItemTagData[];
}

/**
 * The fields a drawer action can change on its own, without going through a full
 * save. Used to keep the drawer's fetched detail in step with a toggle —
 * `updatedAt` is included because Prisma's `@updatedAt` fires on any write, so a
 * toggle moves it and the drawer footer renders it.
 */
export type ItemFlagPatch = Partial<
  Pick<ItemDetailData, "isFavorite" | "isPinned" | "updatedAt">
>;

export interface ItemCollectionData {
  id: string;
  name: string;
}

/** Full item detail, fetched on demand by the item drawer. */
export interface ItemDetailData extends ItemCardData {
  language: string | null;
  collections: ItemCollectionData[];
  /** ISO string — the drawer receives this over JSON. */
  createdAt: string;
  updatedAt: string;
}

const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  isFavorite: true,
  isPinned: true,
  itemTypeId: true,
  itemType: { select: { name: true } },
  tags: { select: { id: true, name: true } },
} as const;

type RawItem = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  itemType: { name: string };
  tags: { id: string; name: string }[];
};

function toCardData(item: RawItem): ItemCardData {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemTypeId: item.itemTypeId,
    itemTypeName: item.itemType.name,
    tags: item.tags,
  };
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
  window: PageWindow = {},
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, collections: { some: { collectionId } } },
    // Pinned first, then the standard recency order. Applied in the query
    // rather than after, so it stays correct across paginated windows.
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    skip: window.skip,
    take: window.take,
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

/**
 * The total behind `getItemsByCollection`, for the page count. Scoped to the
 * owner as well as the collection, so it can never report rows the listing
 * itself would refuse to show.
 */
export function countItemsByCollection(
  userId: string,
  collectionId: string,
): Promise<number> {
  return prisma.item.count({
    where: { userId, collections: { some: { collectionId } } },
  });
}

/**
 * Backs the dashboard's "Pinned Items" section. No `isPinned` sort key here —
 * every row already is. Recency stands in for "recently pinned": there is no
 * `pinnedAt` column, and since a pin toggle bumps `updatedAt`, the item the user
 * just pinned lands at the front, which is the order that reads correctly.
 *
 * Capped like its sibling dashboard sections. Pinning used to be seed-only (two
 * rows); now that anyone can pin, an uncapped fetch would put every pinned item's
 * `content` on the wire on every render of this `force-dynamic` page.
 */
export async function getPinnedItems(
  userId: string,
  limit = DASHBOARD_PINNED_ITEMS_LIMIT,
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: limit,
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: limit,
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

export async function getItemsByType(
  userId: string,
  itemTypeId: string,
  window: PageWindow = {},
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, itemTypeId },
    // Pinned first — see getItemsByCollection.
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    skip: window.skip,
    take: window.take,
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

/** The total behind `getItemsByType`, for the page count. */
export function countItemsByType(
  userId: string,
  itemTypeId: string,
): Promise<number> {
  return prisma.item.count({ where: { userId, itemTypeId } });
}

const ITEM_DETAIL_SELECT = {
  ...ITEM_SELECT,
  language: true,
  createdAt: true,
  updatedAt: true,
  collections: {
    select: { collection: { select: { id: true, name: true } } },
    orderBy: { collection: { name: "asc" } },
  },
} as const;

type RawDetailItem = RawItem & {
  language: string | null;
  createdAt: Date;
  updatedAt: Date;
  collections: { collection: ItemCollectionData }[];
};

function toDetailData(item: RawDetailItem): ItemDetailData {
  return {
    ...toCardData(item),
    language: item.language,
    collections: item.collections.map(link => link.collection),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function getItemDetail(
  userId: string,
  itemId: string,
): Promise<ItemDetailData | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: ITEM_DETAIL_SELECT,
  });
  if (!item) return null;

  return toDetailData(item);
}

/**
 * Filters `collectionIds` down to the ones `userId` actually owns — a client
 * could send any id it likes, and this is what stops that from linking an
 * item into someone else's collection. Skips the query entirely when nothing
 * was selected, the common case for most saves.
 */
async function verifyCollectionIds(
  userId: string,
  collectionIds: string[],
): Promise<string[]> {
  if (collectionIds.length === 0) return [];

  const owned = await prisma.collection.findMany({
    where: { id: { in: collectionIds }, userId },
    select: { id: true },
  });
  return owned.map(collection => collection.id);
}

export interface CreateItemInput {
  itemTypeId: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  /** Trimmed, non-empty, de-duplicated tag names. */
  tags: string[];
  /** Collections to add the item to; verified against the owner before use. */
  collectionIds: string[];
}

/**
 * Creates an item for the user and returns its full detail.
 *
 * `contentType` is required by the schema with no default; every type this
 * dialog can create stores its body as text, matching the seed.
 */
export async function createItem(
  userId: string,
  data: CreateItemInput,
): Promise<ItemDetailData> {
  const collectionIds = await verifyCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.create({
    data: {
      title: data.title,
      contentType: "text",
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        connectOrCreate: data.tags.map(name => ({
          where: { name },
          create: { name },
        })),
      },
      collections: {
        create: collectionIds.map(collectionId => ({ collectionId })),
      },
    },
    select: ITEM_DETAIL_SELECT,
  });

  return toDetailData(item);
}

export interface UpdateItemInput {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  /** Trimmed, non-empty, de-duplicated tag names. */
  tags: string[];
  /** Collections to add the item to; verified against the owner before use. */
  collectionIds: string[];
}

/**
 * Updates an item the user owns and returns the fresh detail, or null when the
 * item does not exist or belongs to someone else. Tags and collections are
 * both replaced wholesale: tags via `set: []` + connect-or-create, and
 * collections (an explicit join model, so `set` isn't available on it) via
 * `deleteMany: {}` + `create`.
 */
export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemInput,
): Promise<ItemDetailData | null> {
  const owned = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });
  if (!owned) return null;

  const collectionIds = await verifyCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        set: [],
        connectOrCreate: data.tags.map(name => ({
          where: { name },
          create: { name },
        })),
      },
      collections: {
        deleteMany: {},
        create: collectionIds.map(collectionId => ({ collectionId })),
      },
    },
    select: ITEM_DETAIL_SELECT,
  });

  return toDetailData(item);
}

/**
 * Deletes an item the user owns and reports whether it happened. Ownership is
 * checked first (same reason as `updateItem`: no coupling to Prisma's P2025),
 * so a missing or foreign item returns false instead of throwing. The
 * `ItemCollection` links and implicit tag links cascade with the row.
 */
export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<boolean> {
  const owned = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });
  if (!owned) return false;

  await prisma.item.delete({ where: { id: itemId } });
  return true;
}

/**
 * Flips `isFavorite` for an item the user owns and returns the new value, or
 * `null` when the item does not exist or belongs to someone else. Ownership
 * is checked first, same reason as `updateItem`/`deleteItem`: no coupling to
 * Prisma's `P2025`.
 */
export async function toggleItemFavorite(
  userId: string,
  itemId: string,
): Promise<{ isFavorite: boolean; updatedAt: Date } | null> {
  const owned = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { isFavorite: true },
  });
  if (!owned) return null;

  return prisma.item.update({
    where: { id: itemId },
    data: { isFavorite: !owned.isFavorite },
    // updatedAt comes back because @updatedAt moved it and the drawer footer
    // shows it — without this the caller would patch a stale timestamp forward.
    select: { isFavorite: true, updatedAt: true },
  });
}

/**
 * Flips `isPinned` on an item the user owns and returns the new value plus the
 * bumped `updatedAt`, or `null` when the item is missing or belongs to someone
 * else. Mirrors `toggleItemFavorite`.
 */
export async function toggleItemPin(
  userId: string,
  itemId: string,
): Promise<{ isPinned: boolean; updatedAt: Date } | null> {
  const owned = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { isPinned: true },
  });
  if (!owned) return null;

  return prisma.item.update({
    where: { id: itemId },
    data: { isPinned: !owned.isPinned },
    select: { isPinned: true, updatedAt: true },
  });
}

export function getItemsCount(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId } });
}

export function getFavoriteItemsCount(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId, isFavorite: true } });
}

/** The narrow shape the favorites list row needs — no content/tags/url. */
export interface FavoriteItemData {
  id: string;
  title: string;
  itemTypeId: string;
  itemTypeName: string;
  updatedAt: Date;
}

export async function getFavoriteItems(userId: string): Promise<FavoriteItemData[]> {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      itemTypeId: true,
      itemType: { select: { name: true } },
      updatedAt: true,
    },
  });

  return items.map(item => ({
    id: item.id,
    title: item.title,
    itemTypeId: item.itemTypeId,
    itemTypeName: item.itemType.name,
    updatedAt: item.updatedAt,
  }));
}

export interface SidebarItemType {
  id: string;
  name: string;
  color: string;
}

export function getSystemItemTypes(): Promise<SidebarItemType[]> {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
}

/** The narrow shape the command palette's search index needs — no full content. */
export interface SearchableItem {
  id: string;
  title: string;
  itemTypeId: string;
  itemTypeName: string;
  preview: string;
}

const SEARCH_PREVIEW_LENGTH = 140;

/**
 * The command palette prefetches the whole index client-side (no per-keystroke
 * round-trip), which only holds up while an account's item count stays small.
 * This caps the payload rather than leaving it unbounded — most-recent items
 * win, since those are the ones a search is most likely for.
 */
const SEARCH_INDEX_LIMIT = 500;

/**
 * Prisma can't truncate a column in `select`, so the preview is sliced here,
 * server-side, before the narrow `SearchableItem` — not the full row — ever
 * reaches the client bundle.
 */
function buildPreview(item: {
  description: string | null;
  content: string | null;
  url: string | null;
}): string {
  const source = item.description ?? item.content ?? item.url ?? "";
  return source.slice(0, SEARCH_PREVIEW_LENGTH);
}

export async function getSearchableItems(
  userId: string,
): Promise<SearchableItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: SEARCH_INDEX_LIMIT,
    select: {
      id: true,
      title: true,
      itemTypeId: true,
      itemType: { select: { name: true } },
      description: true,
      content: true,
      url: true,
    },
  });

  return items.map(item => ({
    id: item.id,
    title: item.title,
    itemTypeId: item.itemTypeId,
    itemTypeName: item.itemType.name,
    preview: buildPreview(item),
  }));
}

export interface ItemTypeBreakdown {
  id: string;
  name: string;
  count: number;
}

export async function getItemsCountByType(
  userId: string,
): Promise<ItemTypeBreakdown[]> {
  const rows = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { items: { where: { userId } } } },
    },
  });
  return rows.map((t) => ({ id: t.id, name: t.name, count: t._count.items }));
}
