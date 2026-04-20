import { FileText, FolderHeart, FolderOpen, Star } from "lucide-react";

import {
  COLLECTIONS,
  ITEMS,
  getFavoriteCollections,
  getFavoriteItems,
} from "@/lib/mock-data";

import { StatCard } from "./StatCard";

export function StatsGrid() {
  const favoriteItems = getFavoriteItems();
  const favoriteCollections = getFavoriteCollections();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Items" value={ITEMS.length} icon={FileText} />
      <StatCard label="Collections" value={COLLECTIONS.length} icon={FolderOpen} />
      <StatCard label="Favorite Items" value={favoriteItems.length} icon={Star} />
      <StatCard
        label="Favorite Collections"
        value={favoriteCollections.length}
        icon={FolderHeart}
      />
    </div>
  );
}
