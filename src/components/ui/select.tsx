import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A native `<select>` rather than a wrapped base-ui `Select` — same call as
 * the New Item dialog's type picker (native radios styled as chips): a plain
 * element is the lower-risk choice for a handful of settings dropdowns, and
 * it comes with working keyboard/mobile-picker behavior for free.
 */
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-8 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
