# Final Fix Report — Portfolio Renewal

Status: **DONE** — all Critical (1), Important (2–7), and small fixes (8–13) implemented with regression-first tests.
No commits were made; `.superpowers/sdd/progress.md` was not edited. Lighthouse was not retried (known `ECONNRESET`).

Raw logs and screenshots: `.superpowers/sdd/final-fix-evidence/`.

## Files changed

New:
- `src/lib/use-media-query.ts` — hydration-safe `useMediaQuery` / `usePrefersReducedMotion` (`useSyncExternalStore`, server + hydrating snapshot = `false`).
- `src/lib/theme.ts` — theme storage key, `readTheme`, `applyTheme`, `subscribeToTheme`.
- `src/components/ui/reveal.test.tsx`
- `e2e/final-review.spec.ts`

Modified:
- `src/app/globals.css` — `@theme inline` maps `ink-muted`, `surface-raised`, `line`, `accent-ink`, `on-accent`; `:root[data-theme="light"]` parchment theme; reveal CSS gated by `prefers-reduced-motion: no-preference`; transform-only `hero-rise` and decorative `hero-orb-in`.
- `src/app/layout.tsx` — new metadata; pre-paint inline theme script; `suppressHydrationWarning` on `<html>` (only for the `data-theme` attribute the script sets).
- `src/components/ui/reveal.tsx` — rewritten (no Motion inline styles).
- `src/components/ui/magnetic-link.tsx` — accepts `ref`; accent-ink hover/focus.
- `src/components/hero/hero.tsx` — no `Reveal` above the fold; `hero-rise` stagger; on-accent CTA.
- `src/components/hero/hero-scene-state.ts` — `sceneCamera`, `orbGeometry`, `getOrbFrameFill`, `getSceneQuality`.
- `src/components/hero/hero-scene.tsx` — uses geometry constants and quality tier.
- `src/components/hero/pointer-companion.tsx` — `bg-surface-raised`, `border-ink/25`, test id for the eye.
- `src/components/about/tech-marquee.tsx` — hydration-safe reduced motion, 4× repeated lanes, no seam spacer, 180s duration (keeps the previous speed with 4× distance).
- `src/components/layout/site-header.tsx` — theme toggle, condensing, desktop-crossing close, scrollable drawer.
- `src/components/projects/project-card.tsx` — inner scaled artwork layer.
- `src/components/contact/local-time.tsx`, `src/lib/time.ts` — minute alignment, `dateTime`.
- `src/components/contact/contact.tsx`, `src/components/about/about.tsx`, `src/components/projects/projects.tsx` — `white/*` chrome rules → `ink/*`, `accent` text/ring → `accent-ink` (so both themes keep contrast).
- Tests: `src/app/design-tokens.test.ts`, `src/components/about/tech-marquee.test.tsx` (switched from mocking Motion to stubbing `matchMedia`), `src/components/contact/contact.test.tsx`, `src/components/hero/hero-scene.test.ts`, `src/components/hero/hero.test.tsx`, `src/components/layout/site-header.test.tsx`, `src/components/projects/projects.test.tsx`, `src/lib/time.test.ts`, `e2e/portfolio.spec.ts` (theme button renamed from “Use lime accent” to “Light theme”).

## Findings → fix → test

