# Portfolio Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, award-site-inspired portfolio for Aung Myat Kyaw with fluid scaling, restrained 3D, accessible motion, responsive projects, and resilient contact interactions.

**Architecture:** Use Next.js App Router with server components for page composition and narrow client boundaries for motion, WebGL, navigation, clipboard, accent state, and local time. Keep content in typed data modules, expose design tokens through Tailwind v4 CSS-first configuration, and dynamically load the isolated React Three Fiber scene behind a CSS fallback.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS v4, Motion for React, Three.js, React Three Fiber, Drei, Vitest, Testing Library, and Playwright.

## Global Constraints

- Support viewport widths from 375px through 3840px without horizontal overflow.
- Use acid lime as the sole interactive accent over graphite and warm-white surfaces.
- Respect `prefers-reduced-motion` and preserve native scrolling.
- Dynamically load WebGL, cap device pixel ratio at 1.5, and retain a CSS orb fallback.
- Keep WCAG AA contrast, visible focus, semantic heading order, and 44px minimum touch targets.
- Render project and social links only when their verified URLs are configured.
- Do not create Git commits unless the user explicitly requests them.

## Planned File Structure

- `package.json`: scripts and dependencies.
- `postcss.config.mjs`: Tailwind PostCSS integration.
- `next.config.ts`: Next.js configuration.
- `vitest.config.ts`, `vitest.setup.ts`: component-test environment.
- `playwright.config.ts`: production-browser checks.
- `src/app/layout.tsx`: metadata, font variables, and root shell.
- `src/app/page.tsx`: server-rendered page composition.
- `src/app/globals.css`: Tailwind import, semantic tokens, fluid `clamp()` scale, and global effects.
- `src/data/projects.ts`: typed, verified project content.
- `src/data/site.ts`: navigation, social links, skills, and contact configuration.
- `src/components/layout/site-header.tsx`: desktop navigation and mobile drawer.
- `src/components/hero/hero.tsx`: hero copy, CTA, scroll cue, and scene shell.
- `src/components/hero/hero-scene.tsx`: isolated R3F scene.
- `src/components/hero/pointer-companion.tsx`: decorative eye character.
- `src/components/about/about.tsx`: editorial biography.
- `src/components/about/tech-marquee.tsx`: pauseable skill rail.
- `src/components/projects/projects.tsx`: selected-work composition.
- `src/components/projects/project-card.tsx`: reusable project card.
- `src/components/contact/contact.tsx`: clipboard and social CTA.
- `src/components/contact/local-time.tsx`: Thailand time.
- `src/components/ui/reveal.tsx`: reduced-motion-aware entrance primitive.
- `src/components/ui/magnetic-link.tsx`: pointer enhancement with touch fallback.
- `src/lib/cn.ts`: class-name composition helper.
- `src/lib/time.ts`: deterministic Thailand time formatter.
- `src/**/*.test.ts(x)`: colocated behavior tests.
- `e2e/portfolio.spec.ts`: browser-level accessibility and overflow checks.

---

### Task 1: Application foundation and fluid design system

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `src/app/design-tokens.test.ts`

**Interfaces:**
- Produces CSS tokens `--text-display`, `--text-h1`, `--text-h2`, `--text-body`, `--space-section`, `--page-gutter`, `--content-max`, `--accent`, `--surface`, and `--ink`.
- Produces npm scripts `dev`, `build`, `lint`, `typecheck`, `test`, and `test:e2e`.

- [ ] **Step 1: Initialize dependencies**

Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest motion@latest three@latest @react-three/fiber@latest @react-three/drei@latest lucide-react@latest clsx@latest
npm install -D typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest @types/three@latest tailwindcss@latest @tailwindcss/postcss@latest eslint@latest eslint-config-next@latest vitest@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest @playwright/test@latest
```

Expected: dependencies install without peer-dependency errors.

- [ ] **Step 2: Configure scripts and tooling**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Configure Vitest with the `jsdom` environment, `@/` alias to `src/`, globals enabled, and `vitest.setup.ts` loading `@testing-library/jest-dom/vitest`.

- [ ] **Step 3: Write the failing token test**

```ts
// src/app/design-tokens.test.ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("fluid design tokens", () => {
  const css = readFileSync(resolve("src/app/globals.css"), "utf8");

  it.each([
    "--text-display",
    "--text-h1",
    "--text-h2",
    "--text-body",
    "--space-section",
    "--page-gutter",
  ])("defines %s with clamp()", (token) => {
    expect(css).toMatch(new RegExp(`${token}:\\\\s*clamp\\\\(`));
  });
});
```

- [ ] **Step 4: Verify the token test fails**

Run: `npm test -- src/app/design-tokens.test.ts`

Expected: FAIL because `globals.css` does not exist.

- [ ] **Step 5: Implement CSS-first Tailwind configuration**

Create `globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-accent: var(--accent);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
}

