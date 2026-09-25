import { expect, test } from "@playwright/test";

test("composes the portfolio sections in the required landmark order", async ({
  page,
}) => {
  await page.goto("/");

  const landmarks = page.locator(
    "body > header, body > main, body > footer#contact",
  );
  await expect(landmarks).toHaveCount(3);
  expect(
    await landmarks.evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.id,
        tagName: element.tagName,
      })),
    ),
  ).toEqual([
    { id: "", tagName: "HEADER" },
    { id: "", tagName: "MAIN" },
    { id: "contact", tagName: "FOOTER" },
  ]);

  await expect(page.locator("body > header")).toHaveCount(1);
  await expect(page.locator("body > main")).toHaveCount(1);
  await expect(page.locator("body > footer#contact")).toHaveCount(1);
  await expect(page.locator("main > section")).toHaveCount(4);
  await expect(page.locator("main > section").nth(0)).toHaveAttribute("id", "top");
  await expect(page.locator("main > section").nth(1)).toHaveAttribute(
    "id",
    "about",
  );
  await expect(page.locator("main > section").nth(2)).toHaveAttribute(
    "aria-label",
    "Technology stack",
  );
  await expect(page.locator("main > section").nth(3)).toHaveAttribute(
    "id",
    "work",
  );
  await expect(page.getByRole("contentinfo")).toHaveAttribute("id", "contact");
  await expect(page.locator("main footer")).toHaveCount(0);
});

for (const width of [375, 768, 1440, 2560, 3840]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  });
}

test("mobile navigation is keyboard operable and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: /open menu/i });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: /navigation/i });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("link", { name: "About" })).toBeFocused();

  const firstFocusable = dialog.getByRole("button", {
    name: /light theme/i,
  });
  await firstFocusable.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "GitHub" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstFocusable).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("reduced motion disables marquee animation and keeps fallback content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const marquee = page.getByTestId("tech-marquee-track");
  expect(
    await page.evaluate(() =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(marquee).toHaveCSS("animation-name", "none");
  await expect(page.getByTestId("hero-orb-fallback")).toBeVisible();
});

test("keeps the hero usable when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const attempts: string[] = [];

    Object.defineProperty(window, "__webglContextAttempts", {
      configurable: true,
      value: attempts,
    });

    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      if (contextId === "webgl" || contextId === "webgl2") {
        attempts.push(contextId);
        return null;
      }

      return Reflect.apply(originalGetContext, this, [contextId, ...args]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /view selected work/i }),
  ).toBeVisible();
  await expect(page.getByTestId("hero-orb-fallback")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __webglContextAttempts: string[];
            }
          ).__webglContextAttempts,
      ),
    )
    .not.toEqual([]);
  await expect.poll(() => page.locator("#top canvas").count()).toBe(0);
});

test("uses native document scrolling", async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    const record = (name: string) =>
      function () {
        calls.push(name);
      };

    Object.defineProperty(window, "__programmaticScrollCalls", {
      configurable: true,
      value: calls,
    });

    window.scroll = record("window.scroll");
    window.scrollTo = record("window.scrollTo");
    window.scrollBy = record("window.scrollBy");
    Element.prototype.scroll = record("Element.scroll");
    Element.prototype.scrollTo = record("Element.scrollTo");
    Element.prototype.scrollBy = record("Element.scrollBy");
    Element.prototype.scrollIntoView = record("Element.scrollIntoView");
  });

  await page.goto("/");

  const beforeWheel = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollingElement: document.scrollingElement?.tagName,
    bodyTransform: getComputedStyle(document.body).transform,
  }));
  expect({
    scrollingElement: beforeWheel.scrollingElement,
    bodyTransform: beforeWheel.bodyTransform,
  }).toEqual({
    scrollingElement: "HTML",
    bodyTransform: "none",
  });

  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(beforeWheel.scrollY);
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __programmaticScrollCalls: string[];
          }
        ).__programmaticScrollCalls,
    ),
  ).toEqual([]);
});