| # | Fix | Regression tests |
|---|-----|------------------|
| 1 Reveal hydration | `Reveal` always server-renders `data-reveal="static"` with no inline style. After mount, only if motion is allowed **and** the element is still below the fold does it switch to `pending` (hidden by CSS only inside `@media (prefers-reduced-motion: no-preference)`), then `revealed` on intersection. | Unit `reveal.test.tsx` (SSR has no `opacity`, reduced motion never pending, in-view stays static, below-fold pending→revealed with `--reveal-delay`); token test asserts `[data-reveal="pending"]` exists only inside the no-preference block. E2E: reduced motion → product of ancestor computed opacities is exactly 1 for the h1, hero CTA, About h2, first project h3, and contact h2; the same targets are 1 with JavaScript disabled; with no preference, the below-fold project starts < 1 and reaches 1 after scrolling. |
| 2 Tokens | Mapped `--color-ink-muted`, `--color-surface-raised`, `--color-line` (plus `accent-ink`, `on-accent`). `surface-raised` is now used by the eye, and `line` by the header border. | Token unit test; E2E computed colors: muted h1 line `rgb(167, 170, 161)`, eye `rgb(18, 20, 18)`, header border `rgba(243, 241, 232, 0.14)`. |
| 3 Drawer scroll | Dialog `overflow-y-auto overscroll-contain`; inner `min-h-full`; nav padding `min(2.5rem,6vh)`; links `clamp(2rem,min(11vw,14vh),5rem)`. | E2E 812×375: computed `overflow-y:auto` and `overscroll-behavior-y:contain`; after a wheel over the dialog, the GitHub link's box is fully inside 0–375; body `overflow:hidden`; `window.scrollY` unchanged. |
| 4 Marquee width | Each lane repeats the skills 4× (keys `${rep}-${skill}`); `pr-[gap]` replaces the spacer so the seam equals the item gap; two identical lanes loop at exactly `-50%`; one `sr-only` semantic list is kept. | Unit: 2 lanes, 4× items, identical `innerHTML`, no spacer, one accessible list. E2E at 1440/2560/3840: each lane ≥ rail width and ≥ viewport−1; the two lanes are equal (<0.5px); track = 2×lane (<0.5px); seam gap = internal gap (<0.5px). |
| 5 Marquee RM hydration | `usePrefersReducedMotion()` via `useSyncExternalStore` (server/hydration snapshot `false`, then live, and subscribes to changes). CSS `@media (reduce) { animation: none }` stops motion before hydration. | Unit: `renderToString` gives the neutral label, `hydrateRoot` produces no recoverable/hydration errors, then the control is disabled with “Technology animation disabled by reduced motion”; also reacts to a live preference change. E2E: disabled plus accurate name after hydration; `animation-name: none`. |
| 6 Hero LCP | The hero h1, eyebrow, copy, and CTAs are no longer wrapped in `Reveal`; the entrance is `hero-rise` (a `translate` keyframe only, no opacity; gated by no-preference); the orb has a decorative `hero-orb-in`. | Unit: SSR h1/CTA ancestor chain has no `opacity` style or `pending`. E2E: h1 effective opacity 1 at `domcontentloaded` and after hydration, with `animation-name` ≠ none; also 1 with JavaScript disabled. |
| 7 Orb crop | `scale 2.25→1.6`, camera `z 6→7`. `getOrbFrameFill` computes the projected silhouette of the maximum displaced radius `scale·(1+distort²)` (verified against drei's shader `position * (noise * pow(distort, 2.0) + radius)`). | Unit: the old config's fill is > 1 (clips); the current config's fill is between 0.6 and 0.9 at aspect ratios 1, 1.25, and 2. The screenshot `dark-hero.png` shows the orb uncropped. |
| 8 Clock | The first tick is scheduled with `setTimeout(msUntilNextMinute)`, then `setInterval(60s)`; both are cleared on unmount; `dateTime="YYYY-MM-DDTHH:mm+07:00"`. | Unit: at 12:00:45Z it flips at +15s and then every 60s; `datetime` crosses the UTC date boundary (`2026-09-25T03:30+07:00`); `vi.getTimerCount()` goes 1→0 on unmount both before and after the interval starts; `msUntilNextMinute` values. |
| 9 Theme | “Light theme” toggle (`aria-pressed`, `title` describes the action) switches between graphite and parchment, stores the choice in `localStorage["portfolio-theme"]`, and a pre-paint script applies it. Button state comes from `useSyncExternalStore` (server `dark`) so it stays hydration-safe. Acid lime `#c6ff32` stays the fill accent in both themes; text and focus use `--accent-ink` (a deep lime `#4a6800` on parchment) for AA contrast. | Unit: toggle/store/pressed in both directions; reflects a pre-hydration `data-theme`. E2E: background changes (luminance > 0.7), persists across reload with `aria-pressed=true` after hydration, no hydration console errors, AA ≥ 4.5 for h1, muted text, eyebrow, and CTA, and the CTA background is still `rgb(198, 255, 50)`. |
| 10 Header | An IntersectionObserver on `#top` (rootMargin −80px) sets `data-condensed`; header `min-h-20→min-h-14`. While the drawer is open, a `(min-width: 64rem)` change closes it and focuses the visible home link (`preventScroll`); body scroll is restored by effect cleanup. | Unit: condensed toggles with intersection; crossing to desktop closes the drawer, the trigger is not focused, the home link is focused, and overflow is restored. E2E: height shrinks by more than 8px after scrolling and restores at the top; 375→1280 closes the dialog, focus lands on a visible element that is not “Open menu”, and body overflow is empty. |
| 11 Scene quality | `getSceneQuality`: coarse pointer or `max-width: 40rem` → `dpr [1,1.25]`, detail 3; otherwise `[1,1.5]`, detail 5. Wired through `useMediaQuery`. | Unit: the reduced tier is lower on both axes; DPR within [1, 1.5] for all 4 combinations. |
| 12 Artwork | The frame keeps `overflow-clip` and its border and has no transform; the inner `project-artwork-layer` scales to 1.04 on hover (`hover:hover` only; transitions disabled under reduced motion). | Unit: frame has no `scale-*`, layer is a direct child with the hover scale and `motion-reduce`. E2E: on hover the layer scale is > 1.03 while the frame's bounding box is unchanged and its scale is 1. |
| 13 Metadata | Title `Aung Myat Kyaw — Front-end & Full-stack Developer`; a 121-character description. | E2E title plus description (≤160 characters, names the developer and role). |

## RED evidence (before implementation)

The only production change made before RED was a behavior-neutral extraction of the existing scene constants (`scale 2.25`, `z 6`, `distort 0.42`) so the invariant ran against the real values.

`npx vitest run` → exit 1, **Test Files 9 failed | 1 passed (10); Tests 28 failed | 43 passed (71)** (`unit-red.txt`). Representative failures:
- `reveal/hero`: `expected 'opacity:0;transform:translateY(24px)' not to match /opacity/`
- orb: `expected 1.4276186427841069 to be less than or equal to 0.9`
- marquee hydration: `expect(element).toBeDisabled()` failed after `hydrateRoot`; the reduced-motion button was not found
- tokens: `--color-ink-muted`/`--color-surface-raised`/`--color-line` missing; no light theme; no gated reveal
- clock: `19:01 GMT+7` not shown at the next boundary; `datetime` missing; `msUntilNextMinute` undefined
- header: no “Light theme” button, no `data-condensed`, drawer still open after crossing to desktop
- project: `project-artwork-layer` not found; `getSceneQuality` undefined

`npx playwright test` → exit 1, **15 failed, 9 passed (1.0m)** (`e2e-red.txt`):
- reduced motion / no-JS / first paint: `heroHeading` effective opacity **Received: 0**
- muted color **Received `rgb(243, 241, 232)`** (ink, because the utility was not generated)
- drawer `overflow-y` **Received `visible`**
- marquee lane width at 1440: **1178.3 < 1285.9**; at 2560 and 3840: **1250.2 < 2364**
- reduced-motion marquee control: element with the disabled label not found after hydration
- theme button not found; `data-condensed` absent; dialog **still visible** after resizing to 1280; title **"Portfolio"**; artwork layer predicate timeout
- `portfolio.spec` drawer trap failed only because it now targets the renamed theme button

## GREEN evidence

- First E2E iteration (`e2e-green-iter1.txt`): 23 passed, 1 failed — the artwork test read `transform`, but Tailwind v4 `scale-*` uses the standalone CSS `scale` property (Received: 1). I corrected the test to multiply `scale` × `transform` (the product was unchanged). Re-run: 1 passed.
- Unit GREEN: 71/71.

## Final full verification (`final-*.txt`)

| Command | Result |
|---|---|
| `npm run lint` | exit 0, no warnings |
| `npm run typecheck` | exit 0 (`next typegen && tsc --noEmit`) |
| `npm test` | exit 0 — Test Files 10 passed (10), Tests 71 passed (71) |
| `npm run build` | exit 0 — compiled successfully, `/` prerendered static |
| `npm run test:e2e` | exit 0 — **24 passed (20.7s)**: the 14 new final-review contracts plus all 10 existing contracts (landmark order, no overflow at 375/768/1440/2560/3840, drawer keyboard trap and focus restore, reduced-motion marquee, WebGL fallback, native scrolling) |

Visual checks (SwiftShader WebGL, production build): `dark-hero.png` (orb fully inside the frame), `light-hero.png`, `light-work.png` (condensed header, dark artwork frames on parchment), `drawer-landscape.png` (812×375).

## Self-review

- Constraints: top-level `header`/`main`/`footer#contact` and anchors are unchanged; no horizontal overflow at any tested width; project and social link filtering and the optional email are untouched; the drawer focus trap and Escape/route restore still pass; there is still no programmatic scroll (the header uses IntersectionObserver, and the drawer uses native overflow scrolling); the WebGL fallback still passes; no dependencies were added.
- Hydration: the only server/client-divergent inputs (reduced motion, theme) are read through `useSyncExternalStore` with fixed server snapshots. `Reveal` changes state only in an effect. The remaining Motion `useReducedMotion` uses (magnetic link, eye, drawer, `ssr:false` scene) only affect post-interaction or client-only output, not SSR markup.
- Reveal no longer uses Motion. It is a CSS progressive enhancement, which the brief explicitly allows, and it fails open: without JavaScript, IntersectionObserver, or motion permission, content stays visible.
- The theme script is a tiny synchronous inline `<head>` script wrapped in try/catch so storage errors can't block render. `suppressHydrationWarning` is scoped to `<html>` only.
- The light theme converts chrome rules from `white/*` to `ink/*` (visually identical in dark mode, since ink ≈ warm white). Project artwork frames stay dark in both themes on purpose.

## Unresolved concerns

- Lighthouse performance and accessibility scores (≥90) remain unverified because of the npm `ECONNRESET` errors; not retried, as instructed.
- Spec deviations to acknowledge: section entrances now use CSS transitions rather than Framer Motion. In the light theme, text, focus rings, and hover states use a deeper lime (`#4a6800`) for WCAG AA, while acid lime `#c6ff32` stays the fill accent (CTA, active toggle, pupil, selection).
- The theme preference is not synced live across open tabs (there is no `storage` event listener); it applies on the next load.
- The orb invariant is analytic (it assumes the square hero frame and simplex noise in [−1, 1]); there is no pixel-level screenshot assertion.
- The workspace is not a Git repository, so there is no diff-based audit trail beyond this report.

## Follow-up: header layout shift (final re-review, Minor)

**Issue:** The sticky header switched its in-flow height from `min-h-20` to `min-h-14` after the hero. That moved all page content by 24px (a layout shift).

**Fix (`src/components/layout/site-header.tsx`):**
- The outer `<header>` is now a fixed `h-20` with `pointer-events-none`, and its className never changes.
- The border, blur, and background moved to a new inner `data-testid="header-bar"` (`pointer-events-auto`). Only this bar condenses, `h-20 bg-surface/80` → `h-14 bg-surface/95`, with `transition-[height,background-color]` and `motion-reduce:transition-none`.
- The 24px strip the bar vacates is transparent, and clicks pass through it to the content underneath.
- The `data-condensed` semantics, IntersectionObserver trigger, drawer portal and focus trap, desktop-crossing close, and theme toggle are unchanged.

**Tests:**
- E2E `header condenses its inner bar after the hero without shifting layout` checks the following before and after condensing and after returning to the top:
  - outer header height, `#about.offsetTop`, and `#work.offsetTop` are `toEqual` in all three states;
  - the inner bar shrinks by more than 8px;
  - the home link stays inside the bar.
- E2E `condensed header keeps a constant height under reduced motion` checks that the outer height is identical and the bar's `transition-property` is `none`.
- Unit test (`site-header.test.tsx`, condense case): the outer header's className is identical in both states and has `h-20`; the bar goes `h-20`→`h-14` and has `motion-reduce:transition-none`.
- The semantic-color E2E now reads the border color from `header-bar`, since that is where the border lives now.

**RED** (`final-fix-evidence/header-shift-red.txt`): `npx playwright test e2e/final-review.spec.ts -g "header"` → exit 1, 2 failed.
- Reduced-motion test: **Expected 81, Received 57**. This is the 24px shift.
- Main test: timed out because `header-bar` did not exist yet.

Unit RED: `npx vitest run src/components/layout/site-header.test.tsx` → 1 failed | 10 passed (`header-bar` not found).

**GREEN:**
- `npx vitest run src/components/layout/site-header.test.tsx` → 11 passed.
- Focused E2E (`-g "header|drawer|mobile navigation|semantic color|theme|landmark|overflow"`) → exit 0, **13 passed** (`header-shift-green.txt`).
- Safety net: full `npx vitest run` → 71 passed (10 files); full `npx playwright test` → exit 0, **25 passed** (`header-shift-full-e2e.txt`).
- `npx eslint` on the changed files and `npm run lint` → exit 0, no output; `npm run typecheck` → exit 0.

**Concerns:**
- The outer header is now 80px, where it used to be 81px because the border was on the outer element. This is a one-time static 1px difference from before the fix, not a runtime shift.
- While condensed, scrolled content shows through the transparent 24px strip below the bar. This is intended.
