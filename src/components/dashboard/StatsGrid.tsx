import { FileText, FolderHeart, FolderOpen, Star } from "lucide-react";

import {
  getFavoriteCollections,
  getFavoriteItems,
} from "@/lib/mock-data";

import { StatCard } from "./StatCard";

interface StatsGridProps {
  itemsCount: number;
  collectionsCount: number;
}

export function StatsGrid({ itemsCount, collectionsCount }: StatsGridProps) {
  const favoriteItems = getFavoriteItems();
  const favoriteCollections = getFavoriteCollections();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Items" value={itemsCount} icon={FileText} />
      <StatCard label="Collections" value={collectionsCount} icon={FolderOpen} />
      <StatCard label="Favorite Items" value={favoriteItems.length} icon={Star} />
      <StatCard
        label="Favorite Collections"
        value={favoriteCollections.length}
        icon={FolderHeart}
      />
    </div>
  );
}
