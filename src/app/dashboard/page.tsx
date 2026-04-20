import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import {
  getPinnedItems,
  getRecentCollections,
  getRecentItems,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const recentCollections = getRecentCollections(5);
  const pinnedItems = getPinnedItems();
  const recentItems = getRecentItems(10);

  return (
    <div className="space-y-8">
      <StatsGrid />

      <DashboardSection title="Recent Collections">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
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
