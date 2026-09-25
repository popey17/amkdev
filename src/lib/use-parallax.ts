"use client";

import {
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { RefObject } from "react";

const smoothing = { stiffness: 120, damping: 28, mass: 0.4 };

/**
 * Scroll progress of `target` travelling through the viewport, from its top
 * entering the bottom edge (0) to its bottom leaving the top edge (1),
 * spring-smoothed so wheel steps don't read as jumps.
 */
export function useViewportProgress(target: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  return useSpring(scrollYProgress, smoothing);
}

/**
 * Maps progress across `input` (default the whole 0→1 journey) onto
 * `[from, to]`, clamped, or pins it at `rest` when reduced motion is
 * requested. Transform-only by design: scroll-linked opacity would leave
 * content half-visible wherever the user stops.
 */
export function useScrollRange<T extends number | string>(
  progress: MotionValue<number>,
  from: T,
  to: T,
  rest: T,
  input: [number, number] = [0, 1],
) {
  const shouldReduceMotion = useReducedMotion();
  return useTransform(progress, input, shouldReduceMotion ? [rest, rest] : [from, to]);
}

/** Vertical drift of `distance` (any CSS length) either side of rest. */
export function useParallax(target: RefObject<HTMLElement | null>, distance: string) {
  const progress = useViewportProgress(target);
  return useScrollRange(progress, `-${distance}`, distance, "0px");
}
