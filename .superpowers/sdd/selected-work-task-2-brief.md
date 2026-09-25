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
- Overlay is inside a bottom gradient layer.
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
  sizes="(min-width: 1280px) 55vw, (min-width: 768px) 60vw, 100vw"
  src={image.src}
  style={{ objectPosition: image.position ?? "50% 50%" }}
/>
```

Render generated artwork only when `image` is absent. Render optional overlay text over a pointer-events-none bottom gradient with responsive padding and readable contrast.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/components/projects/projects.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

