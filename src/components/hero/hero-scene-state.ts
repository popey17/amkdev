export const sceneCamera = { fov: 38, z: 7 } as const;

export const orbGeometry = {
  scale: 1.12,
  distort: 0.4,
  reducedDistort: 0.18,
} as const;

/**
 * Everything that orbits the core. Radii are world units; the outermost one
 * (plus the float bob) bounds the whole scene, so it must stay inside the frame
 * or the canvas edge slices through it.
 */
export const orbitGeometry = {
  shellRadius: 1.5,
  ringRadii: [1.72, 1.9],
  particleRadius: [1.6, 1.95],
  floatAmplitude: 0.06,
} as const;

export function getSceneBoundingRadius() {
  return (
    Math.max(
      orbitGeometry.shellRadius,
      ...orbitGeometry.ringRadii,
      orbitGeometry.particleRadius[1],
    ) + orbitGeometry.floatAmplitude
  );
}

export type SceneQuality = {
  dpr: [number, number];
  detail: number;
  particles: number;
};

/** Reduced motion still paints one static frame so the fallback can step aside. */
export function getSceneFrameloop(
  isVisible: boolean,
  shouldReduceMotion: boolean,
) {
  if (!isVisible) return "never";
  return shouldReduceMotion ? "demand" : "always";
}

export function getSceneQuality({
  isCoarsePointer,
  isNarrow,
}: {
  isCoarsePointer: boolean;
  isNarrow: boolean;
}): SceneQuality {
  return isCoarsePointer || isNarrow
    ? { dpr: [1, 1.25], detail: 3, particles: 90 }
    : { dpr: [1, 1.5], detail: 5, particles: 220 };
}

/**
 * Fraction of the half-frame (vertical, or horizontal when narrower) covered by
 * the orb's silhouette at its maximum displacement. Values above 1 clip.
 * MeshDistortMaterial displaces vertices by `noise * distort^2` with noise in
 * [-1, 1], so the maximum radius is `scale * (1 + distort^2)`.
 */
export function getOrbFrameFill({
  aspect,
  cameraZ,
  distort,
  fov,
  scale,
}: {
  aspect: number;
  cameraZ: number;
  distort: number;
  fov: number;
  scale: number;
}) {
  const radius = scale * (1 + distort ** 2);
  const silhouette = radius / Math.sqrt(cameraZ ** 2 - radius ** 2);
  const halfFrame = Math.tan((fov * Math.PI) / 360) * Math.min(1, aspect);
  return silhouette / halfFrame;
}

/** Deterministic PRNG so the particle field is pure and identical every render. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Points on a spherical shell, radius biased toward the inner edge. */
export function createParticleField(count: number, seed = 7) {
  const random = mulberry32(seed);
  const [minRadius, maxRadius] = orbitGeometry.particleRadius;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const radius = minRadius + (maxRadius - minRadius) * random() ** 1.6;
    const ring = Math.sqrt(1 - u * u) * radius;
    positions.set([ring * Math.cos(theta), u * radius, ring * Math.sin(theta)], i * 3);
    scales[i] = 0.4 + random() * 1.1;
  }

  return { positions, scales };
}
