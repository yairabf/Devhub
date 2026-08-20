import { CheckItem } from "@/components/home/CheckItem";
import { CtaLink } from "@/components/home/CtaLink";
import { PricingToggle } from "@/components/home/PricingToggle";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";
import { FREE_PLAN_FEATURES } from "@/lib/home-content";

/** Static, so it is rendered here on the server and handed to the client toggle. */
function FreePlanCard() {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-7">
      <h3 className="text-xl font-bold">Free</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        For getting your first 50 things out of your head.
      </p>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-[44px] leading-none font-extrabold tracking-tight">
          $0
        </span>
        <span className="text-[15px] text-muted-foreground">forever</span>
      </div>
      <p className="mt-1.5 min-h-[18px] text-xs text-muted-foreground">
        No credit card required
      </p>
      <ul className="my-6 flex flex-col gap-2.5">
        {FREE_PLAN_FEATURES.map((feature) => (
          <CheckItem
            key={feature.label}
            label={feature.label}
            included={feature.included}
          />
        ))}
      </ul>
      <CtaLink
        href="/register"
        variant="outline"
        size="lg"
        className="mt-auto w-full"
      >
        Get Started
      </CtaLink>
    </article>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal>
          <SectionHeading
            title="Simple"
            highlight="pricing"
            subtitle="Start free. Upgrade when you outgrow it."
            className="mb-8"
          />
          <PricingToggle freePlanCard={<FreePlanCard />} />
        </Reveal>
      </div>
    </section>
  );
}
