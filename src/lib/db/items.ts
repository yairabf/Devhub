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
  itemTypeId: string;
  itemTypeName: string;
  tags: ItemTagData[];
}

export interface ItemCollectionData {
  id: string;
  name: string;
}

/** Full item detail, fetched on demand by the item drawer. */
export interface ItemDetailData extends ItemCardData {
  language: string | null;
  isPinned: boolean;
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
    itemTypeId: item.itemTypeId,
    itemTypeName: item.itemType.name,
    tags: item.tags,
  };
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, collections: { some: { collectionId } } },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

export async function getPinnedItems(userId: string): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
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
): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: { userId, itemTypeId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: ITEM_SELECT,
  });
  return items.map(toCardData);
}

const ITEM_DETAIL_SELECT = {
  ...ITEM_SELECT,
  language: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  collections: {
    select: { collection: { select: { id: true, name: true } } },
    orderBy: { collection: { name: "asc" } },
  },
} as const;

type RawDetailItem = RawItem & {
  language: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  collections: { collection: ItemCollectionData }[];
};

function toDetailData(item: RawDetailItem): ItemDetailData {
  return {
    ...toCardData(item),
    language: item.language,
    isPinned: item.isPinned,
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

export function getItemsCount(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId } });
}

export function getFavoriteItemsCount(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId, isFavorite: true } });
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
