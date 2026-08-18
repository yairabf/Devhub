"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteCollection } from "@/actions/collections";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteCollectionDialogProps {
  collectionId: string;
  collectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (collectionId: string) => void;
}

export function DeleteCollectionDialog({
  collectionId,
  collectionName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCollection(collectionId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection deleted");
      onOpenChange(false);
      onDeleted(collectionId);
    });
  }

  return (
    <AlertDialog
      open={open}
      // Ignore dismiss attempts mid-request so the dialog can't vanish while
      // the delete is still in flight.
      onOpenChange={next => {
        if (!pending) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
        <AlertDialogDescription>
          <span className="font-medium text-foreground">{collectionName}</span>{" "}
          will be permanently deleted. Its items are not deleted — they just
          won&apos;t belong to this collection anymore. This cannot be undone.
        </AlertDialogDescription>

        <div className="mt-6 flex justify-end gap-2">
          <AlertDialogClose
            render={
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            }
          />
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
