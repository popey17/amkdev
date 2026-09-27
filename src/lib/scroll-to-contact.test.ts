import { afterEach, describe, expect, it, vi } from "vitest";

import {
  contactScrollBehavior,
  prefersReducedMotion,
  scrollToContact,
} from "./scroll-to-contact";

describe("scrollToContact", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("scrolls to the document end so the sticky footer can uncover", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    vi.stubGlobal("innerHeight", 800);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 3200,
    });

    scrollToContact("smooth");

    expect(scrollTo).toHaveBeenCalledWith({ top: 2400, behavior: "smooth" });
  });

  it("respects reduced motion for contact link behavior", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    );
    expect(prefersReducedMotion()).toBe(true);
    expect(contactScrollBehavior()).toBe("auto");
  });
});
