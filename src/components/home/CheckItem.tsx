import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckItemProps {
  label: string;
  /** false renders the struck-through "not in this plan" treatment. */
  included?: boolean;
}

export function CheckItem({ label, included = true }: CheckItemProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 text-[15px]",
        included ? "text-muted-foreground" : "text-muted-foreground/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
          included
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-muted text-muted-foreground",
        )}
      >
        {included ? (
          <Check className="size-3" strokeWidth={3} />
        ) : (
          <X className="size-3" strokeWidth={3} />
        )}
      </span>
      {label}
    </li>
  );
}
