### Task 1: Typed image and overlay content

**Files:**
- Modify: `src/data/projects.ts`
- Modify: `src/data/projects.test.ts`

**Interfaces:**
- Add `ProjectImage` with `src`, `alt`, and optional `position`.
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

Assert configured image paths begin with `/` or `https://`, and image alt text is non-empty.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/data/projects.test.ts`

Expected: FAIL because `Project` does not accept image or overlay metadata.

- [ ] **Step 3: Implement the types**

Export `ProjectImage` and `ProjectOverlay`, then add the optional properties to `Project`. Do not add fabricated image paths to existing production projects.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/data/projects.test.ts && npm run typecheck`

Expected: PASS.

