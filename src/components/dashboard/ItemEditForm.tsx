"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateItem } from "@/actions/items";
import { CodeEditor } from "@/components/dashboard/CodeEditor";
import { CollectionPicker } from "@/components/dashboard/CollectionPicker";
import { FormField } from "@/components/dashboard/FormField";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemDetailData } from "@/lib/db/items";
import {
  buildUpdatePayload,
  getEditableFields,
  usesCodeEditor,
} from "@/lib/item-form";

interface ItemEditFormProps {
  item: ItemDetailData;
  /** The user's collections, for the Collections picker. */
  collectionOptions: CollectionOption[];
  onCancel: () => void;
  onSaved: (updated: ItemDetailData) => void;
}

export function ItemEditForm({
  item,
  collectionOptions,
  onCancel,
  onSaved,
}: ItemEditFormProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tags, setTags] = useState(item.tags.map(tag => tag.name).join(", "));
  const [collectionIds, setCollectionIds] = useState(
    item.collections.map(collection => collection.id),
  );
  const [pending, startTransition] = useTransition();

  const {
    content: showContent,
    language: showLanguage,
    url: showUrl,
  } = getEditableFields(item.itemTypeId);
  const showCodeEditor = usesCodeEditor(item.itemTypeId);
  const canSave = title.trim().length > 0 && !pending;

  function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!canSave) return;

    startTransition(async () => {
      const payload = buildUpdatePayload(item, {
        title,
        description,
        content,
        language,
        url,
        tags,
        collectionIds,
      });
      const result = await updateItem(item.id, payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item saved");
      onSaved(result.data);
    });
  }

  // noValidate: the Zod schema in the server action is the source of truth, so
  // validation errors arrive as toasts rather than native bubbles that would
  // block submit before the action runs.
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Button type="submit" size="sm" disabled={!canSave}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <FormField htmlFor="item-title" label="Title">
          <Input
            id="item-title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            required
            aria-invalid={title.trim().length === 0}
          />
        </FormField>

        <FormField htmlFor="item-description" label="Description">
          <Textarea
            id="item-description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            rows={2}
          />
        </FormField>

        {/* Never a plain textarea: a type with a body is either code or prose, so
            `showContent` implies one of these two editors. Neither row passes
            htmlFor — Monaco is a widget rather than an input, and the Markdown
            Write textarea unmounts whenever Preview is the active tab, so a
            <label for> would point at nothing half the time. Both name themselves
            through ariaLabel instead. */}
        {showContent &&
          (showCodeEditor ? (
            <FormField label="Content">
              <CodeEditor
                value={content}
                language={language}
                onChange={setContent}
                disabled={pending}
                ariaLabel="Content"
              />
            </FormField>
          ) : (
            <FormField label="Content">
              <MarkdownEditor
                value={content}
                onChange={setContent}
                disabled={pending}
                ariaLabel="Content"
              />
            </FormField>
          ))}

        {showLanguage && (
          <FormField htmlFor="item-language" label="Language">
            <Input
              id="item-language"
              value={language}
              onChange={event => setLanguage(event.target.value)}
              placeholder="typescript"
            />
          </FormField>
        )}

        {showUrl && (
          <FormField htmlFor="item-url" label="URL">
            <Input
              id="item-url"
              type="url"
              value={url}
              onChange={event => setUrl(event.target.value)}
              placeholder="https://example.com"
            />
          </FormField>
        )}

        <FormField htmlFor="item-tags" label="Tags">
          <Input
            id="item-tags"
            value={tags}
            onChange={event => setTags(event.target.value)}
            placeholder="react, hooks"
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas.
          </p>
        </FormField>

        <CollectionPicker
          options={collectionOptions}
          selectedIds={collectionIds}
          onChange={setCollectionIds}
          disabled={pending}
        />
      </div>
    </form>
  );
}
