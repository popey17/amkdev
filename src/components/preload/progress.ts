export const SOFT_CAP = 0.9;
export const MIN_VISIBLE_MS = 3000;
export const RUN_AFTER_MS = 1500;
export const EXIT_MS = 280;

/** Progress units per second while walking / running (toward the soft cap). */
export const WALK_SPEED = 0.12;
export const RUN_SPEED = 0.32;
export const REDUCED_MOTION_SPEED = 0.4;

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

/** Advance displayed progress; walk and run use different velocities. */
export function stepProgress(input: ProgressInput): ProgressOutput {
  const { elapsedMs, ready, previous, deltaSeconds, reducedMotion } = input;

  const canFinish = ready && elapsedMs >= MIN_VISIBLE_MS;
  const running = !reducedMotion && !canFinish && elapsedMs >= RUN_AFTER_MS;

  let progress: number;
  if (canFinish) {
    progress = 1;
  } else {
    const speed = reducedMotion
      ? REDUCED_MOTION_SPEED
      : running
        ? RUN_SPEED
        : WALK_SPEED;
    progress = Math.min(SOFT_CAP, previous + speed * deltaSeconds);
  }

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
