# Selected Work Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selected-work cards support optional responsive images, readable text overlays, and balanced layouts for any number of projects.

**Architecture:** Extend the typed project model with optional image metadata and overlay content. Keep `ProjectArtwork` responsible for choosing between a `next/image` layer and the existing generated fallback, while `Projects` determines repeatable editorial placement and centers an unpaired final card.

**Tech Stack:** Next.js Image, React, TypeScript, Tailwind CSS, Vitest, Testing Library, and Playwright.

## Global Constraints

- Existing projects without images must continue rendering their generated artwork.
- Images stay inside `project-artwork-layer` and inherit its clipped hover treatment.
- Image sources are local public paths beginning with `/`; remote image hosts are not approved.
- Overlay text is optional, visible without hover, and protected by a high-contrast gradient in a stationary sibling of `project-artwork-layer`.
- Image alternative text is required whenever an image path is configured.
- The grid must remain balanced with 1, 2, 5, 7, or more projects.
- No horizontal overflow from 375px through 3840px.
- Do not create Git commits.

### Task 1: Typed image and overlay content

**Files:**
- Modify: `src/data/projects.ts`
- Modify: `src/data/projects.test.ts`

**Interfaces:**
- Add `ProjectImage` with a local-path `src: \`/${string}\``, `alt`, and optional `position`.
- Add `ProjectOverlay` with `eyebrow` and `caption`.
- Add optional `image?: ProjectImage` and `overlay?: ProjectOverlay` to `Project`.

- [ ] **Step 1: Write failing model tests**

Add a compile-time fixture containing:

```ts
const imageProject = {
  ...projects[0],
  image: {
    src: "/images/projects/chatbot.webp",
    alt: "Chatbot conversation interface",
    position: "50% 35%",
  },
  overlay: {
    eyebrow: "AI workspace",
    caption: "Focused conversations, designed for speed.",
  },
} satisfies Project;
```

Assert configured image paths are local public paths beginning with `/`, reject remote and protocol-relative paths at runtime, and require non-empty image alt text.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/data/projects.test.ts`

Expected: FAIL because `Project` does not accept image or overlay metadata.

- [ ] **Step 3: Implement the types**

Export `ProjectImage` and `ProjectOverlay`, then add the optional properties to `Project`. Do not add fabricated image paths to existing production projects.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/data/projects.test.ts && npm run typecheck`

Expected: PASS.

### Task 2: Responsive image and overlay artwork

**Files:**
- Modify: `src/components/projects/project-card.tsx`
- Modify: `src/components/projects/projects.test.tsx`

**Interfaces:**
- `ProjectArtwork` consumes `title`, `visual`, `image`, and `overlay`.
- Valid images render with `Image fill` and responsive `sizes`.
- Missing images retain the existing generated visual.

- [ ] **Step 1: Write failing rendering tests**

Cover these behaviors:

```tsx
expect(screen.getByRole("img", { name: "Chatbot interface" })).toBeVisible();
expect(screen.getByText("AI workspace")).toBeVisible();
expect(screen.getByText("Fast, focused conversations.")).toBeVisible();
```

Also assert:

- Image is inside `project-artwork-layer`.
- The image uses the configured `object-position`.
- Overlay is a stationary sibling of `project-artwork-layer` inside the clipped frame, with a bottom gradient strong enough to preserve small-text AA contrast over bright images.
- A project without `image` has no `<img>` and keeps its generated visual.
- Overlay content is omitted when not configured.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/components/projects/projects.test.tsx`

Expected: FAIL because image and overlay rendering are absent.

- [ ] **Step 3: Implement image rendering**

Import `Image` from `next/image`. Render it inside the artwork layer:

```tsx
<Image
  alt={image.alt}
  className="object-cover"
  fill
  sizes="(min-width: 1024px) 67vw, 100vw"
  src={image.src}
  style={{ objectPosition: image.position ?? "50% 50%" }}
/>
```

Render generated artwork when `image` is absent or its source fails the local-path runtime guard. Render optional overlay text over a pointer-events-none bottom gradient with responsive padding and AA-safe text opacity. Keep that overlay stationary as a sibling of the zooming artwork layer.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/components/projects/projects.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

### Task 3: Arbitrary-count editorial placement

**Files:**
- Modify: `src/components/projects/projects.tsx`
- Modify: `src/components/projects/projects.test.tsx`
- Modify: `e2e/final-review.spec.ts`

**Interfaces:**
- Export or isolate `getProjectPlacement(index, count): string`.
- Repeat paired 7/5 and 5/7 placements.
- Center the final item when `count` is odd.

- [ ] **Step 1: Write failing placement tests**

Verify:

- One project receives a centered desktop placement.
- Two and four projects retain paired editorial placements.
- Five and seven projects center only their final unpaired card.
- Eight projects repeat the four-card pattern without missing placement classes.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/components/projects/projects.test.tsx`

Expected: FAIL because final unpaired cards are not centered.

- [ ] **Step 3: Implement scalable placement**

Use the existing four-card placement cycle for paired items. For an odd final item, return a desktop placement equivalent to:

```ts
"@min-[48rem]:col-span-8 @min-[48rem]:col-start-3"
```

Pass `projects.length` into the placement helper. Preserve list order and stable slug keys.

- [ ] **Step 4: Add browser regression**

Render a test fixture or expose placement metadata that proves a seven-item list has:

- No horizontal overflow at 375px and 1440px.
- Six paired cards.
- One centered final card.

- [ ] **Step 5: Run complete verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: all commands exit 0, with no regressions in existing project-card hover, links, landmarks, reduced motion, or viewport overflow.
