import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Preload } from "./preload";
import { EXIT_MS, HOLD_MS, MIN_VISIBLE_MS } from "./progress";

describe("Preload", () => {
  let reduceMotion = false;
  let rafCb: FrameRequestCallback | null = null;
  let now = 0;

  beforeEach(() => {
    reduceMotion = false;
    rafCb = null;
    now = 0;
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce") ? reduceMotion : false,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCb = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("performance", { now: () => now });
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "loading",
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise(() => {}) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders overlay with percent and walker on the track", () => {
    render(<Preload />);
    expect(screen.getByTestId("preload")).toBeInTheDocument();
    expect(screen.getByTestId("preload-percent")).toHaveTextContent(/%/);
    expect(screen.getByTestId("preload-walker")).toBeInTheDocument();
  });

  it("switches data-gait to run after 1.5s while still loading", () => {
    render(<Preload />);

    act(() => {
      now = 0;
      rafCb?.(0);
    });
    act(() => {
      now = 1600;
      rafCb?.(1600);
    });

    expect(screen.getByTestId("preload-walker")).toHaveAttribute("data-gait", "run");
  });

  it("keeps idle gait under reduced motion", () => {
    reduceMotion = true;
    render(<Preload />);
    act(() => {
      now = 1600;
      rafCb?.(1600);
    });
    expect(screen.getByTestId("preload-walker")).toHaveAttribute("data-gait", "idle");
  });

  it("walks to 100%, lifts the curtain, then unmounts once the page is ready", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    Object.defineProperty(document, "readyState", { configurable: true, get: () => "complete" });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    render(<Preload />);
    await act(async () => {});

    for (let t = 0; t <= MIN_VISIBLE_MS + 2000 && screen.getByTestId("preload").getAttribute("aria-busy") === "true"; t += 100) {
      act(() => {
        now = t;
        rafCb?.(t);
      });
    }

    expect(screen.getByTestId("preload-track")).toHaveAttribute("aria-valuenow", "100");
    act(() => vi.advanceTimersByTime(HOLD_MS));
    expect(screen.getByTestId("preload")).toHaveAttribute("data-state", "exit");
    expect(document.documentElement.dataset.preload).toBe("done");
    act(() => vi.advanceTimersByTime(EXIT_MS));
    expect(screen.queryByTestId("preload")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
