# Preload Walker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen preload overlay where the footer pixel person walks along a progress bar from 0% to 100%, switching to a run after 1.5s if the page is still loading, without changing footer behavior.

**Architecture:** Extract shared `SpriteSheet` / `frameSize` so footer and preload render the same pixel art. Pure progress helpers drive hybrid timer + readiness. A client `Preload` overlay mounts in root layout, animates the person on a centered track, then fades out and unmounts.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, existing `footer-sprites.ts` + `usePrefersReducedMotion`.

**Spec:** `docs/superpowers/specs/2026-09-26-preload-walker-design.md`

## Global Constraints

- Do not change footer crowd behavior, cast, dog, or pointer flee — only re-import shared sprite render helpers.
- Reuse `personSprite` from `src/components/contact/footer-sprites.ts` (single source of frame data).
- Hybrid progress: ease toward ~90% while waiting; reach 100% only when page is ready **and** minimum display time (~1.2s) has elapsed.
- At **1.5s** elapsed while not finished: gait switches walk → run.
- Full-screen overlay; person on the progress bar; show `%`.
- Respect `prefers-reduced-motion`: idle pose, no walk cycle; bar still fills.
- Overlay `z-index` must sit above site chrome (header mobile overlay uses `z-50`, cursor trail `z-[60]`, scroll progress `z-[55]`) — use `z-[100]`.
- Do not create git commits unless the user explicitly asks.

## Planned File Structure

- Create: `src/components/pixel-sprite/sprite-sheet.tsx` — `PIXEL`, `frameSize`, `SpriteSheet`
- Create: `src/components/pixel-sprite/sprite-sheet.test.tsx` — sheet renders expected rects
- Modify: `src/components/contact/footer-crowd.tsx` — import shared helpers; delete local duplicates
- Create: `src/components/preload/progress.ts` — pure progress / gait helpers
- Create: `src/components/preload/progress.test.ts`
- Create: `src/components/preload/preload.tsx` — overlay UI + animation loop
- Create: `src/components/preload/preload.test.tsx`
- Modify: `src/app/layout.tsx` — mount `<Preload />`

---

### Task 1: Extract shared SpriteSheet

**Files:**
- Create: `src/components/pixel-sprite/sprite-sheet.tsx`
- Create: `src/components/pixel-sprite/sprite-sheet.test.tsx`
- Modify: `src/components/contact/footer-crowd.tsx`

**Interfaces:**
- Consumes: `Sprite` from `src/components/contact/footer-sprites.ts`, `spritePalette` from same file
- Produces:
  - `export const PIXEL = 4`
  - `export function frameSize(sprite: Sprite): { width: number; height: number }`
  - `export function SpriteSheet({ sprite }: { sprite: Sprite }): JSX.Element`

- [ ] **Step 1: Write the failing SpriteSheet test**

Create `src/components/pixel-sprite/sprite-sheet.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { personSprite } from "@/components/contact/footer-sprites";

import { PIXEL, SpriteSheet, frameSize } from "./sprite-sheet";

describe("frameSize", () => {
  it("multiplies grid by PIXEL", () => {
    const cols = personSprite.frames[0]![0]!.length;
    const rows = personSprite.frames[0]!.length;
    expect(frameSize(personSprite)).toEqual({
      width: cols * PIXEL,
      height: rows * PIXEL,
    });
  });
});

describe("SpriteSheet", () => {
  it("renders one svg with data-sprite-sheet and at least one filled rect", () => {
    const { container } = render(<SpriteSheet sprite={personSprite} />);
    const svg = container.querySelector("[data-sprite-sheet]");
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll("rect").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/pixel-sprite/sprite-sheet.test.tsx`

Expected: FAIL — module not found / cannot resolve `./sprite-sheet`

- [ ] **Step 3: Implement shared sprite-sheet module**

Create `src/components/pixel-sprite/sprite-sheet.tsx` by moving the existing helpers from `footer-crowd.tsx` (lines that define `pixel`, `frameSize`, and `SpriteSheet`):

