import { expect, type Locator, type Page, test } from "@playwright/test";

function effectiveOpacity(locator: Locator) {
  return locator.evaluate((element) => {
    let opacity = 1;
    for (let node: Element | null = element; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity);
    }
    return opacity;
  });
}

function revealTargets(page: Page) {
  return {
    heroHeading: page.getByRole("heading", { level: 1 }),
    heroAction: page.getByRole("link", { name: /view selected work/i }),
    about: page.getByRole("heading", {
      name: /i like building things that feel good to use/i,
    }),
    project: page.getByRole("heading", { name: "Leo's Personal AI Chatbot" }),
    contact: page.getByRole("heading", { name: /let's work together/i }),
  };
}

async function renderSevenProjectFixture(page: Page) {
  await page.locator("#work > ol > li").first().waitFor();
  await waitForProjectsHydration(page);
  await page.evaluate(() => {
    const list = document.querySelector<HTMLOListElement>("#work > ol")!;
    const sourceCards = Array.from(list.children);

    for (let index = sourceCards.length; index < 7; index += 1) {
      list.append(sourceCards[index % sourceCards.length]!.cloneNode(true));
    }

    list.lastElementChild!.className =
      "min-w-0 @min-[48rem]:col-span-8 @min-[48rem]:col-start-3";
  });
}

async function waitForProjectsHydration(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const candidates = [
          document.querySelector("#work"),
          document.querySelector("#work > ol > li"),
        ];

        return candidates.some(
          (element) =>
            element &&
            Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
        );
      }),
    )
    .toBe(true);
}

async function waitForHydration(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        ["body > header button", '[data-testid="tech-marquee-track"]'].every(
          (selector) => {
            const element = document.querySelector(selector);
            return Boolean(
              element &&
                Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
            );
          },
        ),
      ),
    )
    .toBe(true);
}

function relativeLuminance([r, g, b]: number[]) {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
}

function contrast(foreground: number[], background: number[]) {
  const [light, dark] = [relativeLuminance(foreground), relativeLuminance(background)]
    .sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

function parseRgb(value: string) {
  return (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}

test.describe("reveal visibility", () => {
  test("reduced motion keeps every revealed section at computed opacity 1 after hydration", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForHydration(page);

    for (const [name, target] of Object.entries(revealTargets(page))) {
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      expect(await effectiveOpacity(target), name).toBe(1);
    }
  });

  test("server HTML is fully visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    for (const [name, target] of Object.entries(revealTargets(page))) {
      expect(await effectiveOpacity(target), name).toBe(1);
    }
    await context.close();
  });

  test("hero heading is visible at first paint while below-fold sections still reveal", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const { heroHeading, project } = revealTargets(page);

    expect(await effectiveOpacity(heroHeading)).toBe(1);
    await waitForHydration(page);
    expect(await effectiveOpacity(heroHeading)).toBe(1);
    expect(
      await heroHeading.evaluate((element) => getComputedStyle(element).animationName),
    ).not.toBe("none");

    expect(await effectiveOpacity(project)).toBeLessThan(1);
    await project.scrollIntoViewIfNeeded();
    await expect.poll(() => effectiveOpacity(project)).toBe(1);
  });
});

test("semantic color utilities resolve to their tokens in the browser", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const muted = page.getByText(
    "I create thoughtful, reliable digital experiences where design, interaction, and technology work together.",
    { exact: true },
  );
  await expect(muted).toHaveCSS("color", "rgb(167, 170, 161)");
  await expect(page.getByTestId("header-bar")).toHaveCSS(
    "border-bottom-color",
    "rgba(243, 241, 232, 0.14)",
  );
});

