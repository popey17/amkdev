"use client";

import { useEffect, useRef, useState } from "react";

import { personSprite } from "@/components/contact/footer-sprites";
import { SpriteSheet, frameSize } from "@/components/pixel-sprite/sprite-sheet";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

import {
  EXIT_MS,
  formatPercent,
  stepProgress,
  type PreloadGait,
} from "./progress";

export function Preload() {
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [gait, setGait] = useState<PreloadGait>(reducedMotion ? "idle" : "walk");
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const progressRef = useRef(0);
  const startRef = useRef(0);
  const exitingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      readyRef.current = true;
    };

    const waitFontsThenReady = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore font readiness failures */
      }
      if (!cancelled) markReady();
    };

    if (document.readyState === "complete") {
      void waitFontsThenReady();
    } else {
      const onLoad = () => {
        void waitFontsThenReady();
      };
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted || exitingRef.current) return;

    let frame = 0;
    let last = 0;
    startRef.current = performance.now();

    const tick = (time: number) => {
      const delta = Math.min((time - (last || time)) / 1000, 0.05);
      last = time;
      const elapsedMs = time - startRef.current;
      const out = stepProgress({
        elapsedMs,
        ready: readyRef.current,
        previous: progressRef.current,
        deltaSeconds: delta,
        reducedMotion,
      });

      progressRef.current = out.progress;
      setProgress(out.progress);
      setGait(out.gait);

      const track = trackRef.current;
      const walker = walkerRef.current;
      if (track && walker) {
        const { width: actorW } = frameSize(personSprite);
        const maxX = Math.max(track.clientWidth - actorW, 0);
        const x = out.progress * maxX;
        const strideKey = out.gait === "run" ? "run" : "walk";
        const cycle = personSprite.cycles[out.gait];
        const step =
          out.gait === "idle"
            ? 0
            : Math.floor((out.progress * maxX) / personSprite.stride[strideKey]);
        const frameIndex = cycle[step % cycle.length]!;
        walker.style.transform = `translate3d(${x}px, 0, 0)`;
        const sheet = walker.querySelector<SVGElement>("[data-sprite-sheet]");
        if (sheet) {
          sheet.style.transform = `translateX(${-frameIndex * actorW}px)`;
        }
      }

      if (out.shouldExit && !exitingRef.current) {
        exitingRef.current = true;
        setExiting(true);
        window.setTimeout(() => setMounted(false), EXIT_MS);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mounted, reducedMotion]);

  if (!mounted) return null;

  const { width, height } = frameSize(personSprite);

  return (
    <div
      aria-busy={!exiting}
      aria-live="polite"
      className={`fixed inset-0 z-100 flex items-center justify-center bg-surface transition-opacity duration-300 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      data-testid="preload"
      role="status"
    >
      <div className="flex w-full flex-col gap-3 px-10">
        <div className="relative h-[72px]">
          <div
            className="absolute bottom-3 left-0 right-0 h-0.5 overflow-hidden bg-ink/20"
            data-testid="preload-track"
            ref={trackRef}
          >
            <div
              className="absolute inset-y-0 left-0 bg-ink"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-3 origin-bottom-left will-change-transform"
            data-gait={gait}
            data-testid="preload-walker"
            ref={walkerRef}
            style={{ height, marginBottom: 2, width }}
          >
            <div className="relative size-full overflow-hidden">
              <SpriteSheet sprite={personSprite} />
            </div>
          </div>
        </div>
        <p
          className="self-end font-mono text-2xl tabular-nums text-ink-muted sm:text-3xl"
          data-testid="preload-percent"
        >
          {formatPercent(progress)}
        </p>
      </div>
    </div>
  );
}
