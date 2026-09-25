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

