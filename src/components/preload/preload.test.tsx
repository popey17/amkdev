import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Preload } from "./preload";

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
});