test("mobile drawer scrolls in a short landscape viewport while the body stays locked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.goto("/");
  await waitForHydration(page);
  await page.getByRole("button", { name: /open menu/i }).click();

  const dialog = page.getByRole("dialog", { name: /navigation/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("overflow-y", "auto");
  await expect(dialog).toHaveCSS("overscroll-behavior-y", "contain");

  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(400, 200);
  await page.mouse.wheel(0, 2000);

  const lastLink = dialog.getByRole("link", { name: "GitHub" });
  await expect
    .poll(async () => {
      const box = await lastLink.boundingBox();
      return box ? box.y >= 0 && box.y + box.height <= 375 : false;
    })
    .toBe(true);

  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe(
    "hidden",
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

for (const width of [1440, 2560, 3840]) {
  test(`each marquee lane covers the visible rail at ${width}px with an exact seam`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const metrics = await page.getByTestId("tech-marquee-track").evaluate((track) => {
      const viewport = track.parentElement!;
      const lanes = Array.from(
        track.querySelectorAll<HTMLElement>('[data-testid="tech-marquee-lane"]'),
      );
      const items = lanes.map((lane) =>
        Array.from(lane.querySelectorAll("li")).map((item) =>
          item.getBoundingClientRect(),
        ),
      );
      const [first, second] = items;
      return {
        viewportWidth: viewport.getBoundingClientRect().width,
        laneWidths: lanes.map((lane) => lane.getBoundingClientRect().width),
        trackWidth: track.getBoundingClientRect().width,
        internalGap: first![1]!.left - first![0]!.right,
        seamGap: second![0]!.left - first!.at(-1)!.right,
      };
    });

    expect(metrics.laneWidths).toHaveLength(2);
    for (const laneWidth of metrics.laneWidths) {
      expect(laneWidth).toBeGreaterThanOrEqual(metrics.viewportWidth);
      expect(laneWidth).toBeGreaterThanOrEqual(width - 1);
    }
    expect(Math.abs(metrics.laneWidths[0]! - metrics.laneWidths[1]!)).toBeLessThan(0.5);
    expect(Math.abs(metrics.trackWidth - 2 * metrics.laneWidths[0]!)).toBeLessThan(0.5);
    expect(Math.abs(metrics.seamGap - metrics.internalGap)).toBeLessThan(0.5);
  });
}

test("marquee stops under reduced motion after hydration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);

  const track = page.getByTestId("tech-marquee-track");
  await expect(track).toHaveAttribute("data-reduced-motion", "true");
  await expect(track).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("theme toggle switches to a stored light parchment theme with AA contrast", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForHydration(page);

  const toggle = page.getByRole("button", { name: "Light theme" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  const darkBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const lightBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(lightBackground).not.toBe(darkBackground);
  expect(relativeLuminance(parseRgb(lightBackground))).toBeGreaterThan(0.7);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await waitForHydration(page);
  await expect(page.getByRole("button", { name: "Light theme" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const pairs = await page.evaluate(() => {
    const pick = (selector: string) => document.querySelector<HTMLElement>(selector)!;
    const background = getComputedStyle(document.body).backgroundColor;
    const heading = pick("h1");
    const muted = heading.querySelector("span")!;
    const eyebrow = pick("#top p");
    const cta = pick('#top a[href="#work"]');
    return [
      [getComputedStyle(heading).color, background],
      [getComputedStyle(muted).color, background],
      [getComputedStyle(eyebrow).color, background],
      [getComputedStyle(cta).color, getComputedStyle(cta).backgroundColor],
    ];
  });
  for (const [foreground, background] of pairs) {
    expect(contrast(parseRgb(foreground!), parseRgb(background!))).toBeGreaterThanOrEqual(
      4.5,
    );
  }
  await expect(page.locator('#top a[href="#work"]')).toHaveCSS(
    "background-color",
    "rgb(198, 255, 50)",
  );

  expect(errors.filter((text) => /hydrat|mismatch/i.test(text))).toEqual([]);
});

test("header condenses its inner bar after the hero without shifting layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForHydration(page);

  const header = page.locator("body > header");
  const bar = page.getByTestId("header-bar");
  const layout = () =>
    page.evaluate(() => ({
      headerHeight: document.querySelector("body > header")!.getBoundingClientRect()
        .height,
      aboutTop: document.getElementById("about")!.offsetTop,
      workTop: document.getElementById("work")!.offsetTop,
    }));

  await expect(header).toHaveAttribute("data-condensed", "false");
  await page.waitForTimeout(400);
  const before = await layout();
  const expandedBar = (await bar.boundingBox())!.height;

  await page.mouse.wheel(0, 1600);
  await expect(header).toHaveAttribute("data-condensed", "true");
  await expect
    .poll(async () => (await bar.boundingBox())!.height)
    .toBeLessThan(expandedBar - 8);
  await page.waitForTimeout(400);
  expect(await layout()).toEqual(before);

  const home = page.getByRole("link", { name: /home/i });
  const homeBox = (await home.boundingBox())!;
  const barBox = (await bar.boundingBox())!;
  expect(homeBox.y).toBeGreaterThanOrEqual(barBox.y);
  expect(homeBox.y + homeBox.height).toBeLessThanOrEqual(barBox.y + barBox.height);

  await page.mouse.wheel(0, -4000);
  await expect(header).toHaveAttribute("data-condensed", "false");
  await page.waitForTimeout(400);
  expect(await layout()).toEqual(before);
});

test("condensed header keeps a constant height under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForHydration(page);

  const header = page.locator("body > header");
  const expanded = (await header.boundingBox())!.height;
  await page.mouse.wheel(0, 1600);
  await expect(header).toHaveAttribute("data-condensed", "true");
  expect((await header.boundingBox())!.height).toBe(expanded);
  await expect(page.getByTestId("header-bar")).toHaveCSS("transition-property", "none");
});

test("drawer closes when the viewport crosses to desktop and focus stays visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await waitForHydration(page);
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("dialog", { name: /navigation/i })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });

  await expect(page.getByRole("dialog")).toBeHidden();
  const focus = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    const rect = active?.getBoundingClientRect();
    return {
      label: active?.getAttribute("aria-label"),
      visible: Boolean(rect && rect.width > 0 && rect.height > 0),
      bodyOverflow: document.body.style.overflow,
    };
  });
  expect(focus.label).not.toBe("Open menu");
  expect(focus.visible).toBe(true);
  expect(focus.bodyOverflow).toBe("");
});

test("metadata names the developer and role", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Aung Myat Kyaw — Developer");
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  expect(description).toMatch(/Aung Myat Kyaw/);
  expect(description).toMatch(/developer/i);
  expect(description).not.toMatch(/front-end|full-stack/i);
  expect(description!.length).toBeLessThanOrEqual(160);
});

