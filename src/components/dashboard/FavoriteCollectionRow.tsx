import { Folder } from "lucide-react";

import { CollectionCardTrigger } from "@/components/dashboard/CollectionCardTrigger";
import { CollectionFavoriteButton } from "@/components/dashboard/CollectionFavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { FavoriteCollectionData } from "@/lib/db/collections";
import { formatIsoDate } from "@/lib/format";

interface FavoriteCollectionRowProps {
  collection: FavoriteCollectionData;
}

/**
 * Wrapped in `CollectionCardTrigger` (not a plain `<Link>`) now that the row
 * has an interactive `CollectionFavoriteButton` child — a real `<button>`
 * can't nest inside an `<a>`, the same reason `CollectionCard` moved off an
 * anchor wrap. Every row here is favorited by definition (the page only
 * lists favorites), so the button is always seeded `isFavorite`; unfavoriting
 * removes the row on the next `router.refresh()` rather than updating in
 * place.
 */
export function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  return (
    <CollectionCardTrigger
      collectionId={collection.id}
      name={collection.name}
      className="block cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
    >
      <div className="flex items-center gap-3 border-b border-border/50 px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/40">
        <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-medium">{collection.name}</span>
        <CollectionFavoriteButton
          collectionId={collection.id}
          isFavorite
          className="shrink-0"
        />
        <Badge variant="outline" className="shrink-0">
          <Folder className="size-3.5" aria-hidden />
          Collection
        </Badge>
        <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
          upd {formatIsoDate(collection.updatedAt.toISOString())}
        </span>
      </div>
    </CollectionCardTrigger>
  );
}
