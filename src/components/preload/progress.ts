export const SOFT_CAP = 0.9;
export const MIN_VISIBLE_MS = 3000;
export const RUN_AFTER_MS = 1500;
/** Pause on 100% so the arrival reads before the curtain lifts. */
export const HOLD_MS = 320;
export const EXIT_MS = 760;

/**
 * While loading, progress closes this fraction of the remaining gap to the
 * soft cap per second, so the walker slows as it nears the cap instead of
 * slamming into it. Running closes the gap faster.
 */
export const WALK_RATE = 0.35;
export const RUN_RATE = 0.9;
/** Floor speed (progress/s) so the approach never stalls to a crawl. */
export const MIN_SPEED = 0.03;
/** Sprint to the finish once ready: progress/s. */
export const FINISH_SPEED = 1.4;
export const REDUCED_MOTION_SPEED = 0.4;
/** Longest frame gap honoured; a stalled main thread catches up but can't leap. */
export const MAX_DELTA_S = 0.25;

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

/** Advance displayed progress: ease toward the soft cap, then sprint to 100%. */
export function stepProgress(input: ProgressInput): ProgressOutput {
  const { elapsedMs, ready, previous, reducedMotion } = input;
  const dt = Math.min(Math.max(input.deltaSeconds, 0), MAX_DELTA_S);

  const canFinish = ready && elapsedMs >= MIN_VISIBLE_MS;
  const running = canFinish || elapsedMs >= RUN_AFTER_MS;

  let progress: number;
  if (canFinish) {
    const speed = reducedMotion ? REDUCED_MOTION_SPEED * 2 : FINISH_SPEED;
    progress = Math.min(1, previous + speed * dt);
  } else if (reducedMotion) {
    progress = Math.min(SOFT_CAP, previous + REDUCED_MOTION_SPEED * dt);
  } else {
    const rate = running ? RUN_RATE : WALK_RATE;
    const speed = Math.max((SOFT_CAP - previous) * rate, MIN_SPEED);
    progress = Math.min(SOFT_CAP, previous + speed * dt);
  }

  // Standing still at the cap (or the finish) reads better than a frozen stride.
  let gait: PreloadGait = "idle";
  if (!reducedMotion && progress < 1 && (canFinish || progress < SOFT_CAP)) {
    gait = running ? "run" : "walk";
  }

  return { progress, gait, shouldExit: progress >= 1 };
}

export function formatPercent(progress: number): string {
  return `${Math.min(100, Math.max(0, Math.floor(progress * 100)))}%`;
}
