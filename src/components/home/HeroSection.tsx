import { ArrowRight } from "lucide-react";

import { ChaosField } from "@/components/home/ChaosField";
import { CtaLink } from "@/components/home/CtaLink";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { Reveal } from "@/components/home/Reveal";
import { cn } from "@/lib/utils";

function PanelLabel({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-3 text-xs font-medium tracking-wide",
        accent ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="px-4 pt-32 pb-20 sm:px-6 md:pt-36">
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          {/* No eyebrow label above the heading, and no gradient fill on the payoff
              line: the size and tone step carries the emphasis on its own. */}
          <h1 className="text-balance">
            <span className="block text-xl font-medium tracking-tight text-muted-foreground sm:text-2xl">
              Stop losing your
            </span>
            <span className="mt-1.5 block text-5xl font-extrabold tracking-[-0.03em] text-foreground sm:text-6xl">
              Developer Knowledge
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground text-pretty">
            Your snippets live in gists, your prompts in a chat window, your commands
            in shell history, your notes in three different apps. DevHub gathers all
            of it into one searchable place built for developers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <CtaLink href="/register" size="lg">
              Get Started Free
            </CtaLink>
            <CtaLink href="#features" variant="outline" size="lg">
              See Features
            </CtaLink>
          </div>
        </Reveal>

        <Reveal className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xl shadow-black/30">
            <PanelLabel>Your knowledge today…</PanelLabel>
            <ChaosField />
          </div>

          {/* Two nested elements on purpose: the outer one rotates the arrow to point
              down on mobile, the inner one runs the pulse. One element cannot do both,
              since the animation owns `transform`. */}
          <div className="mx-auto rotate-90 md:rotate-0" aria-hidden="true">
            <div className="home-arrow text-muted-foreground">
              <ArrowRight className="size-12" strokeWidth={2.5} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xl shadow-black/30">
            <PanelLabel accent>…with DevHub</PanelLabel>
            <DashboardPreview />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
