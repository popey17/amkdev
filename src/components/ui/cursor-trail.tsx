"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion, useMediaQuery } from "@/lib/use-media-query";

const trailLength = 10;
const headSize = 14;
// Each square chases the one ahead; lower values make a longer, lazier trail.
const follow = 0.35;
const interactiveSelector = "a, button, [role='button'], input, textarea, select, label";

export function CursorTrail() {
  const hasFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const shouldReduceMotion = usePrefersReducedMotion();
  const squares = useRef<(HTMLSpanElement | null)[]>([]);
  const isEnabled = hasFinePointer && !shouldReduceMotion;

  useEffect(() => {
    if (!isEnabled) return;

    const target = { x: 0, y: 0 };
    const points = Array.from({ length: trailLength }, () => ({ x: 0, y: 0 }));
    let frame = 0;
    let isShown = false;
    let isOverInteractive = false;
    let headScale = 1;

    const setOpacity = (opacity: number) => {
      for (const square of squares.current) {
        if (square) square.style.opacity = String(opacity);
      }
    };

    const tick = () => {
      points.forEach((point, index) => {
        const leader = index === 0 ? target : points[index - 1];
        point.x += (leader.x - point.x) * (index === 0 ? 0.5 : follow);
        point.y += (leader.y - point.y) * (index === 0 ? 0.5 : follow);
      });
      headScale += ((isOverInteractive ? 2.4 : 1) - headScale) * 0.2;

      points.forEach((point, index) => {
        const square = squares.current[index];
        if (!square) return;
        const next = points[index + 1] ?? point;
        // Squares tilt along the direction of travel.
        const angle = Math.atan2(point.y - next.y, point.x - next.x);
        const scale = index === 0 ? headScale : 1;
        square.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${scale})`;
      });

      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!isShown) {
        // Start the trail at the pointer instead of sweeping in from the corner.
        for (const point of points) Object.assign(point, target);
        isShown = true;
        setOpacity(1);
      }
      isOverInteractive =
        event.target instanceof Element && Boolean(event.target.closest(interactiveSelector));
    };

    const onLeave = () => {
      isShown = false;
      setOpacity(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
      data-testid="cursor-trail"
    >
      {Array.from({ length: trailLength }, (_, index) => {
        const progress = index / trailLength;
        const size = headSize * (1 - progress * 0.7);
        return (
          <span
            className="absolute left-0 top-0 bg-accent-ink opacity-0 shadow-[0_0_12px_color-mix(in_srgb,var(--accent-ink)_45%,transparent)] transition-opacity duration-300"
            key={index}
            ref={(node) => {
              squares.current[index] = node;
            }}
            style={{
              height: size,
              width: size,
              // Fade the tail via filter so `opacity` stays free for show/hide.
              filter: `opacity(${1 - progress * 0.85})`,
            }}
          />
        );
      })}
    </div>
  );
}