```tsx
import { type Sprite, spritePalette } from "@/components/contact/footer-sprites";

export const PIXEL = 4;

export function frameSize(sprite: Sprite) {
  const frame = sprite.frames[0]!;
  return { width: frame[0]!.length * PIXEL, height: frame.length * PIXEL };
}

/** All frames side by side in one SVG; horizontal runs merge into single rects. */
export function SpriteSheet({ sprite }: { sprite: Sprite }) {
  const columns = sprite.frames[0]![0]!.length;
  const rows = sprite.frames[0]!.length;
  const rects: { x: number; y: number; width: number; className: string }[] = [];

  sprite.frames.forEach((frame, frameIndex) => {
    frame.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const char = row[x]!;
        let end = x + 1;
        while (end < row.length && row[end] === char) end += 1;
        const className = spritePalette[char];
        if (className) rects.push({ x: frameIndex * columns + x, y, width: end - x, className });
        x = end;
      }
    });
  });

  return (
    <svg
      className="absolute left-0 top-0 block"
      data-sprite-sheet=""
      height={rows * PIXEL}
      shapeRendering="crispEdges"
      viewBox={`0 0 ${columns * sprite.frames.length} ${rows}`}
      width={columns * sprite.frames.length * PIXEL}
    >
      {rects.map((rect) => (
        <rect
          className={rect.className}
          height={1}
          key={`${rect.x}-${rect.y}`}
          width={rect.width}
          x={rect.x}
          y={rect.y}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: Point FooterCrowd at the shared module**

In `src/components/contact/footer-crowd.tsx`:

1. Remove local `const pixel = 4`, local `frameSize`, and local `SpriteSheet`.
2. Update imports:

```tsx
import { dogSprite, personSprite, type Sprite } from "./footer-sprites";
import { PIXEL, SpriteSheet, frameSize } from "@/components/pixel-sprite/sprite-sheet";
```

3. Replace every former `pixel` usage with `PIXEL` (if any remain outside removed helpers — the old helpers used `pixel` internally; actor sizing already goes through `frameSize`).

Do **not** change cast, tick loop, JSX structure, or `data-testid="footer-crowd"`.

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm test -- src/components/pixel-sprite/sprite-sheet.test.tsx src/components/contact/footer-crowd.test.tsx
```

Expected: PASS (footer still renders walker/dog/runner; sheet tests pass)

- [ ] **Step 6: Commit only if the user asked to commit**

Otherwise leave changes unstaged/working tree and continue.

---

### Task 2: Pure progress + gait helpers

**Files:**
- Create: `src/components/preload/progress.ts`
- Create: `src/components/preload/progress.test.ts`

**Interfaces:**
- Consumes: none
- Produces:

```ts
export const SOFT_CAP = 0.9;
export const MIN_VISIBLE_MS = 1200;
export const RUN_AFTER_MS = 1500;
export const EXIT_MS = 280;

export type PreloadGait = "idle" | "walk" | "run";

export type ProgressInput = {
  elapsedMs: number;
  ready: boolean;
  /** Previous displayed progress in [0, 1]. */
  previous: number;
  /** Frame delta in seconds. */
  deltaSeconds: number;
  reducedMotion: boolean;
};

export type ProgressOutput = {
  progress: number;
  gait: PreloadGait;
  /** True when progress hit 1 and exit animation should begin. */
  shouldExit: boolean;
};

export function stepProgress(input: ProgressInput): ProgressOutput;

export function formatPercent(progress: number): string;
```

- [ ] **Step 1: Write failing progress tests**

Create `src/components/preload/progress.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  RUN_AFTER_MS,
  SOFT_CAP,
  formatPercent,
  stepProgress,
} from "./progress";

describe("stepProgress", () => {
  it("never reaches 1 while not ready", () => {
    let previous = 0;
    for (let i = 0; i < 120; i++) {
      const out = stepProgress({
        elapsedMs: i * 50,
        ready: false,
        previous,
        deltaSeconds: 0.05,
        reducedMotion: false,
      });
      expect(out.progress).toBeLessThan(1);
      expect(out.progress).toBeLessThanOrEqual(SOFT_CAP + 1e-6);
      expect(out.shouldExit).toBe(false);
      previous = out.progress;
    }
  });

  it("uses walk before 1.5s and run after while not finished", () => {
    const early = stepProgress({
      elapsedMs: 1000,
      ready: false,
      previous: 0.2,
      deltaSeconds: 0.016,
      reducedMotion: false,
    });
    expect(early.gait).toBe("walk");

    const late = stepProgress({
      elapsedMs: RUN_AFTER_MS,
      ready: false,
      previous: 0.5,
      deltaSeconds: 0.016,
      reducedMotion: false,
    });
    expect(late.gait).toBe("run");
  });

  it("reaches 1 and signals exit when ready after min visible time", () => {
    const out = stepProgress({
      elapsedMs: 2000,
      ready: true,
      previous: 0.85,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(out.progress).toBe(1);
    expect(out.shouldExit).toBe(true);
    expect(out.gait).toBe("idle");
  });

  it("stays idle under reduced motion", () => {
    const out = stepProgress({
      elapsedMs: 2000,
      ready: false,
      previous: 0.4,
      deltaSeconds: 0.05,
      reducedMotion: true,
    });
    expect(out.gait).toBe("idle");
    expect(out.progress).toBeLessThan(1);
  });
});

describe("formatPercent", () => {
  it("rounds down to whole percent string", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.426)).toBe("42%");
    expect(formatPercent(1)).toBe("100%");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/preload/progress.test.ts`

Expected: FAIL — cannot find module `./progress`

