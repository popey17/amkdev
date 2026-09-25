# Task 8 report: Page composition and browser verification

## Status

Implementation and browser contracts, including the Task 8 review fixes, are complete. Lighthouse scoring remains an external unverified check after repeated npm registry `ECONNRESET` failures, so the brief's Lighthouse ≥90 acceptance criterion is not claimed.

## Implementation

- Kept `src/app/page.tsx` as a server component.
- Rendered `SiteHeader` before `<main>` as a top-level sibling, with `Hero`, `About`, `TechMarquee`, and `Projects` inside `<main>` in the specified order.
- Rendered `Contact` after `</main>`, exposing `<footer id="contact">` as a top-level `contentinfo` landmark.
- Passed `process.env.NEXT_PUBLIC_CONTACT_EMAIL` directly, with no default.
- Added a production Playwright server on stable `127.0.0.1:4173`.
- Added browser contracts for top-level landmark/section order, anchors, five overflow widths, mobile keyboard focus trapping/restoration, reduced motion, deterministic WebGL failure fallback, and native scrolling without programmatic scroll APIs.
- Excluded `e2e/**` from Vitest discovery so unit and browser runners remain isolated.
- Did not edit `progress.md`.

## TDD evidence

### RED

Command:

```bash
npx playwright test e2e/portfolio.spec.ts
```

Run against the original placeholder page:

- Exit: `1`
- Result: `4 failed, 5 passed`
- Expected missing-composition failures:
  - no site header/required landmark structure
  - no mobile navigation trigger
  - no reduced-motion marquee/fallback content
- The initial native-scrolling assertion also exposed an overly strict assumption that native CSS smooth scrolling must compute to `auto`; the contract was corrected to verify the browser document is the scrolling element, the body is not transform-driven, and wheel input changes `window.scrollY`.

### GREEN

Command:

```bash
npx playwright test e2e/portfolio.spec.ts
```

- Exit: `0`
- Result: `9 passed (11.2s)`

Final command:

```bash
npm run test:e2e
```

- Exit: `0`
- Result: `9 passed (12.2s)`

## Viewport results

- 375 × 900: PASS — zero horizontal overflow
- 768 × 900: PASS — zero horizontal overflow
- 1440 × 900: PASS — zero horizontal overflow
- 2560 × 900: PASS — zero horizontal overflow
- 3840 × 900: PASS — zero horizontal overflow

## Complete verification

```bash
npm run lint
```

- Exit `0`

```bash
npm run typecheck
```

- Exit `0`; Next route types generated and TypeScript passed.

```bash
npm test
```

- First run: exit `1` because Vitest discovered the new Playwright spec.
- After adding `e2e/**` to `vitest.config.ts` exclusions: exit `0`; `9` files and `45` tests passed.

```bash
npm run build
```

- Exit `0`; optimized production build compiled, typed, and prerendered `/`.

```bash
npx playwright install chromium
```

- First sandboxed attempt: exit `1`, CDN blocked by sandbox allowlist.
- Retried with full network access: exit `0`; Chromium, headless shell, and FFmpeg installed.

```bash
npm run test:e2e
```

- Exit `0`; all `9` Chromium tests passed against the production build/server.

IDE diagnostics for all changed TypeScript/TSX files: no errors.

## Browser/manual coverage

- Main composition and `top`, `about`, `work`, `contact` anchors: PASS
- Top-level `contentinfo` and no footer nested in main: PASS
- Mobile drawer initial focus, both-boundary focus wrap, Escape close, and trigger focus restoration: PASS
- Reduced-motion media query and stopped marquee animation: PASS
- Forced `webgl`/`webgl2` context rejection, usable hero content, visible CSS fallback, and removal of the failed hero canvas: PASS
- Native browser wheel scrolling with `documentElement` as the scrolling element, an untransformed body, and zero calls to guarded window/element programmatic scroll APIs: PASS
- External destinations, clipboard rejection handling, and Thailand clock behavior remain covered by the existing focused unit/component tests (`45` tests all passing).

## Concerns

Lighthouse could not be installed or executed:

```bash
CHROME_PATH=".../playwright/chromium-1243/chrome-linux64/chrome" npx --yes lighthouse@latest http://127.0.0.1:4173 --only-categories=performance,accessibility --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox" --quiet
```

- Exit `152`; npm registry download failed with `ECONNRESET` (latest Lighthouse also requires Node `>=22.19`, while this environment is Node `22.14.0`).

Compatible-version retry:

```bash
CHROME_PATH=".../playwright/chromium-1243/chrome-linux64/chrome" npx --yes lighthouse@12 http://127.0.0.1:4173 --only-categories=performance,accessibility --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox" --quiet
```

- Exit `152`; npm registry download again failed with `ECONNRESET`.
- Therefore performance/accessibility scores of 90 or higher are unverified.
- The workspace is not a Git repository, so Git-based change auditing was unavailable.

## Task 8 review fixes

### RED

The strengthened browser contracts were written before moving the header:

```bash
npx playwright test e2e/portfolio.spec.ts
```

- Exit `1`; `1 failed, 9 passed (16.3s)`.
- Expected failure: the top-level landmark locator found only `<main>` and `<footer id="contact">`; `body > header` was absent because `SiteHeader` was still nested in `<main>`.
- The deterministic WebGL-unavailable contract and guarded native-wheel-scroll contract both passed against the existing behavior, confirming those review findings required stronger verification rather than production changes.
- An earlier attempt exited before tests because the new browser instrumentation had one TypeScript `this` annotation error; that test-code error was corrected before capturing the behavioral RED above.

### GREEN

After moving `SiteHeader` before `<main>`:

```bash
npx playwright test e2e/portfolio.spec.ts
```

- Exit `0`; `10 passed (12.7s)`.
- Verified top-level order: `body > header`, `body > main`, then `body > footer#contact`.
- Verified forced `webgl`/`webgl2` context failures were attempted, the hero heading and work link stayed usable, the CSS orb fallback stayed visible, and no hero canvas survived.
- Verified physical wheel input changed `window.scrollY` while guarded `window.scroll`, `window.scrollTo`, `window.scrollBy`, `Element.scroll`, `Element.scrollTo`, `Element.scrollBy`, and `Element.scrollIntoView` recorded no calls.

Relevant static checks:

```bash
npx eslint src/app/page.tsx e2e/portfolio.spec.ts playwright.config.ts vitest.config.ts
npm run typecheck
```

- Both exited `0`.
- Lighthouse was not retried; it remains an external, unverified check after the previously documented network failures.
