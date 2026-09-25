"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";
import { reducedMotionQuery } from "@/lib/use-media-query";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type RevealState = "static" | "pending" | "revealed";

/**
 * Server HTML is always visible ("static"). After mount, only content that is
 * still below the fold is hidden and revealed on intersection; the hiding CSS
 * is gated by `prefers-reduced-motion: no-preference` in globals.css.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia(reducedMotionQuery).matches
    ) {
      return;
    }
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("revealed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(className)}
      data-reveal={state}
      ref={ref}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