- [ ] **Step 3: Implement progress helpers**

Create `src/components/preload/progress.ts`:

```ts
export const SOFT_CAP = 0.9;
export const MIN_VISIBLE_MS = 1200;
export const RUN_AFTER_MS = 1500;
export const EXIT_MS = 280;

export type PreloadGait = "idle" | "walk" | "run";

export type ProgressInput = {
  elapsedMs: number;
  ready: boolean;
  previous: number;
  deltaSeconds: number;
  reducedMotion: boolean;
};

export type ProgressOutput = {
  progress: number;
  gait: PreloadGait;
  shouldExit: boolean;
};

/** Ease displayed progress toward a target with a speed that depends on gait. */
export function stepProgress(input: ProgressInput): ProgressOutput {
  const { elapsedMs, ready, previous, deltaSeconds, reducedMotion } = input;

  const canFinish = ready && elapsedMs >= MIN_VISIBLE_MS;
  const target = canFinish ? 1 : SOFT_CAP;
  const running = !reducedMotion && !canFinish && elapsedMs >= RUN_AFTER_MS;
  const rate = reducedMotion ? 1.2 : running ? 0.55 : 0.35;
  const next = Math.min(target, previous + (target - previous) * Math.min(1, rate * deltaSeconds * 3) + rate * deltaSeconds * 0.08);

  // Snap to 1 when finishing so exit is deterministic within a few frames.
  const progress = canFinish && next >= 0.995 ? 1 : Math.min(next, canFinish ? 1 : SOFT_CAP);

  let gait: PreloadGait = "idle";
  if (!reducedMotion && progress < 1) {
    gait = running ? "run" : "walk";
  }

  return {
    progress,
    gait,
    shouldExit: progress >= 1,
  };
}

export function formatPercent(progress: number): string {
  return `${Math.min(100, Math.max(0, Math.floor(progress * 100)))}%`;
}
```

Tune the easing constants if tests flake on the soft-cap loop; the important invariants are: `< 1` while not ready, `=== 1` + `shouldExit` when ready after min time, gait walk→run at 1.5s, idle when reduced motion.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/preload/progress.test.ts`

Expected: PASS

- [ ] **Step 5: Commit only if the user asked to commit**

---

### Task 3: Preload overlay component

**Files:**
- Create: `src/components/preload/preload.tsx`
- Create: `src/components/preload/preload.test.tsx`

**Interfaces:**
- Consumes: `personSprite`, `SpriteSheet`, `frameSize`, `PIXEL`, `stepProgress`, `formatPercent`, `EXIT_MS`, `usePrefersReducedMotion`
- Produces: `export function Preload(): JSX.Element | null`

Behavior summary for implementers:

1. `"use client"` component.
2. State: `progress` (0–1), `gait`, `exiting`, `mounted` (start `true`; set `false` after exit timeout).
3. On mount: mark ready when `document.readyState === "complete"` **and** `document.fonts?.ready` settles (if fonts API missing, treat fonts as ready). Also listen to `window` `load`.
4. `requestAnimationFrame` loop calls `stepProgress` each frame; update person `transform` / sheet frame like footer (distance from progress × track width).
5. When `shouldExit`: set `exiting`, after `EXIT_MS` set `mounted` false (return `null`).
6. Markup: fixed inset overlay `z-[100] bg-surface`, `role="status"` / `aria-busy={!exiting}`, centered track (~min(28rem, 80vw)), fill width = progress, person on the bar (`aria-hidden`), percent text via `formatPercent`.
7. Reduced motion: gait always idle from helper; still move person with progress (position on bar), no sheet frame cycling beyond idle frame 0.

- [ ] **Step 1: Write failing Preload tests**

Create `src/components/preload/preload.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Preload } from "./preload";

describe("Preload", () => {
  let reduceMotion = false;
  let rafCb: FrameRequestCallback | null = null;

  beforeEach(() => {
    reduceMotion = false;
    rafCb = null;
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce") ? reduceMotion : false,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCb = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "loading",
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise(() => {}) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders overlay with percent and walker on the track", () => {
    render(<Preload />);
    expect(screen.getByTestId("preload")).toBeInTheDocument();
    expect(screen.getByTestId("preload-percent")).toHaveTextContent(/%/);
    expect(screen.getByTestId("preload-walker")).toBeInTheDocument();
  });

  it("switches data-gait to run after 1.5s while still loading", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Preload />);

    act(() => {
      vi.advanceTimersByTime(1500);
      rafCb?.(performance.now());
    });

    expect(screen.getByTestId("preload-walker")).toHaveAttribute("data-gait", "run");
  });

  it("keeps idle gait under reduced motion", () => {
    reduceMotion = true;
    render(<Preload />);
    act(() => {
      rafCb?.(performance.now());
    });
    expect(screen.getByTestId("preload-walker")).toHaveAttribute("data-gait", "idle");
  });
});
```

If RAF + fake timers prove flaky, prefer asserting via exposing `data-gait` updated inside the effect after a manual `act` that calls the stored RAF callback twice with increasing timestamps (first at `t=0`, second at `t=1600` with `ready` still false). Adjust the test to match the component’s actual timing hook, but keep the three behaviors: overlay present, run after 1.5s, idle when reduced motion.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/preload/preload.test.tsx`

