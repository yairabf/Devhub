/**
 * Labelled form row shared by the item create dialog and the drawer's edit
 * form, so the two stay visually identical.
 */
export function FormField({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
