import { describe, expect, it } from "vitest";

import {
  FINISH_SPEED,
  MAX_DELTA_S,
  MIN_VISIBLE_MS,
  RUN_AFTER_MS,
  RUN_RATE,
  SOFT_CAP,
  WALK_RATE,
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
    const input = { ready: false, previous: 0.2, deltaSeconds: 0.1, reducedMotion: false };
    const walk = stepProgress({ ...input, elapsedMs: 500 });
    const run = stepProgress({ ...input, elapsedMs: RUN_AFTER_MS });

    expect(walk.progress).toBeCloseTo(0.2 + (SOFT_CAP - 0.2) * WALK_RATE * 0.1);
    expect(run.progress).toBeCloseTo(0.2 + (SOFT_CAP - 0.2) * RUN_RATE * 0.1);
    expect(run.progress).toBeGreaterThan(walk.progress);
  });

  it("stands idle once parked at the soft cap", () => {
    const out = stepProgress({
      elapsedMs: 8000,
      ready: false,
      previous: SOFT_CAP,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(out.progress).toBe(SOFT_CAP);
    expect(out.gait).toBe("idle");
  });

  it("does not leap after a long stalled frame", () => {
    const out = stepProgress({
      elapsedMs: 1000,
      ready: false,
      previous: 0.1,
      deltaSeconds: 4,
      reducedMotion: false,
    });
    expect(out.progress - 0.1).toBeLessThanOrEqual((SOFT_CAP - 0.1) * WALK_RATE * MAX_DELTA_S + 1e-9);
  });

  it("does not finish before the minimum even when ready", () => {
    const out = stepProgress({
      elapsedMs: MIN_VISIBLE_MS - 1000,
      ready: true,
      previous: 0.85,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(out.progress).toBeLessThan(1);
    expect(out.shouldExit).toBe(false);
  });

  it("sprints to 1 once ready instead of jumping, then signals exit", () => {
    const sprint = stepProgress({
      elapsedMs: MIN_VISIBLE_MS,
      ready: true,
      previous: 0.5,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(sprint.progress).toBeCloseTo(0.5 + FINISH_SPEED * 0.05);
    expect(sprint.gait).toBe("run");
    expect(sprint.shouldExit).toBe(false);

    const arrive = stepProgress({
      elapsedMs: MIN_VISIBLE_MS + 500,
      ready: true,
      previous: 0.98,
      deltaSeconds: 0.05,
      reducedMotion: false,
    });
    expect(arrive.progress).toBe(1);
    expect(arrive.shouldExit).toBe(true);
    expect(arrive.gait).toBe("idle");
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
