import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FooterCrowd } from "./footer-crowd";
import { dogSprite, personSprite, spritePalette } from "./footer-sprites";

describe.each([
  ["person", personSprite],
  ["dog", dogSprite],
])("%s sprite", (_name, sprite) => {
  it("uses same-sized frames drawn only with palette characters", () => {
    const [first] = sprite.frames;
    for (const frame of sprite.frames) {
      expect(frame).toHaveLength(first!.length);
      for (const row of frame) {
        expect(row).toHaveLength(first![0]!.length);
        for (const char of row) expect(char === "." || char in spritePalette).toBe(true);
      }
    }
  });

  it("only cycles through frames that exist", () => {
    for (const cycle of Object.values(sprite.cycles)) {
      expect(cycle.length).toBeGreaterThan(0);
      for (const index of cycle) expect(sprite.frames[index]).toBeDefined();
    }
  });
});

describe("FooterCrowd", () => {
  let reduceMotion = false;

  beforeEach(() => {
    reduceMotion = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce") ? reduceMotion : false,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders a decorative stage with every character", () => {
    render(<FooterCrowd />);

    const stage = screen.getByTestId("footer-crowd");
    expect(stage).toHaveAttribute("aria-hidden", "true");
    expect(
      Array.from(stage.querySelectorAll("[data-actor]"), (actor) => actor.getAttribute("data-actor")),
    ).toEqual(["walker", "dog", "runner"]);
  });

  it("leaves characters standing in place under reduced motion", () => {
    reduceMotion = true;
    render(<FooterCrowd />);

    for (const actor of screen.getByTestId("footer-crowd").querySelectorAll<HTMLElement>("[data-actor]")) {
      expect(actor.style.transform).toBe("");
      expect(actor.style.left).toMatch(/%$/);
    }
  });
});
