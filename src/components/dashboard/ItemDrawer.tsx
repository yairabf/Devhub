"use client";

import { Folder, Pencil, Tag } from "lucide-react";

import { CodeEditor } from "@/components/dashboard/CodeEditor";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { DeleteItemDialog } from "@/components/dashboard/DeleteItemDialog";
import { ItemEditForm } from "@/components/dashboard/ItemEditForm";
import { ItemFavoriteButton } from "@/components/dashboard/ItemFavoriteButton";
import { ItemPinButton } from "@/components/dashboard/ItemPinButton";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemDetailData } from "@/lib/db/items";
import { capitalize, formatIsoDate } from "@/lib/format";
import { usesCodeEditor, usesMarkdownEditor } from "@/lib/item-form";
import { getTypeTextClass } from "@/lib/type-colors";
import { TypeGlyph } from "@/lib/type-icons";
import { cn } from "@/lib/utils";

/**
 * A failed load. Carries its own heading because a deleted item is not the same
 * story as a transport failure and should not be announced as one.
 */
export interface ItemDrawerErrorState {
  title: string;
  message: string;
}

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetailData | null;
  error: ItemDrawerErrorState | null;
  editing: boolean;
  /** The user's collections, threaded to the edit form's Collections picker. */
  collectionOptions: CollectionOption[];
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: (updated: ItemDetailData) => void;
  onDeleted: (itemId: string) => void;
}

export function ItemDrawer({
  open,
  onOpenChange,
  item,
  error,
  editing,
  collectionOptions,
  onEdit,
  onCancelEdit,
  onSaved,
  onDeleted,
}: ItemDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full gap-0 overflow-hidden p-0 sm:!max-w-2xl"
      >
        {item ? (
          <>
            <ItemDrawerHeader item={item} />
            {editing ? (
              <ItemEditForm
                key={item.id}
                item={item}
                collectionOptions={collectionOptions}
                onCancel={onCancelEdit}
                onSaved={onSaved}
              />
            ) : (
              <ItemViewMode item={item} onEdit={onEdit} onDeleted={onDeleted} />
            )}
            <ItemDrawerFooter item={item} />
          </>
        ) : error ? (
          <ItemDrawerError error={error} />
        ) : (
          <ItemDrawerSkeleton />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ItemDrawerHeader({ item }: { item: ItemDetailData }) {
  return (
    <div className="flex items-start gap-3 border-b border-border p-4 pr-12">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
        <TypeGlyph
          typeId={item.itemTypeId}
          className={cn("size-5", getTypeTextClass(item.itemTypeId))}
        />
      </div>
      <div className="min-w-0 flex-1">
        <SheetTitle className="text-base leading-tight break-words">
          {item.title}
        </SheetTitle>
        <p className="text-xs text-muted-foreground">
          {capitalize(item.itemTypeName)}
          {item.language ? ` · ${item.language}` : ""}
        </p>
      </div>
    </div>
  );
}

function ItemViewMode({
  item,
  onEdit,
  onDeleted,
}: {
  item: ItemDetailData;
  onEdit: () => void;
  onDeleted: (itemId: string) => void;
}) {
  const copyValue = item.content ?? item.url;

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        {/* Both toggles report back through ItemDrawerContext, not a prop. */}
        <ItemFavoriteButton
          itemId={item.id}
          isFavorite={item.isFavorite}
          size="icon-sm"
        />
        <ItemPinButton itemId={item.id} isPinned={item.isPinned} size="icon-sm" />
        {copyValue && (
          <CopyButton
            value={copyValue}
            label={`Copy ${item.itemTypeName.toLowerCase()}`}
            className="size-7 [&_svg]:size-4"
          />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          title="Edit item"
          aria-label="Edit item"
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <DeleteItemDialog
          itemId={item.id}
          itemTitle={item.title}
          onDeleted={onDeleted}
        />
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {item.description && (
          <SheetDescription className="text-foreground">
            {item.description}
          </SheetDescription>
        )}

        {item.content && (
          <section className="space-y-2">
            <SectionLabel>Content</SectionLabel>
            {usesCodeEditor(item.itemTypeId) ? (
              <CodeEditor
                value={item.content}
                language={item.language}
                ariaLabel={`${item.title} content`}
                copyLabel={`Copy ${item.itemTypeName.toLowerCase()}`}
              />
            ) : usesMarkdownEditor(item.itemTypeId) ? (
              <MarkdownEditor
                value={item.content}
                ariaLabel={`${item.title} content`}
                copyLabel={`Copy ${item.itemTypeName.toLowerCase()}`}
              />
            ) : (
              <pre className="max-h-[28rem] overflow-auto rounded-lg bg-muted px-3 py-2.5 font-mono text-xs whitespace-pre-wrap text-foreground/90">
                {item.content}
              </pre>
            )}
          </section>
        )}

        {item.url && (
          <section className="space-y-2">
            <SectionLabel>URL</SectionLabel>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate rounded-lg bg-muted px-3 py-2.5 font-mono text-xs text-blue-500 hover:underline"
            >
              {item.url}
            </a>
          </section>
        )}

        {item.tags.length > 0 && (
          <section className="space-y-2">
            <SectionLabel icon={Tag}>Tags</SectionLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags.map(tag => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {item.collections.length > 0 && (
          <section className="space-y-2">
            <SectionLabel icon={Folder}>Collections</SectionLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              {item.collections.map(collection => (
                <Badge key={collection.id} variant="outline">
                  {collection.name}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function ItemDrawerFooter({ item }: { item: ItemDetailData }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
      <span>Created {formatIsoDate(item.createdAt)}</span>
      <span>Updated {formatIsoDate(item.updatedAt)}</span>
    </div>
  );
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </h3>
  );
}

function ItemDrawerSkeleton() {
  return (
    <>
      <div className="flex items-start gap-3 border-b border-border p-4 pr-12">
        <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <SheetTitle className="sr-only">Loading item</SheetTitle>
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="size-5 animate-pulse rounded bg-muted" />
        ))}
        <div className="ml-auto size-5 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex-1 space-y-5 p-4">
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </>
  );
}

function ItemDrawerError({ error }: { error: ItemDrawerErrorState }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <SheetTitle>{error.title}</SheetTitle>
      <SheetDescription>{error.message}</SheetDescription>
    </div>
  );
}
