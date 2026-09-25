"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Hairline under the header that fills with page progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-accent shadow-[0_0_10px_rgb(198_255_50/0.6)]"
      data-testid="scroll-progress"
      style={{ scaleX }}
    />
  );
}
