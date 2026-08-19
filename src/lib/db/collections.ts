import type { PageWindow } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export interface CollectionCardData {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  uniqueTypeIds: string[];
  dominantTypeId: string | null;
}

export function getCollectionsCount(userId: string): Promise<number> {
  return prisma.collection.count({ where: { userId } });
}

export function getFavoriteCollectionsCount(userId: string): Promise<number> {
  return prisma.collection.count({ where: { userId, isFavorite: true } });
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
}

export function getFavoriteCollections(
  userId: string,
): Promise<SidebarCollection[]> {
  return prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, isFavorite: true },
  });
}

/** The narrow shape the favorites list row needs — no description. */
export interface FavoriteCollectionData {
  id: string;
  name: string;
  itemCount: number;
  updatedAt: Date;
}

/**
 * Sibling to `getFavoriteCollections` (which only feeds the sidebar's
 * id/name/isFavorite shape): the favorites page also needs a count and the
 * recency timestamp to render.
 */
export async function getFavoriteCollectionsList(
  userId: string,
): Promise<FavoriteCollectionData[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  return collections.map(collection => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
    updatedAt: collection.updatedAt,
  }));
}

export interface CollectionOption {
  id: string;
  name: string;
}

/**
 * Every collection the user owns, trimmed to just id + name — the shape a
 * picker needs. Alphabetical rather than recency-ordered: a checkbox list is
 * scanned by name, not by what was touched most recently.
 */
export function getCollectionOptions(userId: string): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Header data for the collection detail page. */
export interface CollectionMeta {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}

/**
 * Looks up one collection the user owns, or null when it does not exist or
 * belongs to someone else. `findFirst` rather than `findUnique` because the
 * latter only accepts unique fields, and `userId` is not part of what makes
 * `id` unique — scoping on both is what stops a shared or guessed URL from
 * reading another user's collection.
 */
export function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<CollectionMeta | null> {
  return prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true, name: true, description: true, isFavorite: true },
  });
}

export interface CreateCollectionInput {
  name: string;
  description: string | null;
}

/**
 * Creates a collection owned by `userId`. Returns `CollectionCardData` so the
 * caller has the same shape the grids render, without a second read — a fresh
 * collection is always empty, hence the zeroed counts.
 */
export async function createCollection(
  userId: string,
  data: CreateCollectionInput,
): Promise<CollectionCardData> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
    },
    select: { id: true, name: true, description: true, isFavorite: true },
  });

  return {
    ...collection,
    itemCount: 0,
    uniqueTypeIds: [],
    dominantTypeId: null,
  };
}

export interface UpdateCollectionInput {
  name: string;
  description: string | null;
}

/**
 * Updates a collection's metadata (name/description only). Ownership is
 * verified with `findFirst` before writing, mirroring `updateItem` — so a
 * missing or foreign id returns `null` instead of coupling to Prisma's
 * `P2025`.
 */
export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionInput,
): Promise<CollectionMeta | null> {
  const owned = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });
  if (!owned) return null;

  return prisma.collection.update({
    where: { id: collectionId },
    data: { name: data.name, description: data.description },
    select: { id: true, name: true, description: true, isFavorite: true },
  });
}

/**
 * Deletes a collection. Only the collection row and its `ItemCollection`
 * membership rows go away (`onDelete: Cascade` on that join model) — the
 * items themselves are untouched.
 */
export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  const owned = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });
  if (!owned) return false;

  await prisma.collection.delete({ where: { id: collectionId } });
  return true;
}

export async function getCollections(
  userId: string,
  window: PageWindow = {},
): Promise<CollectionCardData[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    // Prisma drops an `undefined` argument entirely, so an empty window
    // returns every collection.
    skip: window.skip,
    take: window.take,
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      _count: { select: { items: true } },
      items: {
        select: {
          item: { select: { itemTypeId: true } },
        },
      },
    },
  });

  return collections.map(collection => {
    const typeCounts = new Map<string, number>();
    for (const link of collection.items) {
      const typeId = link.item.itemTypeId;
      typeCounts.set(typeId, (typeCounts.get(typeId) ?? 0) + 1);
    }

    let dominantTypeId: string | null = null;
    let maxCount = 0;
    for (const [typeId, count] of typeCounts) {
      if (count > maxCount) {
        dominantTypeId = typeId;
        maxCount = count;
      }
    }

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      uniqueTypeIds: Array.from(typeCounts.keys()),
      dominantTypeId,
    };
  });
}
