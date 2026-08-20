"use client";

import { Bookmark, FileText, Terminal, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  GitHubIcon,
  NotionIcon,
  SlackIcon,
  TabsIcon,
  VsCodeIcon,
  type BrandIcon,
} from "@/components/home/chaos-icons";
import { cn } from "@/lib/utils";

/** Where developer knowledge scatters today — the icons this field sets adrift. */
interface ChaosSource {
  label: string;
  icon: BrandIcon | LucideIcon;
  className?: string;
}

const CHAOS_SOURCES: ChaosSource[] = [
  { label: "Notion", icon: NotionIcon },
  { label: "GitHub", icon: GitHubIcon, className: "text-foreground" },
  { label: "Slack", icon: SlackIcon },
  { label: "VS Code", icon: VsCodeIcon },
  { label: "47 tabs", icon: TabsIcon, className: "text-purple-400" },
  { label: "Terminal", icon: Terminal, className: "text-emerald-500" },
  { label: "notes.txt", icon: FileText, className: "text-muted-foreground" },
  { label: "Bookmarks", icon: Bookmark, className: "text-orange-500" },
];

const REPEL_RADIUS = 115; // px — cursor influence range
const REPEL_FORCE = 900; // px/s^2 at the cursor itself
const MIN_SPEED = 10; // px/s — keep everything gently moving
const MAX_SPEED = 130; // px/s — cap post-repulsion velocity
const DRIFT_SPEED = 26; // px/s — baseline drift

interface Particle {
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rotPhase: number;
  rotSpeed: number;
  rotAmp: number;
  sclPhase: number;
  sclSpeed: number;
  sclAmp: number;
  index: number;
}

function draw(p: Particle, time: number) {
  const rot = Math.sin(time * p.rotSpeed + p.rotPhase) * p.rotAmp;
  const scale = 1 + Math.sin(time * p.sclSpeed + p.sclPhase) * p.sclAmp;
  // Written straight to the DOM: particle state lives in refs, never in React
  // state, so the loop never triggers a re-render.
  p.el.style.setProperty("--tx", `${p.x.toFixed(2)}px`);
  p.el.style.setProperty("--ty", `${p.y.toFixed(2)}px`);
  p.el.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
  p.el.style.setProperty("--scale", scale.toFixed(3));
}

/**
 * The hero's "your knowledge today" field: icons drift, bounce off the walls, pulse,
 * and flee the cursor. Ported from the prototype's requestAnimationFrame loop.
 */
