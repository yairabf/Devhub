"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createCollection } from "@/actions/collections";
import { FormField } from "@/components/dashboard/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CollectionDraft {
  name: string;
  description: string;
}

const EMPTY_DRAFT: CollectionDraft = { name: "", description: "" };

export function NewCollectionDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  // A fresh form should not open already marked invalid, so the name only
  // reports its error once the user has been in the field.
  const [nameTouched, setNameTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  const canSave = draft.name.trim().length > 0 && !pending;

  function set<K extends keyof CollectionDraft>(key: K, value: string) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setNameTouched(false);
  }

  function handleOpenChange(next: boolean) {
    // Ignore dismissal while the request is in flight, so the dialog cannot
    // vanish mid-create.
    if (pending) return;
    setOpen(next);
    // Reset on close so the next open starts clean rather than showing the
    // previous draft.
    if (!next) reset();
  }

  function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!canSave) return;

    startTransition(async () => {
      const result = await createCollection({
        name: draft.name,
        description: draft.description,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection created");
      reset();
      setOpen(false);
      // Pulls the server-rendered surfaces forward: the sidebar's Recent
      // Collections, the dashboard grid, and the Collections stat count.
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger rather than a plain button: base-ui wires the aria attributes
          and returns focus here on close. */}
      <DialogTrigger
        render={
          <Button variant="outline">
            <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
            New Collection
          </Button>
        }
      />
      <DialogContent
        className="max-h-[calc(100vh-4rem)] overflow-y-auto"
        closeDisabled={pending}
      >
        <div>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>
            Collections group related items. You can add items to it afterwards.
          </DialogDescription>
        </div>

        {/* noValidate: the server Zod schema is the source of truth, so its
            errors arrive as toasts instead of native bubbles blocking submit. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField htmlFor="new-collection-name" label="Name">
            <Input
              id="new-collection-name"
              value={draft.name}
              onChange={event => set("name", event.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="React Patterns"
              required
              aria-invalid={nameTouched && draft.name.trim().length === 0}
              disabled={pending}
            />
          </FormField>

          <FormField htmlFor="new-collection-description" label="Description">
            <Textarea
              id="new-collection-description"
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
              {pending ? "Creating…" : "Create collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
