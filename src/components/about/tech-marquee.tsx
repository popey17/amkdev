"use client";

import {
  Cloud,
  Code,
  Cpu,
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import {
  type PointerEvent,
  useCallback,
  useState,
} from "react";

import type { GenericTechIcon, TechIcon, TechItem } from "@/data/tech-stack";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

type TechMarqueeProps = {
  items: readonly TechItem[];
};

const genericIcons: Record<GenericTechIcon, LucideIcon> = {
  cloud: Cloud,
  code: Code,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  layers: Layers,
  server: Server,
  sparkles: Sparkles,
  terminal: Terminal,
};

const iconClass = "size-[1.35em] shrink-0";

function TechItemIcon({ icon }: { icon: TechIcon }) {
  if (icon.kind === "generic") {
    const Icon = genericIcons[icon.name];
    return <Icon aria-hidden="true" className={iconClass} strokeWidth={1.75} />;
  }

  return (
    <svg aria-hidden="true" className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d={icon.path} />
    </svg>
  );
}

// Each lane repeats the skills so a single lane stays wider than the rail up to 3840px;
// the trailing padding equals the item gap so the -50% loop seam is exact.
const laneRepetitions = 4;

function SkillLane({ items }: { items: readonly TechItem[] }) {
  return (
    <ul
      aria-hidden="true"
      className="flex shrink-0 items-center gap-[clamp(1.5rem,4vw,4rem)] pr-[clamp(1.5rem,4vw,4rem)]"
      data-marquee-repeat={laneRepetitions}
      data-testid="tech-marquee-lane"
    >
      {Array.from({ length: laneRepetitions }, (_, repetition) =>
        items.map((item) => (
          <li
            className="group/tech flex items-center gap-[0.75em] whitespace-nowrap font-mono text-[length:var(--text-small)] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
            key={`${repetition}-${item.name}`}
          >
            {item.icon ? (
              <span className="flex text-ink/45 transition-colors group-hover/tech:text-accent-ink">
                <TechItemIcon icon={item.icon} />
              </span>
            ) : null}
            {item.name}
          </li>
        )),
      )}
    </ul>
  );
}

export function TechMarquee({ items }: TechMarqueeProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  // Fast scrolling leans the rail into the direction of travel, then it springs upright.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 50 });
  const skewX = useTransform(velocity, [-2500, 2500], shouldReduceMotion ? [0, 0] : [10, -10], {
    clamp: true,
  });
  const [isPointerPaused, setIsPointerPaused] = useState(false);
  const isPaused = shouldReduceMotion || isPointerPaused;

  // Hovering with a mouse holds the rail still so a label can be read.
  const handlePointerEnter = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setIsPointerPaused(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsPointerPaused(false);
  }, []);

  return (
    <>
      <style>{`
        @keyframes tech-marquee-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .animate-tech-marquee {
          animation: tech-marquee-scroll 180s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-tech-marquee {
            animation: none;
          }
        }
      `}</style>

      <section
        aria-label="Technology stack"
        className="relative border-y border-ink/10 py-[clamp(1.25rem,2.5vw,2rem)]"
      >
        <div className="shell min-w-0">
          <div
            className="min-w-0"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <motion.div
              className="min-w-0 overflow-x-clip [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
              style={{ skewX }}
            >
              <ul className="sr-only">
                {items.map((item) => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>

              <div
                className={cn(
                  "flex w-max",
                  !shouldReduceMotion && "animate-tech-marquee",
                )}
                data-marquee-lanes="2"
                data-reduced-motion={shouldReduceMotion ? "true" : "false"}
                data-testid="tech-marquee-track"
                style={{
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              >
                <SkillLane items={items} />
                <SkillLane items={items} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
