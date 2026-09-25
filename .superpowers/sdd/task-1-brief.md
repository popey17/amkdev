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

