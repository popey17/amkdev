import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";

const { sceneState } = vi.hoisted(() => ({
  sceneState: { shouldThrow: false },
}));

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
});

afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  sceneState.shouldThrow = false;
  vi.restoreAllMocks();
});

vi.mock("next/dynamic", () => ({
  default: () => function MockScene() {
    if (sceneState.shouldThrow) throw new Error("WebGL unavailable");
    return null;
  },
}));

import { Hero } from "./hero";

it("states the positioning headline and exposes primary actions", () => {
  render(<Hero />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    /i build digital experiences\.?/i,
  );
  expect(
    screen.getByText(
      /i create thoughtful, reliable digital experiences where design, interaction, and technology work together/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /view selected work/i }),
  ).toHaveAttribute("href", "#work");
  expect(
    screen.getByRole("link", { name: /let's work together/i }),
  ).toHaveAttribute("href", "#contact");
});

it("server-renders the hero heading and actions without hidden opacity", () => {
  const html = renderToString(<Hero />);
  const container = document.createElement("div");
  container.innerHTML = html;

  const heading = container.querySelector("h1")!;
  expect(heading).not.toBeNull();
  for (let node: HTMLElement | null = heading; node; node = node.parentElement) {
    expect(node.getAttribute("style") ?? "").not.toMatch(/opacity/);
    expect(node).not.toHaveAttribute("data-reveal", "pending");
  }
  const actions = container.querySelector('a[href="#work"]')!;
  for (let node: HTMLElement | null = actions as HTMLElement; node; node = node.parentElement) {
    expect(node.getAttribute("style") ?? "").not.toMatch(/opacity/);
  }
});

it("keeps decorative visuals hidden while the CSS fallback remains present", () => {
  render(<Hero />);

  expect(screen.getByTestId("hero-orb-fallback")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

it("preserves the CSS fallback when the WebGL scene fails", () => {
  sceneState.shouldThrow = true;
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  render(<Hero />);

  expect(screen.getByTestId("hero-orb-fallback")).toBeInTheDocument();
});
