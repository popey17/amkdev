import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { personSprite } from "@/components/contact/footer-sprites";

import { PIXEL, SpriteSheet, frameSize } from "./sprite-sheet";

describe("frameSize", () => {
  it("multiplies grid by PIXEL", () => {
    const cols = personSprite.frames[0]![0]!.length;
    const rows = personSprite.frames[0]!.length;
    expect(frameSize(personSprite)).toEqual({
      width: cols * PIXEL,
      height: rows * PIXEL,
    });
  });
});

describe("SpriteSheet", () => {
  it("renders one svg with data-sprite-sheet and at least one filled rect", () => {
    const { container } = render(<SpriteSheet sprite={personSprite} />);
    const svg = container.querySelector("[data-sprite-sheet]");
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll("rect").length).toBeGreaterThan(0);
  });
});
