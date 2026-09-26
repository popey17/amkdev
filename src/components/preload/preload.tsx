"use client";

import { useEffect, useRef, useState } from "react";

import { personSprite } from "@/components/contact/footer-sprites";
import { PIXEL, SpriteSheet, frameSize } from "@/components/pixel-sprite/sprite-sheet";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

import {
  EXIT_MS,
  HOLD_MS,
  formatPercent,
  stepProgress,
  type PreloadGait,
} from "./progress";

const TICKS = Array.from({ length: 11 }, (_, i) => i * 10);

/** Pixel finish flag, same grid language as the sprite: | pole, a flag. */
const flag = [
  "#aaaa",
  "#aaaa",
  "#aa..",
  "#....",
  "#....",
  "#....",
  "#....",
  "#....",
];
const FLAG_W = flag[0]!.length * PIXEL;

export function Preload() {
  const reducedMotion = usePrefersReducedMotion();
  const [gait, setGait] = useState<PreloadGait>(reducedMotion ? "idle" : "walk");
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const readyRef = useRef(false);
  const progressRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const waitFontsThenReady = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore font readiness failures */
      }
      if (!cancelled) readyRef.current = true;
    };

    if (document.readyState === "complete") {
      void waitFontsThenReady();
      return () => {
        cancelled = true;
      };
    }

    const onLoad = () => void waitFontsThenReady();
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (finishedRef.current) return;

    let frame = 0;
    let last: number | null = null;
    const timers: number[] = [];
    startRef.current ??= performance.now();

    const tick = (time: number) => {
      const delta = last === null ? 0 : (time - last) / 1000;
      last = time;
      const out = stepProgress({
        elapsedMs: time - startRef.current!,
        ready: readyRef.current,
        previous: progressRef.current,
        deltaSeconds: delta,
        reducedMotion,
      });

      progressRef.current = out.progress;
      setGait(out.gait);
      paint(out.progress, out.gait);

      if (out.shouldExit) {
        finishedRef.current = true;
        setDone(true);
        timers.push(
          window.setTimeout(() => {
            document.documentElement.dataset.preload = "done";
            setExiting(true);
            timers.push(window.setTimeout(() => setMounted(false), EXIT_MS));
          }, HOLD_MS),
        );
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const paint = (progress: number, currentGait: PreloadGait) => {
      const percent = formatPercent(progress);
      if (percentRef.current) percentRef.current.textContent = percent.slice(0, -1);
      trackRef.current?.setAttribute("aria-valuenow", String(Math.floor(progress * 100)));

      const track = trackRef.current;
      const walker = walkerRef.current;
      if (!track || !walker) return;
      const { width: actorW } = frameSize(personSprite);
      const trackW = track.clientWidth;
      // Walker stops short of the flag; the fill ends under its feet, then
      // runs out to the flag on arrival.
      const x = progress * Math.max(trackW - actorW - FLAG_W - PIXEL, 0);
      const fill = fillRef.current;
      if (fill && trackW > 0) {
        if (progress >= 1) fill.style.transition = "transform 0.3s ease-out";
        fill.style.transform = `scaleX(${progress >= 1 ? 1 : (x + actorW / 2) / trackW})`;
      }
      const cycle = personSprite.cycles[currentGait];
      const step =
        currentGait === "idle"
          ? 0
          : Math.floor(x / personSprite.stride[currentGait]);
      walker.style.transform = `translate3d(${x}px, 0, 0)`;
      const sheet = walker.querySelector<SVGElement>("[data-sprite-sheet]");
      if (sheet) sheet.style.transform = `translateX(${-cycle[step % cycle.length]! * actorW}px)`;
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion]);

  if (!mounted) return null;

  const { width, height } = frameSize(personSprite);

  return (
    <div
      aria-busy={!done}
      className="preload fixed inset-0 z-100 flex items-center justify-center bg-surface"
      data-state={exiting ? "exit" : "active"}
      data-testid="preload"
    >
      <div className="preload-content w-full max-w-[40rem] px-[max(1rem,var(--page-gutter))]">
        <div className="mb-8 flex items-end justify-between gap-6">
          <p className="flex items-center gap-3 pb-2 font-mono text-[length:var(--text-small)] uppercase tracking-[0.2em] text-accent-ink">
            <span aria-hidden="true" className="h-px w-8 bg-accent-ink" />
            {done ? "Ready" : "Loading"}
          </p>
          <p
            aria-hidden="true"
            className="font-mono text-[clamp(3rem,2rem+4vw,5.5rem)] leading-none font-medium tracking-[-0.06em] tabular-nums text-ink"
            data-testid="preload-percent"
          >
            <span ref={percentRef}>0</span>
            <span className="text-[0.45em] tracking-normal text-ink-muted">%</span>
          </p>
        </div>

        <div className="relative" style={{ height: height + PIXEL * 2 }}>
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 will-change-transform"
            data-gait={gait}
            data-testid="preload-walker"
            ref={walkerRef}
            style={{ height, width }}
          >
            <span className="preload-dust" style={{ left: PIXEL }}>
              <span />
              <span />
              <span />
            </span>
            <div className="relative size-full overflow-hidden">
              <SpriteSheet sprite={personSprite} />
            </div>
          </div>

          <svg
            aria-hidden="true"
            className={`absolute right-0 bottom-0 transition-transform duration-500 ${
              done ? "-translate-y-1" : ""
            }`}
            height={flag.length * PIXEL}
            shapeRendering="crispEdges"
            viewBox={`0 0 ${flag[0]!.length} ${flag.length}`}
            width={FLAG_W}
          >
            {flag.flatMap((row, y) =>
              [...row].map((char, x) =>
                char === "." ? null : (
                  <rect
                    className={char === "#" ? "fill-ink-muted" : "fill-accent"}
                    height={1}
                    key={`${x}-${y}`}
                    width={1}
                    x={x}
                    y={y}
                  />
                ),
              ),
            )}
          </svg>
        </div>

        <div
          aria-label="Loading"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={0}
          className="relative h-0.5 bg-line"
          data-testid="preload-track"
          ref={trackRef}
          role="progressbar"
        >
          <div
            className="absolute inset-0 origin-left bg-accent-ink"
            ref={fillRef}
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div aria-hidden="true" className="mt-2 flex justify-between">
          {TICKS.map((tick) => (
            <span
              className={`w-px ${tick % 50 === 0 ? "h-2 bg-ink-muted/60" : "h-1 bg-line"}`}
              key={tick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
