import { CtaLink } from "@/components/home/CtaLink";
import { Reveal } from "@/components/home/Reveal";
import { getClosingCta, type HomeViewer } from "@/lib/home-cta";

export function CtaSection({ viewer }: { viewer: HomeViewer }) {
  const cta = getClosingCta(viewer);

  return (
    <section className="px-4 pt-8 pb-28 sm:px-6">
      <Reveal className="mx-auto w-full max-w-3xl">
        <div className="home-cta-glow rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to Organize Your Knowledge?
          </h2>
          <p className="mx-auto mt-4 mb-7 max-w-md text-[16.5px] text-muted-foreground">
            Free forever for your first 50 items. No credit card, no setup, no
            excuses.
          </p>
          <CtaLink href={cta.href} size="lg">
            {cta.label}
          </CtaLink>
        </div>
      </Reveal>
    </section>
  );
}
