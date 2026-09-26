# Developer Positioning Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition all user-facing portfolio copy and metadata so Aung Myat Kyaw reads as a Developer generally, with no Front-end or Full-stack role titles on the shipped site.

**Architecture:** Copy-only changes in existing React components and `Metadata` / site data modules. Remove the hero’s second muted role line and keep a single H1 with the existing parallax on that one line. Update colocated unit tests and Playwright assertions that hard-code the old wording. No new sections, visual system changes, or project/tech-marquee rewrites.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-26-developer-positioning-copy-design.md`

## Global Constraints

- Never expose user-facing “Front-end Developer”, “Full-stack Developer”, or equivalent role titles (any capitalization/spacing).
- Prefer “Developer”, “digital products”, “digital experiences”, “interactive experiences”.
- About bio must not mention Bangkok/location; Contact “Based in” and logo `Developer / Bangkok` stay.
- Hero: single H1 only — remove the second muted role line completely; minimum layout/CSS tweak only if empty space feels wrong; no redesign or new visual elements.
- Do not change project blurbs, tech marquee, Contact CTAs, or unrelated styling.
- Do not create git commits unless the user explicitly asks.
- Historical docs under `docs/` and `.superpowers/` may keep old wording; runtime `src/` and `e2e/` must not.

## Planned File Structure

- Modify: `src/components/hero/hero.tsx` — single H1 + new supporting copy; drop second role line / unused `lineTwoX`.
- Modify: `src/components/hero/hero.test.tsx` — assert new H1 and supporting copy.
- Modify: `src/components/about/about.tsx` — personality H2, bio, Focus, Approach.
- Create: `src/components/about/about.test.tsx` — About copy assertions.
- Modify: `src/data/site.ts` — tagline `Developer`.
- Modify: `src/app/layout.tsx` — title + description (and any OG/Twitter fields if added; currently title/description only).
- Modify: `e2e/final-review.spec.ts` — muted-color probe, metadata title/description.

---

### Task 1: Inventory + failing hero/e2e expectations

**Files:**
- Modify: `src/components/hero/hero.test.tsx`
- Modify: `e2e/final-review.spec.ts`
- Test: `src/components/hero/hero.test.tsx`
- Note: inventory is a search step; no new inventory file.

**Interfaces:**
- Consumes: existing `Hero` heading level 1 and hero supporting paragraph classes.
- Produces: updated test expectations for H1 `I build digital experiences.`, supporting copy, muted-color probe on supporting paragraph text, metadata title `Aung Myat Kyaw — Developer`, description matching `/developer/i` and not `/front-end|full-stack/i`.

- [ ] **Step 1: Search the codebase for role-title variants**

Run:

```bash
rg -n -i 'front[- ]?end|full[- ]?stack' --glob '!node_modules/**' --glob '!.next/**' src e2e public package.json next.config.ts
```

Expected hits to treat as in-scope (at least):

- `src/components/hero/hero.tsx` — H1 lines + supporting “full-stack engineering”
- `src/components/about/about.tsx` — bio
- `src/data/site.ts` — tagline
- `src/app/layout.tsx` — title + description
- `src/components/hero/hero.test.tsx`
- `e2e/final-review.spec.ts`

Also confirm absence of Open Graph / Twitter / structured metadata / robots / sitemap / manifest files that still name those roles:

```bash
rg -n -i 'openGraph|twitter|jsonLd|application/ld\+json' src
ls public 2>/dev/null; ls src/app | rg -i 'robots|sitemap|manifest' || true
```

Expected: `layout.tsx` exports only `title` and `description` today (no separate OG/Twitter objects). No robots/sitemap/manifest with role titles. If any SEO surface is found with old roles, add it to Task 4.

Record the hit list in the task notes; do not edit historical docs under `docs/` or `.superpowers/` for this inventory.

- [ ] **Step 2: Update hero unit test to expect the new H1**

In `src/components/hero/hero.test.tsx`, change the role assertion:

```tsx
it("states the positioning headline and exposes primary actions", () => {
  render(<Hero />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    /i build digital experiences\.?/i,
  );
  expect(
    screen.getByText(
      /i create thoughtful, reliable digital experiences where design, interaction, and technology work together/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /view selected work/i }),
  ).toHaveAttribute("href", "#work");
  expect(
    screen.getByRole("link", { name: /let's work together/i }),
  ).toHaveAttribute("href", "#contact");
});
```

- [ ] **Step 3: Run hero unit test — expect FAIL**

Run: `npm test -- src/components/hero/hero.test.tsx`

Expected: FAIL — heading still matches old front-end/full-stack copy (or new regex does not match).

- [ ] **Step 4: Point e2e muted-color and metadata tests at new copy**

In `e2e/final-review.spec.ts`, replace the muted probe that targets the removed second H1 line:

```ts
const muted = page.getByText(
  "I create thoughtful, reliable digital experiences where design, interaction, and technology work together.",
  { exact: true },
);
await expect(muted).toHaveCSS("color", "rgb(167, 170, 161)");
```

Update metadata test:

```ts
test("metadata names the developer and role", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Aung Myat Kyaw — Developer");
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  expect(description).toMatch(/Aung Myat Kyaw/);
  expect(description).toMatch(/developer/i);
  expect(description).not.toMatch(/front-end|full-stack/i);
  expect(description!.length).toBeLessThanOrEqual(160);
});
```

Leave other assertions in that file unchanged (including pointer-companion checks — out of scope unless they block verification; do not “fix” unrelated hero visuals in this plan).

- [ ] **Step 5: Stop — do not implement hero yet**

Task 1 ends with failing/red expectations. Implementation is Task 2.

---

### Task 2: Hero single-headline copy

**Files:**
- Modify: `src/components/hero/hero.tsx`
- Test: `src/components/hero/hero.test.tsx`

**Interfaces:**
- Consumes: existing `useScrollRange` / `lineOneX` parallax; CTAs unchanged.
- Produces: single H1 text `I build digital experiences.`; supporting paragraph exact string from the spec; no second muted role `motion.span`.

- [ ] **Step 1: Replace H1 and supporting copy; remove second role line**

In `src/components/hero/hero.tsx`:

1. Remove `lineTwoX` (and its `useScrollRange` call).
2. Replace the two-span H1 with one motion span still using `lineOneX`:

```tsx
<h1 className="hero-rise max-w-[10ch] text-[length:var(--text-display)] font-semibold leading-[0.82] tracking-[-0.075em] text-ink [animation-delay:80ms]">
  <motion.span className="block" style={{ x: lineOneX }}>
    I build digital experiences.
  </motion.span>
