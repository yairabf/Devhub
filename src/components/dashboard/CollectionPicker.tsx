import type { CollectionOption } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

interface CollectionPickerProps {
  options: CollectionOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select chip list shared by the New Item dialog and the drawer's edit
 * form, styled off the same checkbox-as-chip pattern as the type selector
 * (`has-[:checked]`) — checkboxes rather than radios, since an item can
 * belong to more than one collection.
 *
 * Builds its own `<legend>` rather than being wrapped in `FormField`: a
 * `FormField` label is a sibling `<span>`, which isn't programmatically
 * associated with a `<fieldset>` the way a `<legend>` is — the type selector
 * above has the same shape and avoids `FormField` for the same reason.
 */
export function CollectionPicker({
  options,
  selectedIds,
  onChange,
  disabled,
}: CollectionPickerProps) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <fieldset className="space-y-1.5" disabled={disabled}>
      <legend
        data-slot="field-label"
        className="mb-1.5 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        Collections
      </legend>
      {options.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No collections yet — create one first.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map(option => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
                "has-[:checked]:border-foreground/30 has-[:checked]:bg-muted",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="sr-only"
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
