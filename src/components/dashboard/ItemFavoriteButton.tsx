"use client";

import { Star } from "lucide-react";

import { useItemFavorite } from "@/components/dashboard/useItemFavorite";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemFavoriteButtonProps {
  itemId: string;
  isFavorite: boolean;
  size?: "icon-xs" | "icon-sm";
  className?: string;
}

export function ItemFavoriteButton({
  itemId,
  isFavorite,
  size = "icon-xs",
  className,
}: ItemFavoriteButtonProps) {
  const { favorite, toggle, pending } = useItemFavorite(itemId, isFavorite);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={pending}
      onClick={event => {
        // The card this sits in may itself be a drawer trigger.
        event.stopPropagation();
        toggle();
      }}
      aria-label={favorite ? "Unfavorite" : "Favorite"}
      title={favorite ? "Unfavorite" : "Favorite"}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      <Star
        className={cn(
          "size-4",
          favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
        )}
        aria-hidden
      />
    </Button>
  );
}
