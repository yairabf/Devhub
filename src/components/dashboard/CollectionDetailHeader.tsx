"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CollectionFavoriteButton } from "@/components/dashboard/CollectionFavoriteButton";
import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { Button } from "@/components/ui/button";
import type { CollectionMeta } from "@/lib/db/collections";

interface CollectionDetailHeaderProps {
  collection: CollectionMeta;
  itemCount: number;
}

export function CollectionDetailHeader({
  collection: initialCollection,
  itemCount,
}: CollectionDetailHeaderProps) {
  const router = useRouter();
  const [collection, setCollection] = useState(initialCollection);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDeleted() {
    router.push("/collections");
    router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <CollectionFavoriteButton
          collectionId={collection.id}
          isFavorite={collection.isFavorite}
          size="icon-sm"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditOpen(true)}
          title="Edit collection"
          aria-label="Edit collection"
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteOpen(true)}
          title="Delete collection"
          aria-label="Delete collection"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>

      <EditCollectionDialog
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={updated => {
          setCollection(updated);
          router.refresh();
        }}
      />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
