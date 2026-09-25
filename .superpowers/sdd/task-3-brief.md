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

