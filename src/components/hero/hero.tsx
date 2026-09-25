"use client";

import { motion, useScroll, useSpring } from "motion/react";
import dynamic from "next/dynamic";
import { Component, type ReactNode, useRef, useState } from "react";

import { PointerCompanion } from "@/components/hero/pointer-companion";
import { MagneticLink } from "@/components/ui/magnetic-link";
import { cn } from "@/lib/cn";
import { useScrollRange } from "@/lib/use-parallax";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});

class SceneBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export function Hero() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const section = useRef<HTMLElement>(null);
  // 0 with the hero pinned at the top of the viewport, 1 once it has scrolled out.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  const lineOneX = useScrollRange(progress, "0%", "-14%", "0%");
  const lineTwoX = useScrollRange(progress, "0%", "10%", "0%");
  const introY = useScrollRange(progress, "0px", "-140px", "0px");
  const orbY = useScrollRange(progress, "0%", "32%", "0%");
  const orbScale = useScrollRange(progress, 1, 0.78, 1);
  const orbRotate = useScrollRange(progress, 0, -12, 0);

  return (
    <section
      className="shell grid min-h-[calc(100svh-5rem)] overflow-x-clip items-center gap-[clamp(2rem,5vw,7rem)] py-[clamp(3rem,8vh,8rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]"
      id="top"
      ref={section}
    >
      <div className="relative z-10 min-w-0">
        <p className="hero-rise mb-[clamp(1.5rem,3vw,3rem)] flex items-center gap-3 font-mono text-[length:var(--text-small)] uppercase tracking-[0.2em] text-accent-ink">
          <span aria-hidden="true" className="h-px w-8 bg-accent-ink" />
          Portfolio / 2026
        </p>

        <h1 className="hero-rise max-w-[10ch] text-[length:var(--text-display)] font-semibold leading-[0.82] tracking-[-0.075em] text-ink [animation-delay:80ms]">
          <motion.span className="block" style={{ x: lineOneX }}>
            Front-end developer.
          </motion.span>
          <motion.span className="block text-ink-muted" style={{ x: lineTwoX }}>
            Full-stack developer.
          </motion.span>
        </h1>

        <motion.div
          className="hero-rise mt-[clamp(2rem,4vw,4rem)] grid gap-8 border-t border-ink/15 pt-6 [animation-delay:160ms] sm:grid-cols-[minmax(0,32rem)_auto] sm:items-end"
          style={{ y: introY }}
        >
          <p className="max-w-[38rem] text-[length:var(--text-body)] leading-relaxed text-ink-muted">
            I create expressive, resilient digital experiences where meticulous
            interfaces meet dependable full-stack engineering.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <MagneticLink
              className="border border-accent-ink bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-transparent hover:text-accent-ink"
              href="#work"
            >
              View selected work
            </MagneticLink>
            <MagneticLink
              className="border-b border-ink/30 px-1 text-sm font-semibold text-ink"
              href="#contact"
            >
              Let&apos;s work together
            </MagneticLink>
          </div>
        </motion.div>
      </div>

      <div className="hero-orb-in relative min-w-0">
        <motion.div
          className="relative isolate mx-auto aspect-square min-h-[17rem] w-full max-w-[48rem]"
          style={{ y: orbY, scale: orbScale, rotate: orbRotate }}
        >
          {/* Glow sits outside the canvas and fades to zero at its own edge, so nothing clips it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[18%] -z-10 bg-[radial-gradient(closest-side,rgb(198_255_50/0.2),rgb(198_255_50/0.07)_45%,transparent)]"
          />
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-[18%] rounded-[42%_58%_63%_37%/46%_38%_62%_54%] bg-[radial-gradient(circle_at_35%_30%,rgb(243_241_232/0.62),transparent_20%),radial-gradient(circle_at_64%_68%,rgb(198_255_50/0.92),rgb(86_117_15/0.72)_46%,rgb(10_11_10/0.08)_72%)] transition-opacity duration-700",
              isSceneReady && "opacity-0",
            )}
            data-testid="hero-orb-fallback"
          />
          <SceneBoundary>
            <HeroScene onReady={() => setIsSceneReady(true)} />
          </SceneBoundary>

          {/* <div className="absolute bottom-4 right-1 z-10 sm:bottom-8 sm:right-6">
            <PointerCompanion />
          </div> */}
        </motion.div>
      </div>
    </section>
  );
}
