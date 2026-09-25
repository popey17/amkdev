"use client";

import { useCallback, useSyncExternalStore } from "react";

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

/**
 * Hydration-safe media query: server render and the hydrating client render
 * both use `serverValue`, then React re-renders with the live match.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : serverValue;

  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}

export function usePrefersReducedMotion() {
  return useMediaQuery(reducedMotionQuery);
}
