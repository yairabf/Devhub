import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  getCollectionsCount,
  getFavoriteCollectionsCount,
  getRecentCollections,
} from "@/lib/db/collections";
import {
  getFavoriteItemsCount,
  getItemsCount,
  getPinnedItems,
  getRecentItems,
} from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    recentCollections,
    pinnedItems,
    recentItems,
    collectionsCount,
    itemsCount,
    favoriteItemsCount,
    favoriteCollectionsCount,
  ] = await Promise.all([
    getRecentCollections(DEMO_USER_ID, 6),
    getPinnedItems(DEMO_USER_ID),
    getRecentItems(DEMO_USER_ID, 10),
    getCollectionsCount(DEMO_USER_ID),
    getItemsCount(DEMO_USER_ID),
    getFavoriteItemsCount(DEMO_USER_ID),
    getFavoriteCollectionsCount(DEMO_USER_ID),
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
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </DashboardSection>

      {pinnedItems.length > 0 && (
        <DashboardSection title="Pinned Items">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedItems.map(item => (
              <ItemCard key={item.id} item={item} />
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
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