Expected: FAIL — cannot find module `./preload`

- [ ] **Step 3: Implement Preload**

Create `src/components/preload/preload.tsx`. Suggested structure:

```tsx
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
  const [gait, setGait] = useState<PreloadGait>("walk");
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const progressRef = useRef(0);
  const distanceRef = useRef(0);
  const startRef = useRef(0);
  const exitingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      readyRef.current = true;
    };

    const waitFonts = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (!cancelled && document.readyState === "complete") markReady();
    };

    if (document.readyState === "complete") {
      void waitFonts().then(() => {
        if (!cancelled) markReady();
      });
    } else {
      window.addEventListener("load", () => {
        void waitFonts().then(() => {
          if (!cancelled) markReady();
        });
      }, { once: true });
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
        const travel = Math.abs(x - distanceRef.current);
        distanceRef.current = x;
        const cycle = personSprite.cycles[out.gait];
        const step =
          out.gait === "idle"
            ? 0
            : Math.floor((out.progress * maxX) / personSprite.stride[out.gait === "run" ? "run" : "walk"]);
        const frameIndex = cycle[step % cycle.length]!;
        walker.style.transform = `translate3d(${x}px, 0, 0)`;
        const sheet = walker.querySelector<SVGElement>("[data-sprite-sheet]");
        if (sheet) {
          sheet.style.transform = `translateX(${-frameIndex * actorW}px)`;
        }
        void travel;
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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-surface transition-opacity duration-280 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      data-testid="preload"
      role="status"
    >
      <div className="flex w-[min(28rem,80vw)] flex-col gap-3 px-4">
        <div className="relative h-[72px]">
          <div
            className="absolute bottom-3 left-0 right-0 h-0.5 bg-ink/20"
            data-testid="preload-track"
            ref={trackRef}
          >
            <div
              className="absolute inset-y-0 left-0 bg-ink"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div
            className="absolute bottom-3 origin-bottom-left will-change-transform"
            data-gait={gait}
            data-testid="preload-walker"
            ref={walkerRef}
            style={{ height, width }}
            aria-hidden="true"
          >
            <div className="relative size-full overflow-hidden">
              <SpriteSheet sprite={personSprite} />
            </div>
          </div>
        </div>
        <p
          className="font-mono text-sm tabular-nums text-ink-muted"
          data-testid="preload-percent"
        >
          {formatPercent(progress)}
        </p>
      </div>
    </div>
  );
}
```

Fix Tailwind: if `duration-280` is invalid, use `duration-300`. Ensure walker’s bottom aligns so feet sit on the track (adjust `bottom` / padding as needed when visually checking).

- [ ] **Step 4: Run Preload + progress + footer tests**

Run:

```bash
npm test -- src/components/preload src/components/pixel-sprite src/components/contact/footer-crowd.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit only if the user asked to commit**

---

### Task 4: Mount in root layout + smoke verification

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Preload` from `@/components/preload/preload`
- Produces: layout renders `<Preload />` as first child inside `<body>` (before `{children}`) so it covers the page on first paint after hydration

- [ ] **Step 1: Mount Preload in layout**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Preload } from "@/components/preload/preload";
import { themeStorageKey } from "@/lib/theme";
import "./globals.css";

// ... existing font + metadata + themeScript unchanged ...

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Preload />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

Expected: exit 0

- [ ] **Step 3: Full unit test suite**

Run: `npm test`

Expected: exit 0 (all existing tests still green)

- [ ] **Step 4: Manual smoke (dev)**

Run: `npm run dev`, open the site, hard-refresh:

- Overlay covers viewport with person walking on bar and `%` updating
- After 1.5s if still visible and not done, person runs
- Overlay fades away and page is usable; footer crowd still walks as before
- With OS reduced-motion on: person idle, bar still completes

- [ ] **Step 5: Commit only if the user asked to commit**

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Full-screen overlay, centered bar + person + % | Task 3–4 |
| Hybrid progress, soft cap ~90%, finish only when ready + min time | Task 2–3 |
| Run after 1.5s | Task 2–3 |
| Reuse person sprite; no dog | Task 3 |
| Footer unchanged (behavior) | Task 1 + tests |
| Shared SpriteSheet extract | Task 1 |
| Reduced motion idle | Task 2–3 |
| Exit fade + unmount | Task 3 |
| Mount in layout | Task 4 |
