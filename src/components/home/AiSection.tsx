import { Sparkles } from "lucide-react";

import { CheckItem } from "@/components/home/CheckItem";
import { Reveal } from "@/components/home/Reveal";
import { AI_CAPABILITIES, AI_DEMO_TAGS } from "@/lib/home-content";
import { cn } from "@/lib/utils";

export function AiSection() {
  return (
    <section className="bg-gradient-to-b from-transparent via-foreground/[0.03] to-transparent px-4 py-24 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-13">
        <Reveal className="min-w-0">
          {/* The Pro chip rides inline with the heading rather than sitting above it
              as an eyebrow — it is tier information, not a label for the headline. */}
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
            <span className="text-muted-foreground">Your knowledge</span>{" "}
            <span className="text-foreground">organizes itself</span>
            <span className="ml-3 inline-flex -translate-y-1.5 items-center rounded-full border border-purple-500/45 bg-purple-500/12 px-2.5 py-0.5 align-middle text-[11px] font-bold tracking-widest text-purple-500 uppercase">
              Pro
            </span>
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted-foreground text-pretty">
            Save it once. DevHub figures out what it is, what it does, and where it
            belongs.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {AI_CAPABILITIES.map((capability) => (
              <CheckItem key={capability} label={capability} />
            ))}
          </ul>
        </Reveal>

        {/* min-w-0: without it the grid track sizes to the code block's longest
            line and pushes the whole page into horizontal overflow on mobile. */}
        <Reveal className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3.5 py-3">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-yellow-400" />
              <span className="size-2.5 rounded-full bg-green-500" />
              <span className="ml-2.5 font-mono text-xs text-muted-foreground">
                useDebounce.ts
              </span>
            </div>

            <pre className="overflow-x-auto bg-background px-3.5 py-4 font-mono text-[12.5px] leading-[1.85]">
              <code className="text-foreground/80">
                <span className="home-code-line">1</span>
                <span className="text-indigo-400">import</span>
                {" { useState, useEffect } "}
                <span className="text-indigo-400">from</span>{" "}
                <span className="text-emerald-400">&apos;react&apos;</span>;{"\n"}
                <span className="home-code-line">2</span>
                {"\n"}
                <span className="home-code-line">3</span>
                <span className="text-indigo-400">export function</span>{" "}
                <span className="text-purple-400">useDebounce</span>
                {"<T>(value: T, delay = "}
                <span className="text-pink-400">300</span>
                {") {\n"}
                <span className="home-code-line">4</span>
                {"  "}
                <span className="text-indigo-400">const</span>
                {" [debounced, setDebounced] = "}
                <span className="text-purple-400">useState</span>
                {"(value);\n"}
                <span className="home-code-line">5</span>
                {"  "}
                <span className="text-purple-400">useEffect</span>
                {"(() => {\n"}
                <span className="home-code-line">6</span>
                {"    "}
                <span className="text-indigo-400">const</span>
                {" id = "}
                <span className="text-purple-400">setTimeout</span>
                {"(() => "}
                <span className="text-purple-400">setDebounced</span>
                {"(value), delay);\n"}
                <span className="home-code-line">7</span>
                {"    "}
                <span className="text-indigo-400">return</span>
                {" () => "}
                <span className="text-purple-400">clearTimeout</span>
                {"(id);\n"}
                <span className="home-code-line">8</span>
                {"  }, [value, delay]);\n"}
                <span className="home-code-line">9</span>
                {"  "}
                <span className="text-indigo-400">return</span>
                {" debounced;\n"}
                <span className="home-code-line">10</span>
                {"}"}
              </code>
            </pre>

            <div className="border-t border-border bg-muted px-4 pt-4 pb-4.5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-500 uppercase">
                <Sparkles className="home-spark size-3.5" />
                AI Generated Tags
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {AI_DEMO_TAGS.map((tag, index) => (
                  <span
                    key={tag.label}
                    data-tag-index={index}
                    className={cn(
                      "home-tag rounded-full border px-2.5 py-1 font-mono text-[11.5px]",
                      tag.className,
                    )}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Summary: A generic React hook that delays a value update until input
                settles.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
