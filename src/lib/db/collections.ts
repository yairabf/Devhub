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

export async function getRecentCollections(
  userId: string,
  limit = 6,
): Promise<CollectionCardData[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            select: { itemTypeId: true },
          },
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
      itemCount: collection.items.length,
      uniqueTypeIds: Array.from(typeCounts.keys()),
      dominantTypeId,
    };
  });
}
