import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { CollectionCardTrigger } from "@/components/dashboard/CollectionCardTrigger";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import {
  DASHBOARD_COLLECTIONS_LIMIT,
  DASHBOARD_RECENT_ITEMS_LIMIT,
} from "@/lib/constants";
import {
  getCollectionsCount,
  getFavoriteCollectionsCount,
  getCollections,
} from "@/lib/db/collections";
import {
  getFavoriteItemsCount,
  getItemsCount,
  getPinnedItems,
  getRecentItems,
} from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }
  const userId = session.user.id;

  const [
    recentCollections,
    pinnedItems,
    recentItems,
    collectionsCount,
    itemsCount,
    favoriteItemsCount,
    favoriteCollectionsCount,
  ] = await Promise.all([
    getCollections(userId, { take: DASHBOARD_COLLECTIONS_LIMIT }),
    getPinnedItems(userId),
    getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
    getCollectionsCount(userId),
    getItemsCount(userId),
    getFavoriteItemsCount(userId),
    getFavoriteCollectionsCount(userId),
  ]);

  return (
    <div className="space-y-8">
      <StatsGrid
        itemsCount={itemsCount}
        collectionsCount={collectionsCount}
        favoriteItemsCount={favoriteItemsCount}
        favoriteCollectionsCount={favoriteCollectionsCount}
      />

      <DashboardSection title="Recent Collections">
        {recentCollections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentCollections.map(collection => (
              <CollectionCardTrigger
                key={collection.id}
                collectionId={collection.id}
                name={collection.name}
              >
                <CollectionCard collection={collection} />
              </CollectionCardTrigger>
            ))}
          </div>
        )}
      </DashboardSection>

      {pinnedItems.length > 0 && (
        <DashboardSection title="Pinned Items">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedItems.map(item => (
              <ItemCardTrigger key={item.id} itemId={item.id} title={item.title}>
                <ItemCard item={item} />
              </ItemCardTrigger>
            ))}
          </div>
        </DashboardSection>
      )}

      <DashboardSection title="Recent Items">
        {recentItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentItems.map(item => (
              <ItemCardTrigger key={item.id} itemId={item.id} title={item.title}>
                <ItemCard item={item} />
              </ItemCardTrigger>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