export function ChaosField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const elements = Array.from(
      field.querySelectorAll<HTMLElement>("[data-chaos-icon]"),
    );
    if (elements.length === 0) return;

    const bounds = { w: 0, h: 0 };
    const pointer = { x: 0, y: 0, active: false };

    const particles: Particle[] = elements.map((el, index) => {
      const angle = Math.random() * Math.PI * 2;
      return {
        el,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        vx: Math.cos(angle) * DRIFT_SPEED,
        vy: Math.sin(angle) * DRIFT_SPEED,
        // Distinct phases so the pulsing never looks synchronized.
        rotPhase: Math.random() * Math.PI * 2,
        rotSpeed: 0.5 + Math.random() * 0.5,
        rotAmp: 5 + Math.random() * 7,
        sclPhase: Math.random() * Math.PI * 2,
        sclSpeed: 0.6 + Math.random() * 0.6,
        sclAmp: 0.04 + Math.random() * 0.05,
        index,
      };
    });

    // Bounds are cached and invalidated on resize, not read per frame.
    function measure() {
      const rect = field!.getBoundingClientRect();
      bounds.w = rect.width;
      bounds.h = rect.height;
      for (const p of particles) {
        p.w = p.el.offsetWidth;
        p.h = p.el.offsetHeight;
      }
    }

    function seedPositions() {
      // Jittered 4x2 grid so icons start spread out rather than clumped.
      const cols = 4;
      const rows = Math.ceil(particles.length / cols);

      for (const p of particles) {
        const col = p.index % cols;
        const row = Math.floor(p.index / cols);
        const cellW = bounds.w / cols;
        const cellH = bounds.h / rows;

        p.x = col * cellW + Math.random() * Math.max(cellW - p.w, 0);
        p.y = row * cellH + Math.random() * Math.max(cellH - p.h, 0);
      }
    }

    function clampIntoBounds() {
      for (const p of particles) {
        p.x = Math.min(Math.max(p.x, 0), Math.max(bounds.w - p.w, 0));
        p.y = Math.min(Math.max(p.y, 0), Math.max(bounds.h - p.h, 0));
      }
    }

    function step(p: Particle, dt: number, time: number) {
      // Cursor repulsion — force falls off linearly to zero at REPEL_RADIUS.
      if (pointer.active) {
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        let dx = cx - pointer.x;
        let dy = cy - pointer.y;
        let dist = Math.hypot(dx, dy);

        if (dist < REPEL_RADIUS) {
          // Guard the degenerate case where the cursor sits dead centre.
          if (dist < 0.001) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            dist = Math.hypot(dx, dy) || 1;
          }
          const force = REPEL_FORCE * (1 - dist / REPEL_RADIUS) * dt;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Ease back toward the baseline drift speed so repulsion decays.
      let speed = Math.hypot(p.vx, p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
        speed = MAX_SPEED;
      }
      if (speed > DRIFT_SPEED) {
        const target =
          DRIFT_SPEED + (speed - DRIFT_SPEED) * Math.pow(0.55, dt);
        p.vx = (p.vx / speed) * target;
        p.vy = (p.vy / speed) * target;
        speed = target;
      }
      if (speed < MIN_SPEED) {
        const angle = Math.random() * Math.PI * 2;
        p.vx = Math.cos(angle) * MIN_SPEED;
        p.vy = Math.sin(angle) * MIN_SPEED;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bounce off the walls.
      const maxX = Math.max(bounds.w - p.w, 0);
      const maxY = Math.max(bounds.h - p.h, 0);
      if (p.x <= 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx);
      }
      if (p.x >= maxX) {
        p.x = maxX;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y <= 0) {
        p.y = 0;
        p.vy = Math.abs(p.vy);
      }
      if (p.y >= maxY) {
        p.y = maxY;
        p.vy = -Math.abs(p.vy);
      }

      draw(p, time);
    }

    measure();
    seedPositions();
    for (const p of particles) draw(p, 0);

    // Pointer position is field-local. The rect is re-read per event (not per
    // frame) because the field shifts with the reveal transition and with scroll.
    const handlePointerMove = (event: PointerEvent) => {
      const rect = field!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.active =
        x > -REPEL_RADIUS &&
        x < bounds.w + REPEL_RADIUS &&
        y > -REPEL_RADIUS &&
        y < bounds.h + REPEL_RADIUS;
      pointer.x = x;
      pointer.y = y;
    };
    const deactivatePointer = () => {
      pointer.active = false;
    };

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        clampIntoBounds();
      }, 120);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", deactivatePointer);
    window.addEventListener("blur", deactivatePointer);
    window.addEventListener("resize", handleResize);

    // The rAF loop is the one thing CSS cannot gate, so reduced motion is checked
    // here; the icons still get their seeded positions above.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frameId = 0;
    let lastTs = 0;
    const frame = (ts: number) => {
      // Cap dt so a backgrounded tab doesn't teleport everything on return.
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
      lastTs = ts;
      for (const p of particles) step(p, dt, ts / 1000);
      frameId = window.requestAnimationFrame(frame);
    };
    if (!reduceMotion) frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", deactivatePointer);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="home-chaos-field relative h-[290px] overflow-hidden rounded-lg md:h-[330px]"
    >
      {CHAOS_SOURCES.map((source) => {
        const Icon = source.icon;
        return (
          <div
            key={source.label}
            data-chaos-icon
            className="home-chaos-icon absolute top-0 left-0 flex w-[62px] flex-col items-center gap-1.5 rounded-xl border border-border bg-muted px-1 py-2 shadow-lg shadow-black/20"
          >
            <Icon className={cn("size-6", source.className)} />
            <span className="font-mono text-[9px] leading-none whitespace-nowrap text-muted-foreground">
              {source.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
