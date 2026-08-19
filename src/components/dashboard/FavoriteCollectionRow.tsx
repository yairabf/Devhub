import { Folder } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { FavoriteCollectionData } from "@/lib/db/collections";
import { formatIsoDate } from "@/lib/format";

interface FavoriteCollectionRowProps {
  collection: FavoriteCollectionData;
}

/**
 * A plain `<Link>` wrap (no client trigger needed): unlike `CollectionCard`,
 * this row has no interactive children (menu, copy button) to conflict with
 * nesting inside an anchor.
 */
export function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex items-center gap-3 border-b border-border/50 px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/40"
    >
      <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 truncate font-medium">{collection.name}</span>
      <Badge variant="outline" className="shrink-0">
        <Folder className="size-3.5" aria-hidden />
        Collection
      </Badge>
      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
        upd {formatIsoDate(collection.updatedAt.toISOString())}
      </span>
    </Link>
  );
}