test("project hover scales the inner artwork while the clipped frame stays fixed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const card = page.getByRole("article", { name: "Leo's Personal AI Chatbot" });
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const frame = card.getByTestId("project-visual-orb");
  const layer = frame.getByTestId("project-artwork-layer");
  const before = await frame.boundingBox();

  const scaleOf = (target: Locator) =>
    target.evaluate((element) => {
      const style = getComputedStyle(element);
      const individual = style.scale === "none" ? 1 : Number.parseFloat(style.scale);
      return individual * new DOMMatrix(style.transform).a;
    });

  await frame.hover();
  await expect.poll(() => scaleOf(layer)).toBeGreaterThan(1.03);

  const after = await frame.boundingBox();
  expect(after).toEqual(before);
  expect(await scaleOf(frame)).toBe(1);
});

test("seven-card fixture waits for Projects hydration after global hydration", async ({
  page,
}) => {
  await page.setContent(`
    <header><button type="button">Menu</button></header>
    <div data-testid="tech-marquee-track"></div>
    <section id="work"><ol><li></li><li></li><li></li><li></li></ol></section>
  `);
  await page.evaluate(() => {
    for (const selector of [
      "body > header button",
      '[data-testid="tech-marquee-track"]',
    ]) {
      const element = document.querySelector<HTMLElement>(selector)!;
      (element as HTMLElement & Record<string, unknown>)[
        "__reactFiber$fixture"
      ] = {};
    }
  });
  await waitForHydration(page);

  let fixtureResolved = false;
  const fixture = renderSevenProjectFixture(page).then(() => {
    fixtureResolved = true;
  });
  await page.waitForTimeout(250);

  expect(fixtureResolved).toBe(false);
  await expect(page.locator("#work > ol > li")).toHaveCount(4);

  await page.locator("#work > ol > li").first().evaluate((element) => {
    (element as HTMLElement & Record<string, unknown>)[
      "__reactFiber$fixture"
    ] = {};
  });
  await fixture;

  await expect(page.locator("#work > ol > li")).toHaveCount(7);
});

for (const width of [375, 1440]) {
  test(`seven project cards keep complete rows without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await waitForHydration(page);
    await renderSevenProjectFixture(page);

    const cards = page.locator("#work > ol > li");
    const pairedCards = page.locator(
      "#work > ol > li:is([class*='col-span-5'], [class*='col-span-7'])",
    );
    const centeredCard = page.locator(
      "#work > ol > li[class*='col-span-8'][class*='col-start-3']",
    );

    await expect(cards).toHaveCount(7);
    await expect(pairedCards).toHaveCount(6);
    await expect(centeredCard).toHaveCount(1);
    await expect(cards.last()).toHaveClass(/col-span-8/);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);

    if (width === 1440) {
      await expect(centeredCard).toHaveCSS("grid-column-start", "3");
      await expect(centeredCard).toHaveCSS("grid-column-end", "span 8");
    }
  });
}
