import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { MagneticLink } from "@/components/ui/magnetic-link";
import { contact } from "@/data/site";
import { SiteHeader } from "./site-header";

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
  window.localStorage.clear();
  document.getElementById("top")?.remove();
});

function stubMediaQueries(initial: Record<string, boolean>) {
  const state = { ...initial };
  const listeners = new Map<string, Set<() => void>>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return state[query] ?? false;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) =>
        listeners.get(query)?.delete(listener),
    })),
  );
  return (query: string, matches: boolean) => {
    state[query] = matches;
    for (const listener of listeners.get(query) ?? []) listener();
  };
}

it("toggles and stores a light parchment theme with accurate pressed state", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);

  const toggle = screen.getByRole("button", { name: "Light theme" });
  expect(toggle).toHaveAttribute("aria-pressed", "false");

  await user.click(toggle);
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(window.localStorage.getItem("portfolio-theme")).toBe("light");
  expect(toggle).toHaveAttribute("aria-pressed", "true");

  await user.click(toggle);
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(window.localStorage.getItem("portfolio-theme")).toBe("dark");
  expect(toggle).toHaveAttribute("aria-pressed", "false");
});

it("reflects a theme applied before hydration", () => {
  document.documentElement.dataset.theme = "light";
  render(<SiteHeader />);

  expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("condenses once the hero leaves the viewport", () => {
  const callbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        callbacks.push(callback);
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  const hero = document.createElement("section");
  hero.id = "top";
  document.body.append(hero);

  render(<SiteHeader />);
  const header = screen.getByRole("banner");
  const bar = screen.getByTestId("header-bar");
  const headerClass = header.className;
  expect(header).toHaveAttribute("data-condensed", "false");
  // Sticky box matches the condensed bar; the margin restores the 80px layout.
  expect(header).toHaveClass("h-14", "mb-6");
  expect(bar).toHaveClass("h-20");

  act(() => callbacks.forEach((callback) => callback([{ isIntersecting: false }])));
  expect(header).toHaveAttribute("data-condensed", "true");
  expect(header.className).toBe(headerClass);
  expect(bar).toHaveClass("h-14");
  expect(bar).toHaveClass("motion-reduce:transition-none");

  act(() => callbacks.forEach((callback) => callback([{ isIntersecting: true }])));
  expect(header).toHaveAttribute("data-condensed", "false");
});

it("closes the drawer without focusing the hidden trigger when crossing to desktop", async () => {
  const desktopQuery = "(min-width: 64rem)";
  const setMedia = stubMediaQueries({ [desktopQuery]: false });
  const user = userEvent.setup();
  render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: /open menu/i });

  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();

  act(() => setMedia(desktopQuery, true));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).not.toHaveFocus();
  expect(screen.getByRole("link", { name: /home/i })).toHaveFocus();
  expect(document.body.style.overflow).toBe("");
});

it("opens, closes, and restores focus", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: /open menu/i });
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it("focuses the first drawer link and wraps focus at both boundaries", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);

  await user.click(screen.getByRole("button", { name: /open menu/i }));

  const drawer = screen.getByRole("dialog", { name: /navigation/i });
  const firstLink = within(drawer).getByRole("link", { name: "About" });
  expect(firstLink).toHaveFocus();

  const firstFocusable = within(drawer).getByRole("button", {
    name: /light theme/i,
  });
  const lastFocusable = within(drawer).getByRole("link", { name: "Email" });

  firstFocusable.focus();
  await user.tab({ shift: true });
  expect(lastFocusable).toHaveFocus();

  await user.tab();
  expect(firstFocusable).toHaveFocus();
});

it("portals the mobile drawer to the document body", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);

  await user.click(screen.getByRole("button", { name: /open menu/i }));

  expect(screen.getByRole("dialog", { name: /navigation/i }).parentElement).toBe(
    document.body,
  );
});

it("keeps the non-interactive availability indicator neutral", () => {
  render(<SiteHeader />);

  const label = screen.getByText(contact.availability);
  const indicator = label.previousElementSibling;

  expect(indicator).toHaveClass("bg-ink-muted");
  expect(indicator).not.toHaveClass("bg-accent");
});

it("preserves magnetic movement when consumer styles are supplied", async () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <MagneticLink href="#target" style={{ color: "rgb(255, 0, 0)" }}>
      Target
    </MagneticLink>,
  );
  const link = screen.getByRole("link", { name: "Target" });

  Object.defineProperty(link, "getBoundingClientRect", {
    value: () => ({
      bottom: 40,
      height: 40,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    }),
  });
  fireEvent.pointerMove(link, { clientX: 90, clientY: 30 });

  expect(link).toHaveStyle({ color: "rgb(255, 0, 0)" });
  await waitFor(() => expect(link.style.transform).toContain("translateX"));
});

it("closes on route selection", async () => {
  const user = userEvent.setup();
  render(<SiteHeader />);

  await user.click(screen.getByRole("button", { name: /open menu/i }));
  const drawer = screen.getByRole("dialog", { name: /navigation/i });
  await user.click(within(drawer).getByRole("link", { name: "Work" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("restores body scrolling when closed or unmounted", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: /open menu/i });

  await user.click(trigger);
  expect(document.body.style.overflow).toBe("hidden");
  await user.keyboard("{Escape}");
  expect(document.body.style.overflow).toBe("");

  await user.click(trigger);
  unmount();
  expect(document.body.style.overflow).toBe("");
});
