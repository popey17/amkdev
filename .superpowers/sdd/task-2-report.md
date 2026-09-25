# Task 2 Report: Typed site and project content

## Status

DONE

## Implementation summary

- Added `src/data/projects.test.ts` and confirmed the expected RED failure before implementation.
- Added `src/data/projects.ts` with the `Project` type and four verified projects using the exact copy and URLs from the brief.
- Added `src/data/site.ts` with typed `contact`, `navigation`, `skills`, and verified `socials` exports for later sections.
- Confirmed GREEN on the data-integrity test and a clean `npm run typecheck`.
- No UI components or later-task work were added.

## TDD evidence

### RED

Created `src/data/projects.test.ts` before `src/data/projects.ts`, then ran:

```bash
npm test -- src/data/projects.test.ts
```

Result: expected FAIL, exit code 1.

Evidence:

```text
FAIL  src/data/projects.test.ts [ src/data/projects.test.ts ]
Error: Failed to resolve import "./projects" from "src/data/projects.test.ts". Does the file exist?
Test Files  1 failed (1)
Tests  no tests
```

The failure was caused by the deliberately missing production module, matching the brief.

### GREEN

After adding `src/data/projects.ts` and `src/data/site.ts`, ran:

```bash
npm test -- src/data/projects.test.ts
```

Result: PASS, exit code 0.

Evidence:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
Duration    994ms
```

Then ran:

```bash
npm run typecheck
```

Result: PASS, exit code 0.

Evidence:

```text
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully
```

## Final verification

Ran:

```bash
npm test -- src/app/design-tokens.test.ts
```

Result: PASS, exit code 0.

```text
Test Files  1 passed (1)
Tests       6 passed (6)
```

## Files changed

- `src/data/projects.test.ts` (created)
- `src/data/projects.ts` (created)
- `src/data/site.ts` (created)
- `.superpowers/sdd/task-2-report.md` (created)

## Self-review

- Confirmed the test file matches the brief exactly.
- Confirmed all four projects use the brief's exact titles, summaries, years, tags, URLs, visuals, and `featured: true`.
- Confirmed `Project` exposes `slug`, `title`, `summary`, `year`, `tags`, `liveUrl`, `sourceUrl`, `visual`, and `featured`.
- Confirmed `projects` is exported as `readonly Project[]` via `as const satisfies`.
- Confirmed verified socials use LinkedIn `https://www.linkedin.com/in/leo17/` and GitHub `https://github.com/popey17`.
- Confirmed `skills` align with the design spec technology rail (HTML5 through Cloud Services).
- Confirmed `navigation` targets `#about`, `#work`, and `#contact` per the page-composition plan.
- Confirmed modules are static, server-safe, and contain no browser APIs.
- Confirmed no components, page wiring, or UI were added.
- Confirmed no Git commit was created.

## Concerns

1. `site.ts` contact copy (`name`, `tagline`, `location`, `availability`, `timezone`) was inferred from the prior portfolio data and design spec because the Task 2 brief only specified social URLs explicitly. Later tasks should confirm or adjust this copy.
2. Navigation labels and section anchors were inferred from the implementation plan (`#about`, `#work`, `#contact`) rather than spelled out in the brief.
3. `site.ts` has no dedicated test in this task; only project data integrity is covered. Later header/contact tasks will exercise the site exports indirectly.
