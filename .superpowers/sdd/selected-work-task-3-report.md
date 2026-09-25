# Selected Work Task 3 Report

## Status

Completed.

- Exported `getProjectPlacement(index, count)` from `projects.tsx`.
- Preserved the existing repeating 7/5, 5/7 editorial pair cycle.
- Centered only the final card for odd project counts.
- Passed `projects.length` into placement selection without changing project order or slug keys.
- Added exhaustive placement cases for 1, 2, 4, 5, 7, and 8 projects.
- Added a test-only seven-card browser fixture by cloning the rendered project cards after hydration; no production fixture route or query parameter was added.
- Verified six paired cards, one centered final card, and no horizontal overflow at 375px and 1440px.

## TDD Evidence

The focused unit test run was RED before implementation:

- 15 tests ran.
- The 1-, 5-, and 7-project cases failed because their final cards retained cycle placements instead of the centered placement.
- The 2-, 4-, and 8-project cases passed, confirming existing paired behavior.

After implementing the helper, the focused suite was GREEN with 15/15 tests passing.

## Verification

The complete required command chain exited 0:

```text
npm run lint       PASS
npm run typecheck  PASS
npm test           PASS (10 files, 82 tests)
npm run build      PASS
npm run test:e2e   PASS (27 tests)
```

The browser regression's focused run also passed at both required viewport widths.

## Concerns

- The first full E2E run exposed a race in the test-only DOM fixture when it mutated server-rendered markup before hydration. The fixture now waits for hydration before cloning cards; both the focused rerun and the subsequent full 27-test E2E run passed.
- Test output includes the existing `NO_COLOR`/`FORCE_COLOR` Playwright warning and a Vitest environment performance suggestion; neither is a test failure or product regression.
- The working directory is not a Git repository, so a Git diff/status summary was unavailable. No commit was created and no progress file was edited.

## Hydration Robustness Follow-up

Completed the Projects-specific hydration hardening without changing production code.

- `renderSevenProjectFixture` now explicitly polls for a React fiber key on either the `#work` client boundary or its first project list item before cloning or mutating project nodes.
- The existing header/marquee hydration wait is no longer the fixture's only hydration evidence.
- Added an isolated browser contract test that marks only the header and marquee as hydrated, verifies the fixture remains untouched, then marks the first project node as hydrated and verifies the fixture proceeds.

TDD evidence:

- RED: the new contract test failed under the old strategy because the fixture resolved and expanded the list before the Projects node received hydration evidence.
- GREEN: the focused browser suite passed all 3 tests, covering the hydration contract plus seven-card layout and overflow at 375px and 1440px.

Follow-up verification:

```text
npm run test:e2e -- --grep "seven-card fixture|seven project cards"
  PASS (3 tests)
npm run typecheck
  PASS
npm run lint
  PASS
```

The focused Playwright run still emits the existing `NO_COLOR`/`FORCE_COLOR` warning; it does not affect test results.

## Final Selected-Work Extension Fixes

Status: completed.

- Restricted `ProjectImage.src` at compile time to `` `/${string}` `` and added a runtime local-path guard that rejects remote and protocol-relative sources.
- Kept unapproved runtime image values on the existing generated-artwork fallback path, including its prior `aria-hidden` behavior.
- Kept images inside the zooming `project-artwork-layer` while moving overlay content to a stationary sibling inside the clipped frame.
- Strengthened the overlay to `from-black/95 via-black/80` and raised small eyebrow text to `text-white/90`; the focused regression asserts the contrast classes and stationary DOM relationship.
- Changed responsive image sizing to the conservative `(min-width: 1024px) 67vw, 100vw` so full-width tablet cards and centered eight-column cards are not under-fetched.
- Updated the selected-work implementation plan and portfolio design specification to allow only local public image paths and document the stationary, AA-oriented overlay.
- Added no production image fixture, route, or fabricated image data.

Regression-first evidence:

- RED: the initial focused run had 4 expected failures and 16 passes. The missing local-path guard caused both data tests to fail, the remote runtime fixture still rendered an image, and the responsive-size assertion observed the old values.
- GREEN: the final focused run passed 20/20 tests across 2 files.

Final verification:

```text
npm test -- src/data/projects.test.ts src/components/projects/projects.test.tsx
  PASS (2 files, 20 tests)
npm run typecheck
  PASS
npm run lint
  PASS
IDE diagnostics for edited TypeScript files
  No errors
```

Concerns:

- The readability regression is intentionally focused on the enforced gradient and text-opacity contract; it does not perform pixel-level contrast sampling against arbitrary source images.
- The first standalone typecheck exposed widened string types in two test fixtures after the stricter source type was introduced. Marking those fixtures with `satisfies Project` restored compile-time validation, and the final required command chain passed.
- No commit was created and no progress file was edited.
