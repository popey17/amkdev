"use client";

import {
  type HTMLMotionProps,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  type PointerEvent,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/cn";

type MagneticLinkProps = HTMLMotionProps<"a">;

export function MagneticLink({
  children,
  className,
  onPointerLeave,
  onPointerMove,
  style,
  ...props
}: MagneticLinkProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const x = useSpring(useMotionValue(0), { stiffness: 280, damping: 22 });
  const y = useSpring(useMotionValue(0), { stiffness: 280, damping: 22 });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasFinePointer(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    onPointerMove?.(event);
    if (!hasFinePointer || shouldReduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.16);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.16);
  }

  function handlePointerLeave(event: PointerEvent<HTMLAnchorElement>) {
    onPointerLeave?.(event);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      className={cn(
        "inline-flex min-h-11 items-center justify-center transition-colors hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ink",
        className,
      )}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={
        hasFinePointer && !shouldReduceMotion ? { ...style, x, y } : style
      }
      {...props}
    >
      {children}
    </motion.a>
  );
}
