"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const spring = { damping: 24, stiffness: 220 };

export function PointerCompanion() {
  const shouldReduceMotion = useReducedMotion();
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const pupilX = useSpring(useMotionValue(0), spring);
  const pupilY = useSpring(useMotionValue(0), spring);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointer = () => setHasFinePointer(pointerQuery.matches);

    updatePointer();
    pointerQuery.addEventListener("change", updatePointer);
    return () => pointerQuery.removeEventListener("change", updatePointer);
  }, []);

  useEffect(() => {
    if (!hasFinePointer || shouldReduceMotion) {
      pupilX.set(0);
      pupilY.set(0);
      return;
    }

    const followPointer = (event: PointerEvent) => {
      const horizontal = (event.clientX / window.innerWidth - 0.5) * 12;
      const vertical = (event.clientY / window.innerHeight - 0.5) * 8;
      pupilX.set(horizontal);
      pupilY.set(vertical);
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    return () => window.removeEventListener("pointermove", followPointer);
  }, [hasFinePointer, pupilX, pupilY, shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex items-center gap-2"
      data-testid="pointer-companion"
    >
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-muted">
        Looking
      </span>
      <div
        className="relative h-8 w-14 overflow-hidden rounded-[100%] border border-ink/25 bg-surface-raised"
        data-testid="pointer-companion-eye"
      >
        <motion.span
          className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ x: pupilX, y: pupilY }}
        />
      </div>
    </div>
  );
}
