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