</h1>
```

3. Replace the supporting `<p>` body with:

```tsx
I create thoughtful, reliable digital experiences where design,
interaction, and technology work together.
```

4. Keep eyebrow, CTAs, grid, orb/scene, and motion springs unchanged.
5. If `max-w-[10ch]` clips the new headline awkwardly, make the **minimum** adjustment only (e.g. widen `max-w` slightly or allow a natural soft wrap). Do not redesign spacing, colors, or add elements. Prefer keeping current classes if the line already wraps acceptably.

- [ ] **Step 2: Run hero unit tests — expect PASS**

Run: `npm test -- src/components/hero/hero.test.tsx`

Expected: PASS for the positioning/actions test and existing SSR/fallback tests. If `pointer-companion` assertions fail because the companion is commented out in JSX, do **not** re-enable it in this task; only note it — companion is out of scope for copy work. (If the unit file still queries `pointer-companion` and fails for that reason, leave those tests as pre-existing; this task’s copy assertion must pass.)

- [ ] **Step 3: Spot-check rendered hero (optional local)**

Run: `npm run dev` and open `/` — confirm one H1, no “Front-end”/“Full-stack” lines, supporting sentence present, composition still balanced.

---

### Task 3: About section copy

**Files:**
- Create: `src/components/about/about.test.tsx`
- Modify: `src/components/about/about.tsx`
- Test: `src/components/about/about.test.tsx`

**Interfaces:**
- Consumes: existing `About`, `SplitText`, Focus/Approach grid.
- Produces: H2 `I like building things that feel good to use.`; bio without location; Focus/Approach strings from the spec.

- [ ] **Step 1: Write failing About unit test**

Create `src/components/about/about.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }) as MediaQueryList,
  );
});

afterAll(() => vi.unstubAllGlobals());

import { About } from "./about";

