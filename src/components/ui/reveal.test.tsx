import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Reveal } from "./reveal";

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observerCallbacks: ObserverCallback[] = [];

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce") ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  observerCallbacks = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: ObserverCallback) {
        observerCallbacks.push(callback);
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

it("server-renders visible content without an inline hidden opacity", () => {
  stubReducedMotion(false);
  const html = renderToString(<Reveal>Visible copy</Reveal>);

  expect(html).toContain("Visible copy");
  expect(html).not.toMatch(/opacity/);
  expect(html).not.toMatch(/data-reveal="pending"/);
});

it("never hides content when reduced motion is preferred", () => {
  stubReducedMotion(true);
  render(
    <Reveal>
      <p>Reduced copy</p>
    </Reveal>,
  );

  const wrapper = screen.getByText("Reduced copy").parentElement!;
  expect(wrapper).not.toHaveAttribute("data-reveal", "pending");
  expect(wrapper.style.opacity).toBe("");
});

it("keeps content already in the viewport visible at mount", () => {
  stubReducedMotion(false);
  render(
    <Reveal>
      <p>Above the fold</p>
    </Reveal>,
  );

  expect(screen.getByText("Above the fold").parentElement).toHaveAttribute(
    "data-reveal",
    "static",
  );
});

it("reveals below-the-fold content once it intersects", () => {
  stubReducedMotion(false);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: window.innerHeight + 400,
    bottom: window.innerHeight + 800,
  } as DOMRect);

  try {
    render(
      <Reveal delay={0.1}>
        <p>Later copy</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Later copy").parentElement!;
    expect(wrapper).toHaveAttribute("data-reveal", "pending");
    expect(wrapper.style.getPropertyValue("--reveal-delay")).toBe("0.1s");

    act(() => {
      for (const callback of observerCallbacks) {
        callback([{ isIntersecting: true, target: wrapper }]);
      }
    });
    expect(wrapper).toHaveAttribute("data-reveal", "revealed");
  } finally {
    vi.restoreAllMocks();
  }
});
