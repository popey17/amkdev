import { describe, expect, it } from "vitest";

import * as sceneState from "./hero-scene-state";
import {
  createParticleField,
  getOrbFrameFill,
  getSceneBoundingRadius,
  getSceneFrameloop,
  orbGeometry,
  orbitGeometry,
  sceneCamera,
} from "./hero-scene-state";

it("renders continuously only while actually visible", () => {
  expect(getSceneFrameloop(false, false)).toBe("never");
  expect(getSceneFrameloop(true, false)).toBe("always");
});

it("never renders continuously when reduced motion is requested", () => {
  expect(getSceneFrameloop(true, true)).toBe("demand");
  expect(getSceneFrameloop(false, true)).toBe("never");
});

describe("orb framing", () => {
  it("computes clipping for a sphere that exceeds the frustum", () => {
    expect(
      getOrbFrameFill({ aspect: 1, cameraZ: 6, distort: 0.42, fov: 38, scale: 2.25 }),
    ).toBeGreaterThan(1);
  });

  it.each([1, 1.25, 2])(
    "keeps the fully distorted orb inside the square-or-wider frame (aspect %s) with margin",
    (aspect) => {
      const fill = getOrbFrameFill({
        aspect,
        cameraZ: sceneCamera.z,
        distort: Math.max(orbGeometry.distort, orbGeometry.reducedDistort),
        fov: sceneCamera.fov,
        scale: orbGeometry.scale,
      });

      expect(fill).toBeLessThanOrEqual(0.65);
      expect(fill).toBeGreaterThanOrEqual(0.45);
    },
  );

  it.each([1, 1.25, 2])(
    "keeps the shell, rings and particles inside the frame (aspect %s) with margin",
    (aspect) => {
      const fill = getOrbFrameFill({
        aspect,
        cameraZ: sceneCamera.z,
        distort: 0,
        fov: sceneCamera.fov,
        scale: getSceneBoundingRadius(),
      });

      expect(fill).toBeLessThanOrEqual(0.9);
    },
  );
});

describe("scene quality", () => {
  type Quality = { dpr: [number, number]; detail: number; particles: number };
  const getSceneQuality = (
    sceneState as unknown as {
      getSceneQuality?: (input: {
        isCoarsePointer: boolean;
        isNarrow: boolean;
      }) => Quality;
    }
  ).getSceneQuality;

  it("lowers detail and pixel ratio on coarse-pointer or narrow devices", () => {
    expect(getSceneQuality).toBeTypeOf("function");
    const full = getSceneQuality!({ isCoarsePointer: false, isNarrow: false });
    const coarse = getSceneQuality!({ isCoarsePointer: true, isNarrow: false });
    const narrow = getSceneQuality!({ isCoarsePointer: false, isNarrow: true });

    expect(full).toEqual({ dpr: [1, 1.5], detail: 5, particles: 220 });
    for (const reduced of [coarse, narrow]) {
      expect(reduced.detail).toBeLessThan(full.detail);
      expect(reduced.particles).toBeLessThan(full.particles);
      expect(reduced.dpr[1]).toBeLessThan(full.dpr[1]);
    }
  });

  it("never exceeds a device pixel ratio of 1.5", () => {
    for (const isCoarsePointer of [false, true]) {
      for (const isNarrow of [false, true]) {
        const { dpr } = getSceneQuality!({ isCoarsePointer, isNarrow });
        expect(dpr[1]).toBeLessThanOrEqual(1.5);
        expect(dpr[0]).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("particle field", () => {
  it("is deterministic and stays within the orbit shell", () => {
    const [minRadius, maxRadius] = orbitGeometry.particleRadius;
    const field = createParticleField(200);

    expect(createParticleField(200).positions).toEqual(field.positions);
    for (let i = 0; i < 200; i++) {
      const radius = Math.hypot(
        field.positions[i * 3],
        field.positions[i * 3 + 1],
        field.positions[i * 3 + 2],
      );
      expect(radius).toBeGreaterThanOrEqual(minRadius - 1e-5);
      expect(radius).toBeLessThanOrEqual(maxRadius + 1e-5);
    }
  });
});
