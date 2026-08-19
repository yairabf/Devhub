"use client";

import { Pin } from "lucide-react";

import { useItemPin } from "@/components/dashboard/useItemPin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemPinButtonProps {
  itemId: string;
  isPinned: boolean;
  size?: "icon-xs" | "icon-sm";
  className?: string;
}

export function ItemPinButton({
  itemId,
  isPinned,
  size = "icon-xs",
  className,
}: ItemPinButtonProps) {
  const { pinned, toggle, pending } = useItemPin(itemId, isPinned);
  const label = pinned ? "Unpin" : "Pin";

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={pending}
      onClick={event => {
        // Whatever this sits in may itself be a drawer trigger.
        event.stopPropagation();
        toggle();
      }}
      aria-label={label}
      title={label}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      <Pin
        className={cn(
          "size-4",
          pinned ? "fill-foreground text-foreground" : "text-muted-foreground",
        )}
        aria-hidden
      />
    </Button>
  );
}
