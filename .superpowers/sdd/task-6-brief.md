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

