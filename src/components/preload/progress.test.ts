import { describe, expect, it } from "vitest";

import {
  MIN_VISIBLE_MS,
  RUN_AFTER_MS,
  RUN_SPEED,
  SOFT_CAP,
  WALK_SPEED,
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

  it("advances faster while running than while walking", () => {
    const deltaSeconds = 0.1;
    const previous = 0.2;

    const walk = stepProgress({
      elapsedMs: 500,
      ready: false,
      previous,
      deltaSeconds,
      reducedMotion: false,
    });
    const run = stepProgress({
      elapsedMs: RUN_AFTER_MS,
      ready: false,
      previous,
      deltaSeconds,
      reducedMotion: false,
    });

    expect(WALK_SPEED).toBeLessThan(RUN_SPEED);
    expect(walk.progress - previous).toBeCloseTo(WALK_SPEED * deltaSeconds);
    expect(run.progress - previous).toBeCloseTo(RUN_SPEED * deltaSeconds);
    expect(run.progress).toBeGreaterThan(walk.progress);
  });

  it("does not finish before the 3s minimum even when ready", () => {
    const out = stepProgress({
      elapsedMs: 2000,
      ready: true,
      previous: 0.85,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(out.progress).toBeLessThan(1);
    expect(out.shouldExit).toBe(false);
  });

  it("reaches 1 and signals exit when ready after min visible time", () => {
    const out = stepProgress({
      elapsedMs: MIN_VISIBLE_MS,
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
