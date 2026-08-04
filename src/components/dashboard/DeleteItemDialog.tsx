"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteItem } from "@/actions/items";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteItemDialogProps {
  itemId: string;
  itemTitle: string;
  onDeleted: (itemId: string) => void;
}

export function DeleteItemDialog({
  itemId,
  itemTitle,
  onDeleted,
}: DeleteItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteItem(itemId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item deleted");
      setOpen(false);
      onDeleted(itemId);
    });
  }

  return (
    <AlertDialog
      open={open}
      // Ignore dismiss attempts mid-request so the dialog can't vanish while
      // the delete is still in flight.
      onOpenChange={next => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Delete item"
            aria-label="Delete item"
            className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      />
      <AlertDialogContent className="z-60">
        <AlertDialogTitle>Delete this item?</AlertDialogTitle>
        <AlertDialogDescription>
          <span className="font-medium text-foreground">{itemTitle}</span> will
          be permanently deleted and removed from any collections it belongs to.
          This cannot be undone.
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
            {pending ? "Deleting…" : "Delete item"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
