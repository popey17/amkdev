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
