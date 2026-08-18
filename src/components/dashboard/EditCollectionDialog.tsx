"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
import { FormField } from "@/components/dashboard/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CollectionMeta } from "@/lib/db/collections";

interface EditCollectionDialogProps {
  collection: CollectionMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: CollectionMeta) => void;
}

interface CollectionDraft {
  name: string;
  description: string;
}

function toDraft(collection: CollectionMeta): CollectionDraft {
  return { name: collection.name, description: collection.description ?? "" };
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onSaved,
}: EditCollectionDialogProps) {
  const [draft, setDraft] = useState(() => toDraft(collection));
  const [nameTouched, setNameTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  const canSave = draft.name.trim().length > 0 && !pending;

  function set<K extends keyof CollectionDraft>(key: K, value: string) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    // Ignore dismissal while the request is in flight, so the dialog cannot
    // vanish mid-save.
    if (pending) return;
    onOpenChange(next);
    // Reset on close (without saving) so a re-open shows the stored values
    // again rather than an abandoned draft.
    if (!next) {
      setDraft(toDraft(collection));
      setNameTouched(false);
    }
  }

  function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!canSave) return;

    startTransition(async () => {
      const result = await updateCollection(collection.id, {
        name: draft.name,
        description: draft.description,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection updated");
      onOpenChange(false);
      onSaved(result.data);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-4rem)] overflow-y-auto"
        closeDisabled={pending}
      >
        <div>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>Update the name and description.</DialogDescription>
        </div>

        {/* noValidate: the server Zod schema is the source of truth, so its
            errors arrive as toasts instead of native bubbles blocking submit. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField htmlFor="edit-collection-name" label="Name">
            <Input
              id="edit-collection-name"
              value={draft.name}
              onChange={event => set("name", event.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="React Patterns"
              required
              aria-invalid={nameTouched && draft.name.trim().length === 0}
              disabled={pending}
            />
          </FormField>

          <FormField htmlFor="edit-collection-description" label="Description">
            <Textarea
              id="edit-collection-description"
              value={draft.description}
              onChange={event => set("description", event.target.value)}
              rows={3}
              placeholder="Reusable patterns and hooks"
              disabled={pending}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={!canSave}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
