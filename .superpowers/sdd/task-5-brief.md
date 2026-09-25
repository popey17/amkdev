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

