import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";
import { HOME_FEATURES } from "@/lib/home-content";
import {
  getTypeSoftBgClass,
  getTypeTextClass,
  getTypeTopBorderClass,
} from "@/lib/type-colors";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6">
      {/* One reveal for the section, not one per card: a dozen identical entrances
          reads as scattered effects rather than a single authored moment. */}
      <Reveal className="mx-auto w-full max-w-[1180px]">
        <SectionHeading
          title="Everything in"
          highlight="one place"
          subtitle="Seven item types, one search box, zero context switching."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={cn(
                  "h-full rounded-xl border border-border border-t-[3px] bg-card p-6 transition-transform hover:-translate-y-1",
                  getTypeTopBorderClass(feature.accentTypeId),
                )}
              >
                <div
                  className={cn(
                    "mb-4 grid size-10 place-items-center rounded-xl",
                    getTypeSoftBgClass(feature.accentTypeId),
                    getTypeTextClass(feature.accentTypeId),
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
