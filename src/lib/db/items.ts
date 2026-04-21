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
