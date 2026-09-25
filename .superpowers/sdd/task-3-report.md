# Task 3 Report: Shared Motion Primitives and Header

## Status

Implemented the shared class utility, reduced-motion-aware reveal primitive, pointer-gated magnetic anchor, and responsive site header with a modal mobile drawer.

## RED evidence

The required drawer test was created before production code and failed because `SiteHeader` did not exist.

Command:

```text
npm test -- src/components/layout/site-header.test.tsx
```

Exact output:

```text
> portfolio2@1.0.0 test
> vitest run src/components/layout/site-header.test.tsx


 RUN  v5.0.1 /home/popey/Personal/Project/portfolio2

 ❯ src/components/layout/site-header.test.tsx (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/components/layout/site-header.test.tsx [ src/components/layout/site-header.test.tsx ]
Error: Failed to resolve import "./site-header" from "src/components/layout/site-header.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: /home/popey/Personal/Project/portfolio2/src/components/layout/site-header.test.tsx:4:27
  1  |  import { render, screen } from "@testing-library/react";
  2  |  import userEvent from "@testing-library/user-event";
  3  |  import { SiteHeader } from "./site-header";
     |                              ^
  4  |  var _jsxFileName = "/home/popey/Personal/Project/portfolio2/src/components/layout/site-header.test.tsx";
  5  |  import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/node.js:8736:39
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/node.js:8733:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/node.js:26423:18
 ❯ node_modules/vite/dist/node/chunks/node.js:26493:30
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/node.js:26459:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/node.js:8515:14
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/node.js:19998:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  19:40:54
   Duration  1.07s (environment 85%, setup 11%, transform 3%, worker 1%)
```

## GREEN evidence and final verification

Additional focused tests cover initial drawer focus and focus containment, close-on-route-selection, and body-scroll restoration after close and unmount.

Command:

```text
npm test -- src/components/layout/site-header.test.tsx && npm run typecheck && npm run lint
```

Exact output:

```text
> portfolio2@1.0.0 test
> vitest run src/components/layout/site-header.test.tsx


 RUN  v5.0.1 /home/popey/Personal/Project/portfolio2


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  19:44:32
   Duration  1.91s (environment 42%, tests 28%, import 19%, setup 5%, transform 5%, worker 1%)


> portfolio2@1.0.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> portfolio2@1.0.0 lint
> eslint .
```

IDE diagnostics also reported: `No linter errors found.`

## Files changed

- `src/lib/cn.ts` — shared `clsx` wrapper.
- `src/components/ui/reveal.tsx` — viewport reveal with one-time animation and reduced-motion handling.
- `src/components/ui/magnetic-link.tsx` — semantic animated anchor limited to fine, hover-capable pointers and disabled for reduced motion.
- `src/components/layout/site-header.tsx` — responsive header, data-driven navigation/social content, availability display, lime accent persistence, and accessible modal drawer.
- `src/components/layout/site-header.test.tsx` — four focused drawer behavior tests.
- `.superpowers/sdd/task-3-report.md` — this report.

## Self-review

- Reused `contact`, `navigation`, and `socials` from `src/data/site.ts`; no site content was duplicated.
- Interactive color treatment uses the existing acid-lime accent token.
- Anchors retain native `href` behavior.
- Reveal, magnetic motion, and drawer link animation respect reduced-motion preferences.
- Magnetic movement is enabled only for `(hover: hover) and (pointer: fine)`.
- Header buttons and links have visible focus treatment and minimum 44px touch targets.
- Drawer focuses its first route link, contains keyboard focus, closes on Escape or route selection, restores trigger focus, and restores prior body overflow on close or unmount.
- Accent storage is read only in a client effect, never during server render.
- No commit was created and `.superpowers/sdd/progress.md` was not edited.

## Concerns

No known implementation concerns. Visual viewport checks were not part of the requested automated verification and remain for later full-page integration.

## Review corrections

### Fix details

1. The drawer is now rendered into `document.body` with `createPortal` after the client mount snapshot is available. This removes it from the sticky, backdrop-blurred header's containing block while preserving `AnimatePresence`, focus management, and body-scroll cleanup.
2. The decorative availability indicator now uses `bg-ink-muted` and a matching `--ink-muted` glow instead of the interactive acid-lime accent.
3. `MagneticLink` now destructures consumer `style` and merges it with its internal `x` and `y` MotionValues. Consumer CSS and magnetic transforms therefore coexist.
4. The focus-trap test now checks the real boundaries inside the dialog: Shift+Tab from the first focusable control wraps to the final GitHub link, and Tab from that final link wraps to the first control. The existing first-route-link autofocus assertion remains.

### Review RED evidence

The portal, neutral-indicator, and merged-style regression tests were added before their production fixes. The strengthened focus-boundary test passed in the RED run because the trap implementation already wrapped the true boundaries; the correction there was to improve proof rather than change production behavior.

Command:

```text
npm test -- src/components/layout/site-header.test.tsx
```

Exact result:

```text
> portfolio2@1.0.0 test
> vitest run src/components/layout/site-header.test.tsx


 RUN  v5.0.1 /home/popey/Personal/Project/portfolio2

 ❯ src/components/layout/site-header.test.tsx (7 tests | 3 failed) 1597ms
   × portals the mobile drawer to the document body 54ms
   × keeps the non-interactive availability indicator neutral 12ms
   × preserves magnetic movement when consumer styles are supplied 1031ms

 FAIL  src/components/layout/site-header.test.tsx > portals the mobile drawer to the document body
AssertionError: expected <header …(1)>…(2)</header> to be <body style="overflow: hidden;">…(1)</body> // Object.is equality

 FAIL  src/components/layout/site-header.test.tsx > keeps the non-interactive availability indicator neutral
Error: expect(element).toHaveClass("bg-ink-muted")

Expected the element to have class:
  bg-ink-muted
Received:
  size-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]

 FAIL  src/components/layout/site-header.test.tsx > preserves magnetic movement when consumer styles are supplied
AssertionError: expected '' to contain 'translateX'

 Test Files  1 failed (1)
      Tests  3 failed | 4 passed (7)
   Start at  19:47:45
   Duration  3.06s (tests 55%, environment 27%, import 12%, setup 3%, transform 3%)
```

### Review GREEN evidence

Command:

```text
npm test -- src/components/layout/site-header.test.tsx && npm run typecheck && npm run lint
```

Exact output:

```text
> portfolio2@1.0.0 test
> vitest run src/components/layout/site-header.test.tsx


 RUN  v5.0.1 /home/popey/Personal/Project/portfolio2


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  19:48:40
   Duration  1.93s (environment 41%, tests 30%, import 18%, setup 5%, transform 5%, worker 1%)


> portfolio2@1.0.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> portfolio2@1.0.0 lint
> eslint .
```

No commit was created, and `.superpowers/sdd/progress.md` remains unedited.
