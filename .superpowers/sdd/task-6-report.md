# Task 6 Report: Selected-work grid and project cards

## Status

Implemented the typed `Projects` section and reusable `ProjectCard` within the Task 6 file scope. The section uses an ordered, mobile-first composition that becomes an asymmetric 7/5 and 5/7 grid through a `48rem` container query. Individual cards also use a named container query to adapt metadata and copy to their allocated width.

## TDD evidence

### RED

Command:

```text
npm test -- src/components/projects/projects.test.tsx
```

Observed expected failure before production files existed:

```text
FAIL src/components/projects/projects.test.tsx
Error: Failed to resolve import "./projects"
Test Files 1 failed (1)
```

The failure was caused by the missing Task 6 component, matching the brief.

### GREEN

Command:

```text
npm test -- src/components/projects/projects.test.tsx
```

Final result:

```text
Test Files 1 passed (1)
Tests 3 passed (3)
```

Focused coverage verifies:

- the “Selected work” heading and configured live/source actions;
- all `orb`, `type`, `reveal`, and `dragon` visual variants;
- `_blank` plus `rel="noreferrer noopener"` on external actions.

## Implementation notes

- Added `src/components/projects/projects.tsx`.
- Added `src/components/projects/project-card.tsx`.
- Added `src/components/projects/projects.test.tsx`.
- Generated all artwork with CSS only; no image or network dependency was introduced.
- Kept decorative artwork within graphite and warm-white tones.
- Reserved acid lime for the shared `MagneticLink` hover/focus treatment.
- Rendered HTTPS project actions conditionally and kept both actions permanently present rather than hover-revealed.
- Reused `Reveal` for card entrances and `MagneticLink` for accessible, touch-sized actions.
- Limited visual scaling to hover-capable pointers and disabled its transition under reduced motion.
- Used `min-w-0`, clipped artwork, fluid sizing, and mobile-first grid defaults to guard against horizontal overflow.

## Verification

- Focused tests: PASS — 3/3.
- Typecheck: PASS — `next typegen && tsc --noEmit`.
- Lint: PASS — `eslint .`.
- Production build: PASS — Next.js optimized build and static generation completed.
- Editor diagnostics for all three Task 6 files: none.

## Self-review

- Requirements were rechecked against the brief and design constraints.
- The four artwork branches are exhaustive for the typed `ProjectVisual` union.
- Cards retain semantic article headings, ordered-list placement, visible keyboard focus, and 44px minimum link targets.
- URLs are normalized and accepted only when they use HTTPS; configured source-host validity remains enforced by the existing project-data test.
- No page integration, unrelated cleanup, dependencies, `progress.md`, or commits were added because they are outside Task 6.
- No known Task 6 concerns remain.

## Review follow-up: empty state and URL filtering

### RED

Added focused tests requiring an empty project collection to render no section and requiring invalid/non-HTTPS project URLs to render no links.

Command:

```text
npm test -- src/components/projects/projects.test.tsx
```

Observed before the empty-state guard:

```text
FAIL renders nothing when there are no projects
Expected container to be empty, but received the titled section and empty list.
Test Files 1 failed (1)
Tests 1 failed | 4 passed (5)
```

The invalid/non-HTTPS URL test passed during RED, confirming the existing HTTPS filter already met that requirement without changing valid-link behavior.

### GREEN

Added the minimal `projects.length === 0` early return to `Projects`.

Final focused result:

```text
Test Files 1 passed (1)
Tests 5 passed (5)
```

Follow-up verification:

- Typecheck: PASS — `next typegen && tsc --noEmit`.
- Lint: PASS — `eslint .`.
- Editor diagnostics for the changed component and test: none.
- No commits or `progress.md` edits were made.
