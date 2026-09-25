# Task 1 Report: Typed image and overlay content

## Status

**COMPLETE** — Types implemented; tests and typecheck pass.

## RED evidence

### Step 1–2: Tests added, RED confirmed

After adding the compile-time fixture and runtime assertions to `src/data/projects.test.ts`:

```bash
npm test -- src/data/projects.test.ts
```

**Result:** PASS (2/2 tests) — Vitest runs transpiled JS without blocking on TS errors.

```bash
npm run typecheck
```

**Result:** FAIL — compile-time RED as expected:

```
src/data/projects.test.ts(6,3): error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'Project'.
```

The `satisfies Project` fixture correctly failed until `ProjectImage`, `ProjectOverlay`, and optional `image`/`overlay` fields were added.

## GREEN evidence

After implementing types in `src/data/projects.ts`:

```bash
npm test -- src/data/projects.test.ts && npm run typecheck
```

**Result:** PASS

- Tests: 2 passed (2)
- Typecheck: exit 0, no errors

## Files changed

| File | Change |
|------|--------|
| `src/data/projects.ts` | Added exported `ProjectImage` and `ProjectOverlay`; optional `image?` and `overlay?` on `Project`. No production project entries modified. |
| `src/data/projects.test.ts` | Added `imageProject` compile-time fixture (`satisfies Project`); test asserting image path prefix and non-empty alt; overlay eyebrow assertion. |

## Concerns

1. **RED via typecheck, not Vitest alone** — `npm test` passed during RED because Vitest does not enforce TypeScript on the fixture. The brief's RED step passes at runtime; compile-time failure is captured by `npm run typecheck`. Consider adding `vitest typecheck` or a dedicated `tsc --noEmit` CI step if compile-time fixtures should gate RED in test runs alone.

2. **`position` is untyped string** — Matches brief (`optional position` as string). CSS object-position values are not validated at compile time.

3. **No fabricated paths in production data** — Confirmed: `projects` array unchanged; only type definitions extended.

## Follow-up: collection-wide image validation

### Change

Added `projectsWithImages: readonly Project[]` combining all production `projects` plus the compile-time `imageProject` fixture (`satisfies Project` retained). New test iterates the collection and validates path prefix and non-empty alt for every entry with `image` configured.

### Evidence

```bash
npm test -- src/data/projects.test.ts && npm run typecheck
```

**Result:** PASS

- Tests: 3 passed (3) — includes `validates every configured project image`
- Typecheck: exit 0, no errors

Future production entries with `image` added to `projects` are automatically included in validation via the spread into `projectsWithImages`.
