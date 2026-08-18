"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CollectionCardData } from "@/lib/db/collections";

interface CollectionCardMenuProps {
  collection: CollectionCardData;
}

/**
 * The 3-dot action menu on a collection card, plus the Edit/Delete dialogs it
 * opens. All wrapped in one click-stopping div: the dropdown popup and the
 * dialogs render into portals, but React re-parents portal event bubbling
 * through the *component* tree rather than the DOM tree, so a click anywhere
 * in here (including inside the portaled popup/dialogs) would otherwise still
 * reach `CollectionCardTrigger` — the card's navigate-on-click wrapper — one
 * level up and trigger an unwanted navigation.
 */
export function CollectionCardMenu({ collection }: CollectionCardMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div onClick={event => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              title="Collection actions"
              aria-label="Collection actions"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem
            disabled
            title="Favorite — coming soon"
            aria-label={collection.isFavorite ? "Favorited" : "Not favorited"}
          >
            <Star
              className={
                collection.isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : undefined
              }
              aria-hidden
            />
            Favorite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCollectionDialog
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => router.refresh()}
      />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.refresh()}
      />
    </div>
  );
}
