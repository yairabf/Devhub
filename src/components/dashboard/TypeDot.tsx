import { cn } from "@/lib/utils";
import { getTypeDotClass } from "@/lib/type-colors";

interface TypeDotProps {
  typeId: string | null;
}

export function TypeDot({ typeId }: TypeDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3 w-3 shrink-0 rounded-full",
        getTypeDotClass(typeId),
      )}
    />
  );
}
