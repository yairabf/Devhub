"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandInputGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItemDrawer } from "@/components/dashboard/ItemDrawerProvider";
import { capitalize } from "@/lib/format";
import { searchIndex, type SearchIndex } from "@/lib/search";
import { TypeGlyph } from "@/lib/type-icons";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchIndex: SearchIndex;
}

/**
 * The global Cmd+K / Ctrl+K palette. Fuzzy-searches the pre-fetched index
 * client-side (no server round-trip per keystroke) and either opens the item
 * drawer or navigates to the collection page — closing itself first so the
 * two overlays never stack.
 */
export function CommandPalette({
  open,
  onOpenChange,
  searchIndex: index,
}: CommandPaletteProps) {
  const router = useRouter();
  const { openItem } = useItemDrawer();
  const [query, setQuery] = useState("");

  // A stale query shouldn't greet the user the next time they open the palette.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setQuery("");
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  function selectItem(itemId: string) {
    handleOpenChange(false);
    openItem(itemId);
  }

  function selectCollection(collectionId: string) {
    handleOpenChange(false);
    router.push(`/collections/${collectionId}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search items and collections
        </DialogDescription>
        <Command
          open={open}
          onOpenChange={handleOpenChange}
          value={query}
          onValueChange={setQuery}
          mode="none"
          autoHighlight="always"
          items={[{ items: results.items }, { items: results.collections }]}
        >
          <CommandInputGroup>
            <CommandInput
              placeholder="Search items and collections..."
              autoFocus
            />
          </CommandInputGroup>
          <CommandList>
            <CommandEmpty>
              {query.trim()
                ? "No results found."
                : "Start typing to search items and collections."}
            </CommandEmpty>
            {results.items.length > 0 && (
              <CommandGroup items={results.items}>
                <CommandGroupLabel>Items</CommandGroupLabel>
                <CommandCollection>
                  {item => (
                    <CommandItem
                      key={item.id}
                      value={item}
                      onClick={() => selectItem(item.id)}
                    >
                      <TypeGlyph
                        typeId={item.itemTypeId}
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                      />
                      <span className="flex-1 truncate">{item.title}</span>
                      {/* Named as well as glyphed, and laid out like the
                          collection row's count so both groups read the same
                          way. `ItemType.name` is stored lowercase, so it goes
                          through the same `capitalize` helper the drawer and
                          sidebar use — a CSS transform would leave the
                          underlying text lowercase for assistive tech. */}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {capitalize(item.itemTypeName)}
                      </span>
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
            {results.collections.length > 0 && (
              <CommandGroup items={results.collections}>
                <CommandGroupLabel>Collections</CommandGroupLabel>
                <CommandCollection>
                  {collection => (
                    <CommandItem
                      key={collection.id}
                      value={collection}
                      onClick={() => selectCollection(collection.id)}
                    >
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {collection.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {collection.itemCount}{" "}
                        {collection.itemCount === 1 ? "item" : "items"}
                      </span>
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
