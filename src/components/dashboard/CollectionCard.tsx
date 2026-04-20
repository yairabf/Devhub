import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CollectionCardData } from "@/lib/db/collections";
import { getTypeIcon } from "@/lib/type-icons";
import { getTypeBorderClass } from "@/lib/type-colors";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: CollectionCardData;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const borderClass = getTypeBorderClass(collection.dominantTypeId);

  return (
    <Card className={cn("flex flex-col border-2", borderClass)}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <CardTitle className="leading-tight">{collection.name}</CardTitle>
        <Star
          className={cn(
            "size-4 shrink-0",
            collection.isFavorite
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          )}
        />
      </CardHeader>
      {collection.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="mt-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          {collection.uniqueTypeIds.map(typeId => {
            const Icon = getTypeIcon(typeId);
            return (
              <span
                key={typeId}
                aria-label={typeId}
                title={typeId}
                className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <Icon className="size-3.5" />
              </span>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
        </p>
      </CardFooter>
    </Card>
  );
}