:root {
  --surface: #0a0b0a;
  --surface-raised: #121412;
  --ink: #f3f1e8;
  --ink-muted: #a7aaa1;
  --accent: #c6ff32;
  --line: rgb(243 241 232 / 14%);
  --text-display: clamp(3.5rem, 1.7rem + 7.7vw, 11rem);
  --text-h1: clamp(3rem, 1.75rem + 5vw, 8rem);
  --text-h2: clamp(2.25rem, 1.4rem + 3.4vw, 5.5rem);
  --text-body: clamp(1rem, 0.94rem + 0.25vw, 1.25rem);
  --text-small: clamp(0.75rem, 0.72rem + 0.12vw, 0.875rem);
  --space-section: clamp(5rem, 2.4rem + 8vw, 14rem);
  --page-gutter: clamp(1rem, 0.35rem + 2.6vw, 4rem);
  --content-max: 160rem;
}

html { color-scheme: dark; scroll-behavior: smooth; }
body { overflow-x: clip; background: var(--surface); color: var(--ink); }
.shell { width: min(100%, var(--content-max)); margin-inline: auto; padding-inline: var(--page-gutter); }
.section-space { padding-block: var(--space-section); }
::selection { background: var(--accent); color: var(--surface); }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
```

Create the root layout with Geist fonts, site metadata, and the body classes `font-sans antialiased`.

- [ ] **Step 6: Verify the foundation**

Run: `npm test -- src/app/design-tokens.test.ts && npm run typecheck`

Expected: token test PASS and TypeScript exits 0.

### Task 2: Typed site and project content

**Files:**
- Create: `src/data/site.ts`
- Create: `src/data/projects.ts`
- Test: `src/data/projects.test.ts`

**Interfaces:**
- Produces `Project` with `slug`, `title`, `summary`, `year`, `tags`, `liveUrl`, `sourceUrl`, `visual`, and `featured`.
- Produces `projects: readonly Project[]`, `skills`, `navigation`, and verified `socials`.

- [ ] **Step 1: Write the failing data-integrity test**

```ts
import { describe, expect, it } from "vitest";
import { projects } from "./projects";

describe("project data", () => {
  it("has unique slugs and secure external URLs", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.liveUrl).toMatch(/^https:\/\//);
      expect(project.sourceUrl).toMatch(/^https:\/\/github\.com\//);
    }
  });
});
```

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- src/data/projects.test.ts`

Expected: FAIL because the module is missing.

- [ ] **Step 3: Add verified content**

Define these projects using URLs migrated from the existing site:

```ts
export const projects = [
  {
    slug: "personal-ai-chatbot",
    title: "Leo's Personal AI Chatbot",
    summary: "A conversational AI workspace designed around fast, focused personal assistance.",
    year: "2026",
    tags: ["Next.js", "AI", "React"],
    liveUrl: "https://chat.aungmyatkyaw.com/",
    sourceUrl: "https://github.com/popey17/personal-chatbot",
    visual: "orb",
    featured: true,
  },
  {
    slug: "threejs-explode-text",
    title: "Three.js Explode Text",
    summary: "An interactive typographic experiment that turns WebGL motion into a tactile interface.",
    year: "2024",
    tags: ["Three.js", "WebGL", "GSAP"],
    liveUrl: "https://3js-explode-text.vercel.app/",
    sourceUrl: "https://github.com/popey17/3js-Explode-Text",
    visual: "type",
    featured: true,
  },
  {
    slug: "award-winning-image-reveal",
    title: "Award Winning Image Reveal",
    summary: "A cinematic hover study exploring image distortion, masking, and responsive motion.",
    year: "2024",
    tags: ["JavaScript", "WebGL", "Interaction"],
    liveUrl: "https://popey17.github.io/hover_preview/",
    sourceUrl: "https://github.com/popey17/hover_preview",
    visual: "reveal",
    featured: true,
  },
  {
    slug: "threejs-dragon",
    title: "Three.js Dragon",
    summary: "A real-time 3D character study built for the browser with responsive camera behavior.",
    year: "2024",
    tags: ["Three.js", "3D", "WebGL"],
    liveUrl: "https://popey17.github.io/3js-Dragon/",
    sourceUrl: "https://github.com/popey17/3js-Dragon",
    visual: "dragon",
    featured: true,
  },
] as const satisfies readonly Project[];
```

