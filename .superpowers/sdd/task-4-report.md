# Task 4 Report: Hero, Pointer Companion, and WebGL Scene

## Status

Complete. Added the focused hero composition, pointer-responsive decorative eye, resilient CSS orb fallback, and dynamically loaded React Three Fiber scene. `progress.md` was not edited.

## TDD Evidence

### RED 1 — semantic hero contract

Command:

`npm test -- src/components/hero/hero.test.tsx`

Result: exit 1. Vitest failed to resolve `./hero`, confirming the test failed because `Hero` did not exist.

### GREEN 1 — semantic and decorative contracts

Command:

`npm test -- src/components/hero/hero.test.tsx`

Result: exit 0; 1 file passed, 2 tests passed.

### RED 2 — WebGL failure resilience

Command:

`npm test -- src/components/hero/hero.test.tsx`

Result: exit 1; 1 of 3 tests failed with the intentional `WebGL unavailable` error because the scene was not isolated by an error boundary.

### GREEN 2 — WebGL failure resilience

Command:

`npm test -- src/components/hero/hero.test.tsx`

Result: exit 0; 1 file passed, 3 tests passed. The CSS fallback remains mounted when the scene throws.

## Implementation

- Built an `svh`-aware, fluid editorial hero with eyebrow, oversized role statement, supporting copy, two semantic CTAs, and a reduced-motion-safe scroll cue.
- Kept the CSS gradient orb permanently mounted inside a reserved square visual region so loading, unavailable, reduced-motion, and failed WebGL states retain a usable visual.
- Isolated only `hero-scene.tsx` behind `next/dynamic` with SSR disabled and a null loading state.
- Added a local scene error boundary so a failed scene does not remove the CSS fallback or hero content.
- Added a decorative pointer companion whose pupil follows only fine pointers and resets to a static center on touch or reduced motion.
- Added an icosahedron with `MeshDistortMaterial`, restrained lighting, damped pointer rotation, DPR capped at 1.5, and `IntersectionObserver`-controlled rendering.
- Marked the pointer companion and canvas wrapper `aria-hidden`.

## Changed Files

- `src/components/hero/hero.tsx` — hero shell, actions, persistent fallback, dynamic scene boundary.
- `src/components/hero/hero-scene.tsx` — isolated WebGL scene and visibility/reduced-motion rendering controls.
- `src/components/hero/pointer-companion.tsx` — fine-pointer eye tracking with static fallbacks.
- `src/components/hero/hero.test.tsx` — semantic, decorative, fallback-presence, and scene-failure tests.
- `.superpowers/sdd/task-4-report.md` — implementation report.

## Verification

- Focused tests: 3/3 passed.
- Full tests: 4 files passed, 17/17 tests passed.
- Typecheck: exit 0; route types generated and `tsc --noEmit` passed.
- Lint: exit 0; no ESLint errors.
- Production build: exit 0; Next.js compiled, typechecked, and generated static routes successfully.
- Editor diagnostics for `src/components/hero`: none.

## Self-Review

- The visual region reserves layout space at every breakpoint and clips its own effects, avoiding page-level horizontal overflow.
- The fallback is a sibling beneath the canvas rather than a loading-only replacement, so it remains available throughout every scene state.
- Motion is disabled or made static for reduced-motion users; touch devices do not receive pointer tracking.
- The scene has no textures, post-processing, shared page state, or nonessential geometry.
- CTA names and targets match the task contract, and decorative visuals remain absent from the accessibility tree.
- Scope stayed within the Task 4 component set and report.

## Concerns

- No automated real-GPU WebGL or visual-regression run was available; browser-level appearance across the full 375–3840px range should still receive final visual QA during page assembly.
- The hero components are intentionally not mounted in `src/app/page.tsx`, which was outside the task brief's file scope.

## Review Follow-up: Viewport-Gated Frameloop

### Finding

The scene initially assumed visibility and used a `120px` observer margin, allowing an off-screen canvas to run with `frameloop="always"`.

### RED

Command:

`npm test -- src/components/hero/hero-scene.test.ts`

Result: exit 1; 1 file failed, 2/2 tests failed with `getSceneFrameloop is not a function`. The new tests specified that off-screen and reduced-motion states must return `"never"`.

### GREEN

Command:

`npm test -- src/components/hero/hero-scene.test.ts`

Result: exit 0; 1 file passed, 2/2 tests passed.

### Changes

- Added `hero-scene-state.ts` with a pure, directly tested frameloop decision.
- Initialized scene visibility to `false`.
- Removed the observer root margin so only actual viewport intersection enables continuous rendering.
- Kept reduced motion authoritative: it returns `"never"` even while intersecting.
- Added `hero-scene.test.ts` covering visible, off-screen, and reduced-motion decisions.

### Follow-up Verification

- Focused hero tests: exit 0; 2 files passed, 5/5 tests passed.
- Typecheck: exit 0; route generation and `tsc --noEmit` passed.
- Lint: exit 0; no ESLint errors.
- Editor diagnostics for the hero files: none.

### Follow-up Concerns

None. Browsers without `IntersectionObserver` now retain the CSS fallback and conservatively keep WebGL rendering paused.
