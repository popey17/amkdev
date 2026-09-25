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