Define verified socials as LinkedIn `https://www.linkedin.com/in/leo17/` and GitHub `https://github.com/popey17`.

- [ ] **Step 4: Verify content**

Run: `npm test -- src/data/projects.test.ts`

Expected: PASS.

### Task 3: Shared motion primitives and header

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/components/ui/reveal.tsx`
- Create: `src/components/ui/magnetic-link.tsx`
- Create: `src/components/layout/site-header.tsx`
- Test: `src/components/layout/site-header.test.tsx`

**Interfaces:**
- Produces `Reveal({ children, className, delay })`.
- Produces `MagneticLink` with normal anchor semantics.
- Produces `SiteHeader()` with navigation, availability badge, accent control, and modal mobile drawer.

- [ ] **Step 1: Write the mobile-drawer test**

```tsx
it("opens, closes, and restores focus", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: /open menu/i });
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/components/layout/site-header.test.tsx`

Expected: FAIL because `SiteHeader` is missing.

- [ ] **Step 3: Implement motion and navigation**

Use Motion's `useReducedMotion()` in `Reveal`, pointer media queries in `MagneticLink`, and `AnimatePresence` for the drawer. Lock body scroll while open, focus the first drawer link, close on Escape, and restore focus to the trigger. Store accent preference as `"lime"` without reading `localStorage` during server render.

- [ ] **Step 4: Verify header behavior**

Run: `npm test -- src/components/layout/site-header.test.tsx`

Expected: PASS.

### Task 4: Hero, pointer companion, and WebGL scene

**Files:**
- Create: `src/components/hero/hero.tsx`
- Create: `src/components/hero/hero-scene.tsx`
- Create: `src/components/hero/pointer-companion.tsx`
- Test: `src/components/hero/hero.test.tsx`

**Interfaces:**
- Produces `Hero()` with `#work` and `#contact` links.
- Produces default-exported `HeroScene()` for `next/dynamic`.
- `HeroScene` accepts no props and exposes no page state.

- [ ] **Step 1: Write the semantic hero test**

```tsx
it("states the role and exposes primary actions", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    /front-end developer.*full-stack developer/i,
  );
  expect(screen.getByRole("link", { name: /view selected work/i })).toHaveAttribute("href", "#work");
  expect(screen.getByRole("link", { name: /let's work together/i })).toHaveAttribute("href", "#contact");
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/components/hero/hero.test.tsx`

Expected: FAIL because `Hero` is missing.

- [ ] **Step 3: Implement the hero shell**

Build an `svh`-aware hero with eyebrow, fluid display heading, concise supporting copy, two CTAs, scroll marker, static CSS orb fallback, and pointer companion. Load `HeroScene` with:

```tsx
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});
```

- [ ] **Step 4: Implement the scene**

Use `<Canvas dpr={[1, 1.5]} frameloop="always">`, an icosahedron with `MeshDistortMaterial`, ambient and point lights, damped pointer rotation in `useFrame`, and `IntersectionObserver` to switch to `frameloop="never"` when not visible. Mark the canvas wrapper `aria-hidden="true"`.

- [ ] **Step 5: Verify hero behavior**

Run: `npm test -- src/components/hero/hero.test.tsx && npm run typecheck`

Expected: PASS and TypeScript exits 0.

### Task 5: About and technology rail

**Files:**
- Create: `src/components/about/about.tsx`
- Create: `src/components/about/tech-marquee.tsx`
- Test: `src/components/about/tech-marquee.test.tsx`

**Interfaces:**
- Produces `About()` with `id="about"`.
- Produces `TechMarquee({ skills })`, pausable by pointer and keyboard.

- [ ] **Step 1: Write the accessibility test**

```tsx
it("labels the skills and provides a pause control", async () => {
  render(<TechMarquee skills={["React", "Next.js"]} />);
  expect(screen.getByRole("region", { name: /technology stack/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /pause technology animation/i })).toBeVisible();
});
```

- [ ] **Step 2: Verify failure, implement, and re-run**

Run before implementation: `npm test -- src/components/about/tech-marquee.test.tsx`

Expected: FAIL.