it("positions the developer without front-end or full-stack role titles", () => {
  render(<About />);

  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    /i like building things that feel good to use\.?/i,
  );
  expect(
    screen.getByText(
      /i'm aung myat kyaw, a developer\. i build digital products and interactive experiences/i,
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/bangkok/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/front-end|full-stack/i)).not.toBeInTheDocument();
  expect(
    screen.getByText(
      /digital products, interactive experiences, and experiments that stay simple to use/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /turn ideas into things that feel clear, useful, and enjoyable/i,
    ),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run About test — expect FAIL**

Run: `npm test -- src/components/about/about.test.tsx`

Expected: FAIL — old H2/bio still present.

- [ ] **Step 3: Update About copy**

In `src/components/about/about.tsx`:

```tsx
<h2 className="max-w-[12ch] text-[length:var(--text-h2)] font-semibold leading-[0.92] tracking-[-0.06em] text-ink">
  <SplitText>I like building things that feel good to use.</SplitText>
</h2>
```

Bio:

```tsx
<p className="max-w-[38rem] text-[length:var(--text-body)] leading-relaxed text-ink-muted">
  I&apos;m Aung Myat Kyaw, a developer. I build digital products and
  interactive experiences, combining thoughtful design with technology to
  create things that are useful, engaging, and reliable.
</p>
```

Focus / Approach bodies:

```tsx
<p className="mt-2 text-[length:var(--text-body)] leading-relaxed text-ink">
  Digital products, interactive experiences, and experiments that stay
  simple to use.
</p>
```

```tsx
<p className="mt-2 text-[length:var(--text-body)] leading-relaxed text-ink">
  Turn ideas into things that feel clear, useful, and enjoyable — without
  losing reliability.
</p>
```

Keep section structure, Reveal, parallax, and labels (`About`, `Focus`, `Approach`) unchanged. If `max-w-[12ch]` on the longer H2 feels too narrow, only widen `max-w` as needed — no other layout redesign.

- [ ] **Step 4: Run About test — expect PASS**

Run: `npm test -- src/components/about/about.test.tsx`

Expected: PASS.

---

### Task 4: Tagline + document metadata

**Files:**
- Modify: `src/data/site.ts`
- Modify: `src/app/layout.tsx`
- Test: `e2e/final-review.spec.ts` (metadata case already updated in Task 1)

**Interfaces:**
- Consumes: Next.js `Metadata` export pattern in `layout.tsx`.
- Produces: `contact.tagline === "Developer"`; `metadata.title === "Aung Myat Kyaw — Developer"`; description exact string from the spec; no OG/Twitter fields that reintroduce old roles.

- [ ] **Step 1: Update site tagline**

In `src/data/site.ts`:

```ts
tagline: "Developer",
```

- [ ] **Step 2: Update root metadata**

In `src/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: "Aung Myat Kyaw — Developer",
  description:
    "Aung Myat Kyaw is a developer building thoughtful digital products and interactive experiences.",
};
```

Do **not** add Open Graph / Twitter objects unless the inventory found existing ones that need fixing. Next.js will derive default social title/description from these fields. If inventory found explicit `openGraph` / `twitter` with old roles, update those fields to the same title/description (or remove the outdated role strings).

- [ ] **Step 3: Confirm no other SEO files need edits**

Re-run:

```bash
rg -n -i 'front[- ]?end|full[- ]?stack' src e2e
```

Expected: no matches in `src/` or `e2e/` (tests included after earlier updates). Docs-only hits outside `src`/`e2e` are OK to leave.

---

### Task 5: Full verification

**Files:**
- None required unless a failure forces a fix in files already listed.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: green unit + e2e evidence; clean role-title search in runtime paths.

- [ ] **Step 1: Run relevant unit tests**

Run:

```bash
npm test -- src/components/hero/hero.test.tsx src/components/about/about.test.tsx
```

Expected: all PASS (aside from any pre-existing out-of-scope pointer-companion failures — if those fail, run with a filter that still proves copy tests pass, and note the pre-existing failure).

- [ ] **Step 2: Run e2e final-review suite**

Run:

```bash
npm run test:e2e -- e2e/final-review.spec.ts
```

Expected: metadata test PASS; muted-color test PASS against the new supporting sentence; other final-review tests unchanged in intent. If an unrelated pre-existing failure blocks the suite (e.g. commented-out pointer companion), fix only what this plan caused; do not expand into visual rewrites.

- [ ] **Step 3: Final role-title search**

Run:

```bash
rg -n -i 'front[- ]?end|full[- ]?stack' src e2e
```

Expected: zero matches.

- [ ] **Step 4: Manual render checks**

With `npm run dev`:

1. Hero shows **I build digital experiences.** only — no second muted role line.
2. Supporting sentence matches the spec.
3. About H2 + bio + Focus/Approach match the spec; no Bangkok in About.
4. Document title is `Aung Myat Kyaw — Developer`; meta description matches layout and does not mention front-end/full-stack.
5. Selected work, tech marquee, Contact CTAs, and styling look unchanged aside from About/Hero text.

- [ ] **Step 5: Done**

Do not commit unless the user asks.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Pre-change inventory + SEO surfaces | Task 1 Step 1, Task 4 Step 3 |
| Hero H1 + supporting copy; remove second muted line | Task 2 |
| Minimum hero layout tweak only if needed | Task 2 Step 1 |
| About H2, bio (no location), Focus, Approach | Task 3 |
| Tagline + title + description | Task 4 |
| Leave logo, Contact location, projects, marquee, CTAs | Global constraints; no tasks touch them |
| Update unit + e2e expectations | Tasks 1, 3 |
| Post-impl verification checklist | Task 5 |

No placeholders remain. Types/strings are consistent across tasks (`Developer`, exact hero/about sentences, metadata title/description).
