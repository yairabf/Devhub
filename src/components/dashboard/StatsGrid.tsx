import { FileText, FolderHeart, FolderOpen, Star } from "lucide-react";

import { StatCard } from "./StatCard";

interface StatsGridProps {
  itemsCount: number;
  collectionsCount: number;
  favoriteItemsCount: number;
  favoriteCollectionsCount: number;
}

export function StatsGrid({
  itemsCount,
  collectionsCount,
  favoriteItemsCount,
  favoriteCollectionsCount,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Items" value={itemsCount} icon={FileText} />
      <StatCard label="Collections" value={collectionsCount} icon={FolderOpen} />
      <StatCard label="Favorite Items" value={favoriteItemsCount} icon={Star} />
      <StatCard
        label="Favorite Collections"
        value={favoriteCollectionsCount}
        icon={FolderHeart}
      />
    </div>
  );
}
