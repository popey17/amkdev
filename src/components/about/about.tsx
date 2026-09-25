"use client";

import { motion } from "motion/react";
import { useRef } from "react";

import { Reveal } from "@/components/ui/reveal";
import { SplitText } from "@/components/ui/split-text";
import { useScrollRange, useViewportProgress } from "@/lib/use-parallax";

export function About() {
  const section = useRef<HTMLElement>(null);
  const progress = useViewportProgress(section);
  // The columns travel at different speeds, so they slide past each other.
  const headingY = useScrollRange(progress, "80px", "-80px", "0px");
  const copyY = useScrollRange(progress, "160px", "-60px", "0px");

  return (
    <section
      className="shell section-space grid min-w-0 gap-[clamp(2.5rem,6vw,8rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end"
      id="about"
      ref={section}
    >
      <motion.div style={{ y: headingY }}>
        <Reveal>
          <p className="mb-[clamp(1rem,2vw,2rem)] flex items-center gap-3 font-mono text-[length:var(--text-small)] uppercase tracking-[0.2em] text-ink-muted">
            <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
            About
          </p>
          <h2 className="max-w-[12ch] text-[length:var(--text-h2)] font-semibold leading-[0.92] tracking-[-0.06em] text-ink">
            <SplitText>Crafted interfaces with dependable engineering.</SplitText>
          </h2>
        </Reveal>
      </motion.div>

      <motion.div style={{ y: copyY }}>
        <Reveal className="grid gap-[clamp(1.5rem,3vw,2.5rem)]" delay={0.1}>
          <p className="max-w-[38rem] text-[length:var(--text-body)] leading-relaxed text-ink-muted">
            I&apos;m Aung Myat Kyaw, a front-end and full-stack developer based in
            Bangkok. I build expressive digital products where editorial design,
            performance budgets, and accessibility stay in balance from the first
            sketch through production.
          </p>

          <div className="grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[length:var(--text-small)] uppercase tracking-[0.16em] text-ink-muted">
                Focus
              </p>
              <p className="mt-2 text-[length:var(--text-body)] leading-relaxed text-ink">
                Fluid layouts, motion with intent, and resilient component systems.
              </p>
            </div>
            <div>
              <p className="font-mono text-[length:var(--text-small)] uppercase tracking-[0.16em] text-ink-muted">
                Approach
              </p>
              <p className="mt-2 text-[length:var(--text-body)] leading-relaxed text-ink">
                Ship fast without sacrificing clarity, keyboard access, or load
                performance.
              </p>
            </div>
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}
