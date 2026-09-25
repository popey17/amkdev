import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CursorTrail } from "./cursor-trail";

function mockMedia(matches: Record<string, boolean>) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matches[query] ?? false,
    addEventListener() {},
    removeEventListener() {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

it("renders a decorative trail for fine pointers", () => {
  mockMedia({ "(hover: hover) and (pointer: fine)": true });
  render(<CursorTrail />);

  expect(screen.getByTestId("cursor-trail")).toHaveAttribute("aria-hidden", "true");
});

it("stays off for touch devices and reduced motion", () => {
  mockMedia({ "(hover: hover) and (pointer: fine)": false });
  const { unmount } = render(<CursorTrail />);
  expect(screen.queryByTestId("cursor-trail")).not.toBeInTheDocument();
  unmount();

  mockMedia({
    "(hover: hover) and (pointer: fine)": true,
    "(prefers-reduced-motion: reduce)": true,
  });
  render(<CursorTrail />);
  expect(screen.queryByTestId("cursor-trail")).not.toBeInTheDocument();
});
