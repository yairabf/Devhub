"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
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
import type { SidebarItemType } from "@/lib/db/items";
import { capitalize } from "@/lib/format";
import {
  buildCreatePayload,
  getEditableFields,
  orderCreatableTypes,
  usesCodeEditor,
  type ItemDraft,
} from "@/lib/item-form";
import { getTypeTextClass } from "@/lib/type-colors";
import { TypeGlyph } from "@/lib/type-icons";
import { cn } from "@/lib/utils";

const EMPTY_DRAFT: ItemDraft = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
};

interface NewItemDialogProps {
  /** System types from the layout; Pro upload types are filtered out here. */
  itemTypes: SidebarItemType[];
}

export function NewItemDialog({ itemTypes }: NewItemDialogProps) {
  const router = useRouter();
  const creatable = orderCreatableTypes(itemTypes);

  const [open, setOpen] = useState(false);
  const [itemTypeId, setItemTypeId] = useState(creatable[0]?.id ?? "");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  // A fresh form should not open already marked invalid, so the title only
  // reports its error once the user has been in the field.
  const [titleTouched, setTitleTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  const fields = getEditableFields(itemTypeId);
  const showCodeEditor = usesCodeEditor(itemTypeId);
  const canSave = draft.title.trim().length > 0 && itemTypeId !== "" && !pending;

  function set<K extends keyof ItemDraft>(key: K, value: string) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    // Reset on close so the next open starts clean rather than showing the
    // previous draft.
    if (!next) {
      setDraft(EMPTY_DRAFT);
      setItemTypeId(creatable[0]?.id ?? "");
      setTitleTouched(false);
    }
  }

  function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!canSave) return;

    startTransition(async () => {
      const result = await createItem(buildCreatePayload(itemTypeId, draft));

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item created");
      setDraft(EMPTY_DRAFT);
      setItemTypeId(creatable[0]?.id ?? "");
      setTitleTouched(false);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger rather than a plain button: base-ui wires the aria attributes
          and returns focus here on close. */}
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New Item
          </Button>
        }
      />
      <DialogContent
        className="max-h-[calc(100vh-4rem)] overflow-y-auto"
        closeDisabled={pending}
      >
        <div>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Pick a type, then fill in what that type needs.
          </DialogDescription>
        </div>

        {/* noValidate: the server Zod schema is the source of truth, so its
            errors arrive as toasts instead of native bubbles blocking submit. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <fieldset className="space-y-1.5" disabled={pending}>
            <legend className="mb-1.5 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Type
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {creatable.map(type => (
                <label
                  key={type.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    "has-[:checked]:border-foreground/30 has-[:checked]:bg-muted",
                    "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  )}
                >
                  <input
                    type="radio"
                    name="itemType"
                    value={type.id}
                    checked={itemTypeId === type.id}
                    onChange={() => setItemTypeId(type.id)}
                    className="sr-only"
                  />
                  <TypeGlyph
                    typeId={type.id}
                    className={cn("size-3.5", getTypeTextClass(type.id))}
                  />
                  {capitalize(type.name)}
                </label>
              ))}
            </div>
          </fieldset>

          <FormField htmlFor="new-item-title" label="Title">
            <Input
              id="new-item-title"
              value={draft.title}
              onChange={event => set("title", event.target.value)}
              onBlur={() => setTitleTouched(true)}
              placeholder="useDebounce Hook"
              required
              aria-invalid={titleTouched && draft.title.trim().length === 0}
              disabled={pending}
            />
          </FormField>

          <FormField htmlFor="new-item-description" label="Description">
            <Textarea
              id="new-item-description"
              value={draft.description}
              onChange={event => set("description", event.target.value)}
              rows={2}
              disabled={pending}
            />
          </FormField>

          {fields.content &&
            (showCodeEditor ? (
              // No htmlFor: Monaco is a widget, not an input. It names itself
              // through ariaLabel instead.
              <FormField label="Content">
                <CodeEditor
                  value={draft.content}
                  language={draft.language}
                  onChange={next => set("content", next)}
                  disabled={pending}
                  ariaLabel="Content"
                />
              </FormField>
            ) : (
              <FormField htmlFor="new-item-content" label="Content">
                <Textarea
                  id="new-item-content"
                  value={draft.content}
                  onChange={event => set("content", event.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  disabled={pending}
                />
              </FormField>
            ))}

          {fields.language && (
            <FormField htmlFor="new-item-language" label="Language">
              <Input
                id="new-item-language"
                value={draft.language}
                onChange={event => set("language", event.target.value)}
                placeholder="typescript"
                disabled={pending}
              />
            </FormField>
          )}

          {fields.url && (
            <FormField htmlFor="new-item-url" label="URL">
              <Input
                id="new-item-url"
                value={draft.url}
                onChange={event => set("url", event.target.value)}
                placeholder="https://example.com"
                disabled={pending}
              />
            </FormField>
          )}

          <FormField htmlFor="new-item-tags" label="Tags">
            <Input
              id="new-item-tags"
              value={draft.tags}
              onChange={event => set("tags", event.target.value)}
              placeholder="react, hooks"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas.
            </p>
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
              {pending ? "Creating…" : "Create item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
