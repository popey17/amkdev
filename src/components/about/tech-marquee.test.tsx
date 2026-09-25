import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { TechItem } from "@/data/tech-stack";

import { TechMarquee } from "./tech-marquee";

const toItems = (names: string[]): TechItem[] => names.map((name) => ({ name }));

let prefersReducedMotion = false;
const mediaListeners = new Set<() => void>();

function setReducedMotion(matches: boolean) {
  prefersReducedMotion = matches;
  for (const listener of mediaListeners) listener();
}

beforeEach(() => {
  prefersReducedMotion = false;
  mediaListeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query.includes("prefers-reduced-motion: reduce")
          ? prefersReducedMotion
          : false;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) =>
        mediaListeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) =>
        mediaListeners.delete(listener),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("labels the stack region without any controls", () => {
  render(<TechMarquee items={toItems(["React", "Next.js"])} />);

  expect(
    screen.getByRole("region", { name: /technology stack/i }),
  ).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("pauses the track while a mouse hovers the rail", () => {
  render(<TechMarquee items={toItems(["React", "Next.js"])} />);

  const track = screen.getByTestId("tech-marquee-track");
  const rail = track.parentElement!.parentElement!;
  expect(track.style.animationPlayState).toBe("running");

  fireEvent.pointerEnter(rail, { pointerType: "mouse" });
  expect(track.style.animationPlayState).toBe("paused");

  fireEvent.pointerLeave(rail, { pointerType: "mouse" });
  expect(track.style.animationPlayState).toBe("running");
});

it("keeps moving under touch so a tap does not freeze it", () => {
  render(<TechMarquee items={toItems(["React"])} />);

  const track = screen.getByTestId("tech-marquee-track");
  fireEvent.pointerEnter(track.parentElement!.parentElement!, { pointerType: "touch" });
  expect(track.style.animationPlayState).toBe("running");
});

it("exposes one assistive list while hiding duplicated visual lists", () => {
  render(<TechMarquee items={toItems(["React", "Next.js", "TypeScript"])} />);

  const accessibleLists = screen
    .getAllByRole("list")
    .filter((list) => list.closest('[aria-hidden="true"]') === null);

  expect(accessibleLists).toHaveLength(1);
  expect(within(accessibleLists[0]!).getAllByRole("listitem")).toHaveLength(3);
  expect(accessibleLists[0]).toHaveTextContent("React");
  expect(accessibleLists[0]).toHaveTextContent("Next.js");
  expect(accessibleLists[0]).toHaveTextContent("TypeScript");

  const hiddenLists = screen
    .getAllByRole("list", { hidden: true })
    .filter((list) => list.closest('[aria-hidden="true"]') !== null);
  expect(hiddenLists.length).toBeGreaterThanOrEqual(2);
});

it("builds two identical lanes that each repeat the skills four times without a seam spacer", () => {
  const skills = ["React", "Next.js"];
  render(<TechMarquee items={toItems(skills)} />);

  const track = screen.getByTestId("tech-marquee-track");
  const lanes = within(track).getAllByTestId("tech-marquee-lane");

  expect(lanes).toHaveLength(2);
  expect(track).toHaveAttribute("data-marquee-lanes", "2");
  expect(within(track).queryAllByTestId("tech-marquee-seam-spacer")).toHaveLength(0);

  for (const lane of lanes) {
    expect(lane).toHaveAttribute("aria-hidden", "true");
    const items = within(lane).getAllByRole("listitem", { hidden: true });
    expect(items.map((item) => item.textContent)).toEqual([
      ...skills,
      ...skills,
      ...skills,
      ...skills,
    ]);
  }
  expect(lanes[0]!.innerHTML).toBe(lanes[1]!.innerHTML);
});

it("stops the animation when reduced motion is preferred", () => {
  prefersReducedMotion = true;

  render(<TechMarquee items={toItems(["React", "Next.js"])} />);

  const track = screen.getByTestId("tech-marquee-track");
  expect(track).toHaveAttribute("data-reduced-motion", "true");
  expect(track).not.toHaveClass("animate-tech-marquee");
  expect(track.style.animationPlayState).toBe("paused");
});

it("reacts to reduced-motion preference changes after mount", () => {
  render(<TechMarquee items={toItems(["React"])} />);
  const track = screen.getByTestId("tech-marquee-track");
  expect(track).toHaveAttribute("data-reduced-motion", "false");

  act(() => setReducedMotion(true));

  expect(track).toHaveAttribute("data-reduced-motion", "true");
  expect(track.style.animationPlayState).toBe("paused");
});

it("hydrates without mismatch and then reflects reduced motion", async () => {
  prefersReducedMotion = true;
  const serverHtml = renderToString(<TechMarquee items={toItems(["React"])} />);

  expect(serverHtml).toContain('data-reduced-motion="false"');

  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.append(container);
  const recoverableErrors: unknown[] = [];

  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, <TechMarquee items={toItems(["React"])} />, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
  });

  expect(within(container).getByTestId("tech-marquee-track")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  expect(recoverableErrors).toEqual([]);
  expect(
    consoleError.mock.calls.filter((call) => /hydrat/i.test(String(call[0]))),
  ).toEqual([]);

  act(() => root?.unmount());
  container.remove();
});

it("renders brand and generic icons ahead of each label, hidden from assistive tech", () => {
  render(
    <TechMarquee
      items={[
        { name: "React", icon: { kind: "brand", title: "React", path: "M0 0h24v24H0z" } },
        { name: "Cloud Services", icon: { kind: "generic", name: "cloud" } },
        { name: "Plain" },
      ]}
    />,
  );

  const [lane] = screen.getAllByTestId("tech-marquee-lane");
  const [react, cloud, plain] = within(lane!).getAllByRole("listitem", { hidden: true });

  expect(react!.firstElementChild?.querySelector("path")).toHaveAttribute("d", "M0 0h24v24H0z");
  expect(react).toHaveTextContent(/^React$/);
  expect(cloud!.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(plain!.querySelector("svg")).toBeNull();
});
