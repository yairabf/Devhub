import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Quieter lead-in, e.g. "Everything in". */
  title: string;
  /** The words that carry the section, e.g. "one place". */
  highlight: string;
  subtitle: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Emphasis comes from tone and weight, not a gradient fill: the lead-in sits at
 * muted strength and the payoff at full foreground.
 */
export function SectionHeading({
  title,
  highlight,
  subtitle,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto mb-14 max-w-2xl text-center", className)}>
      <h2 className="text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
        <span className="text-muted-foreground">{title}</span>{" "}
        <span className="text-foreground">{highlight}</span>
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-muted-foreground text-pretty">
        {subtitle}
      </p>
      {children}
    </div>
  );
}