Implement a duplicated visual list with one screen-reader-only source list. Toggle `animation-play-state`, disable animation under reduced motion, and ensure duplicated items use `aria-hidden`.

Run after implementation: `npm test -- src/components/about/tech-marquee.test.tsx`

Expected: PASS.

### Task 6: Selected-work grid and cards

**Files:**
- Create: `src/components/projects/projects.tsx`
- Create: `src/components/projects/project-card.tsx`
- Test: `src/components/projects/projects.test.tsx`

**Interfaces:**
- Produces `Projects({ projects }: { projects: readonly Project[] })`.
- Produces `ProjectCard({ project, index })`.

- [ ] **Step 1: Write the projects test**

```tsx
it("renders verified project actions in an ordered section", () => {
  render(<Projects projects={projects.slice(0, 1)} />);
  expect(screen.getByRole("heading", { name: /selected work/i })).toBeVisible();
  expect(screen.getByRole("link", { name: /view live/i })).toHaveAttribute(
    "href",
    "https://chat.aungmyatkyaw.com/",
  );
  expect(screen.getByRole("link", { name: /source code/i })).toHaveAttribute(
    "href",
    "https://github.com/popey17/personal-chatbot",
  );
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/components/projects/projects.test.tsx`

Expected: FAIL because `Projects` is missing.

- [ ] **Step 3: Implement editorial cards**

Use a one-column mobile layout and two-column container-query layout above `48rem`. Alternate card spans and vertical offsets, render four CSS-generated visual treatments from `project.visual`, use `overflow-clip` for image-scale effects, and keep links available without hover.

- [ ] **Step 4: Verify projects**

Run: `npm test -- src/components/projects/projects.test.tsx`

Expected: PASS.

### Task 7: Contact, clipboard feedback, and Thailand time

**Files:**
- Create: `src/lib/time.ts`
- Create: `src/components/contact/local-time.tsx`
- Create: `src/components/contact/contact.tsx`
- Test: `src/lib/time.test.ts`
- Test: `src/components/contact/contact.test.tsx`

**Interfaces:**
- Produces `formatThailandTime(date: Date): string`.
- Produces `Contact({ email }: { email?: string })`.
- Reads `NEXT_PUBLIC_CONTACT_EMAIL` in `src/app/page.tsx`; if absent, presents LinkedIn as the primary contact instead of inventing an address.

- [ ] **Step 1: Write deterministic time and clipboard tests**

```ts
expect(formatThailandTime(new Date("2026-09-24T12:00:00Z"))).toBe("19:00 GMT+7");
```

```tsx
it("copies a configured email and announces success", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<Contact email="owner@example.test" />);
  await userEvent.click(screen.getByRole("button", { name: /copy email/i }));
  expect(writeText).toHaveBeenCalledWith("owner@example.test");
  expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/time.test.ts src/components/contact/contact.test.tsx`

Expected: FAIL because implementations are missing.

- [ ] **Step 3: Implement contact behavior**

Format time with `Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false })`. Update once per minute after hydration. On clipboard rejection, select the visible email text and announce “Copy unavailable — select the email address.”

- [ ] **Step 4: Verify contact**

Run: `npm test -- src/lib/time.test.ts src/components/contact/contact.test.tsx`

Expected: PASS.

### Task 8: Page composition and browser verification

**Files:**
- Modify: `src/app/page.tsx`
- Create: `playwright.config.ts`
- Create: `e2e/portfolio.spec.ts`

**Interfaces:**
- Composes `SiteHeader`, `Hero`, `About`, `TechMarquee`, `Projects`, and `Contact`.
- Exposes section anchors `about`, `work`, and `contact`.

- [ ] **Step 1: Compose the page**

Keep `page.tsx` as a server component:

```tsx
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <TechMarquee skills={skills} />
        <Projects projects={projects} />
        <Contact email={process.env.NEXT_PUBLIC_CONTACT_EMAIL} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Add browser checks**

```ts
for (const width of [375, 768, 1440, 2560, 3840]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("mobile navigation is keyboard operable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
```

- [ ] **Step 3: Run complete verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Expected: all commands exit 0; overflow tests pass at 375, 768, 1440, 2560, and 3840px.

- [ ] **Step 4: Perform final manual checks**

Verify reduced motion, focus order, drawer focus restoration, touch interactions, WebGL fallback, external-link destinations, clipboard rejection, and Thailand clock behavior. Run Lighthouse against the production server and retain performance and accessibility scores of 90 or higher.
