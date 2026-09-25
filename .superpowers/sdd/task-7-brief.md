### Task 7: Contact, clipboard feedback, and Thailand time

**Files:**
- Create: `src/lib/time.ts`
- Create: `src/components/contact/local-time.tsx`
- Create: `src/components/contact/contact.tsx`
- Test: `src/lib/time.test.ts`
- Test: `src/components/contact/contact.test.tsx`

**Interfaces:**
- Produces `formatThailandTime(date: Date): string`.
- Produces `Contact({ email }: { email?: string })`.
- Reads `NEXT_PUBLIC_CONTACT_EMAIL` in `src/app/page.tsx`; if absent, presents LinkedIn as the primary contact instead of inventing an address.

- [ ] **Step 1: Write deterministic time and clipboard tests**

```ts
expect(formatThailandTime(new Date("2026-09-24T12:00:00Z"))).toBe("19:00 GMT+7");
```

```tsx
it("copies a configured email and announces success", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<Contact email="owner@example.test" />);
  await userEvent.click(screen.getByRole("button", { name: /copy email/i }));
  expect(writeText).toHaveBeenCalledWith("owner@example.test");
  expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/time.test.ts src/components/contact/contact.test.tsx`

Expected: FAIL because implementations are missing.

- [ ] **Step 3: Implement contact behavior**

Format time with `Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false })`. Update once per minute after hydration. On clipboard rejection, select the visible email text and announce “Copy unavailable — select the email address.”

- [ ] **Step 4: Verify contact**

Run: `npm test -- src/lib/time.test.ts src/components/contact/contact.test.tsx`

Expected: PASS.

