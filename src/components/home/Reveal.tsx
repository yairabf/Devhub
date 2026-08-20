"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * One IntersectionObserver for the whole page, shared by every Reveal on it, rather
 * than one per section — the page mounts a dozen of these.
 */
let sharedObserver: IntersectionObserver | null = null;
const onVisible = new WeakMap<Element, () => void>();

function getSharedObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        onVisible.get(entry.target)?.();
        onVisible.delete(entry.target);
        sharedObserver?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  return sharedObserver;
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Fades its children in when they scroll into view. The reduced-motion opt-out is
 * pure CSS (`motion-reduce:`), so no JS gate is needed here — unlike ChaosField,
 * whose rAF loop can only be gated in JS.
 *
 * No `IntersectionObserver` feature check: it is baseline in every browser this app
 * supports, and the alternatives (setState in the effect body, or writing the
 * attribute behind React's back) are worse than relying on it.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = getSharedObserver();
    onVisible.set(element, () => setVisible(true));
    observer.observe(element);

    return () => {
      onVisible.delete(element);
      observer.unobserve(element);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible || undefined}
      className={cn(
        "translate-y-6 opacity-0 transition-[opacity,transform] duration-700 ease-out data-visible:translate-y-0 data-visible:opacity-100",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
