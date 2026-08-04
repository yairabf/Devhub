const LABEL_CLASS =
  "block font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase";

/**
 * Labelled form row shared by the item create dialog and the drawer's edit
 * form, so the two stay visually identical.
 */
export function FormField({
  htmlFor,
  label,
  children,
}: {
  /**
   * Omit for a field with no labelable control — the code editor is a Monaco
   * widget, not an input, and carries its own `aria-label` instead. A `<label>`
   * pointing at nothing would be worse than no label element at all.
   */
  htmlFor?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {htmlFor ? (
        <label data-slot="field-label" htmlFor={htmlFor} className={LABEL_CLASS}>
          {label}
        </label>
      ) : (
        <span data-slot="field-label" className={LABEL_CLASS}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
