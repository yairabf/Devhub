"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The list is rendered inline (no Popup/Positioner/Portal) inside the caller's
 * own Dialog — `ComboboxList` already degrades gracefully without a
 * positioner ancestor. The caller must pass its own `open`/`onOpenChange`
 * through (mirroring the wrapping Dialog's), rather than this forcing
 * `open` to a constant `true`: item registration/highlighting need the root
 * "open" while shown, but a constant `true` with a discarded `onOpenChange`
 * swallows the Escape key before it ever closes the wrapping Dialog.
 */
function Command({
  className,
  ...props
}: Omit<AutocompletePrimitive.Root.Props<unknown>, "items"> & {
  className?: string;
  items: readonly { items: readonly unknown[] }[];
}) {
  return (
    <div data-slot="command" className={cn("flex flex-col", className)}>
      <AutocompletePrimitive.Root {...props} />
    </div>
  );
}

function CommandInputGroup({
  className,
  ...props
}: AutocompletePrimitive.InputGroup.Props) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="command-input-group"
      className={cn(
        "relative flex items-center border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: AutocompletePrimitive.Input.Props) {
  return (
    <>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <AutocompletePrimitive.Input
        data-slot="command-input"
        className={cn(
          "h-12 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
    </>
  );
}

function CommandList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="command-list"
      className={cn("max-h-[400px] overflow-y-auto p-2", className)}
      {...props}
    />
  );
}

function CommandCollection(props: AutocompletePrimitive.Collection.Props) {
  return <AutocompletePrimitive.Collection {...props} />;
}

function CommandGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props) {
  return (
    <AutocompletePrimitive.Group
      data-slot="command-group"
      className={cn("mb-2 last:mb-0", className)}
      {...props}
    />
  );
}

function CommandGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="command-group-label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="command-item"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground",
        "data-highlighted:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "px-2 py-6 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandInputGroup,
  CommandInput,
  CommandList,
  CommandCollection,
  CommandGroup,
  CommandGroupLabel,
  CommandItem,
  CommandEmpty,
};
