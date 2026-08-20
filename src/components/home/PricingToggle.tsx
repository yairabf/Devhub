"use client";

import { useState } from "react";

import { CheckItem } from "@/components/home/CheckItem";
import { CtaLink, PRIMARY_SURFACE } from "@/components/home/CtaLink";
import type { HomeCta } from "@/lib/home-cta";
import {
  PRO_PLAN_FEATURES,
  PRO_PRICING,
  type BillingCycle,
} from "@/lib/home-content";
import { cn } from "@/lib/utils";

const CYCLES: { value: BillingCycle; label: string; save?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", save: "Save 25%" },
];

/**
 * Owns the billing cycle. The switch and the Pro price move together but sit in
 * different layout slots, so both render here; the Free card never changes and is
 * passed in from the server component already rendered.
 */
export function PricingToggle({
  freePlanCard,
  proCta,
}: {
  freePlanCard: React.ReactNode;
  proCta: HomeCta;
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const pricing = PRO_PRICING[cycle];

  return (
    <>
      <div className="mb-14 flex justify-center">
        <div
          role="group"
          aria-label="Billing cycle"
          className="inline-flex gap-1 rounded-full border border-border bg-card p-1"
        >
          {CYCLES.map((option) => {
            const active = option.value === cycle;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setCycle(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-700"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                {option.save ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-white/15 text-neutral-50"
                        : "bg-emerald-500/20 text-emerald-500",
                    )}
                  >
                    {option.save}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl items-start gap-8 md:grid-cols-2 md:gap-6">
        {freePlanCard}

        <article className="relative flex h-full flex-col rounded-xl border border-foreground/35 bg-neutral-100/60 p-7 shadow-2xl shadow-black/25 dark:bg-neutral-800/40">
          <span className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1 text-[11px] font-bold tracking-wider uppercase",
            PRIMARY_SURFACE,
          )}>
            Most Popular
          </span>
          <h3 className="text-xl font-bold">Pro</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            For developers who never want to lose anything again.
          </p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-[44px] leading-none font-extrabold tracking-tight">
              {pricing.amount}
            </span>
            <span className="text-[15px] text-muted-foreground">
              {pricing.per}
            </span>
          </div>
          <p className="mt-1.5 min-h-[18px] text-xs text-muted-foreground">
            {pricing.note}
          </p>
          <ul className="my-6 flex flex-col gap-2.5">
            {PRO_PLAN_FEATURES.map((feature) => (
              <CheckItem key={feature.label} label={feature.label} />
            ))}
          </ul>
          <CtaLink href={proCta.href} size="lg" className="mt-auto w-full">
            {proCta.label}
          </CtaLink>
        </article>
      </div>
    </>
  );
}
