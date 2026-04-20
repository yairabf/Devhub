import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { getRecentCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/mock-data";

const DEMO_USER_ID = "user_demo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const recentCollections = await getRecentCollections(DEMO_USER_ID, 6);
  const pinnedItems = getPinnedItems();
  const recentItems = getRecentItems(10);

  return (
    <div className="space-y-8">
      <StatsGrid />

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

      <DashboardSection title="Pinned Items">
        {pinnedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pinned items yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection title="Recent Items">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}
