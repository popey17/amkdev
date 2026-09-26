import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Contact } from "./contact";
import { LocalTime } from "./local-time";

const clipboard = {
  writeText: vi.fn<() => Promise<void>>(),
};

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  window.matchMedia = () =>
    ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;
  clipboard.writeText.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Contact", () => {
  it("copies a configured email and announces success", async () => {
    clipboard.writeText.mockResolvedValue(undefined);

    render(<Contact email="owner@example.test" />);
    fireEvent.click(screen.getByRole("button", { name: /copy email/i }));

    expect(clipboard.writeText).toHaveBeenCalledWith("owner@example.test");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Email copied."),
    );
  });

  it("selects the visible email and announces the fallback on rejection", async () => {
    clipboard.writeText.mockRejectedValue(new Error("permission denied"));
    const selectNodeContents = vi.fn();
    const addRange = vi.fn();
    vi.spyOn(window, "getSelection").mockReturnValue({
      addRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);
    vi.spyOn(document, "createRange").mockReturnValue({
      selectNodeContents,
    } as unknown as Range);

    render(<Contact email="owner@example.test" />);
    const email = screen.getByText("owner@example.test");
    fireEvent.click(screen.getByRole("button", { name: /copy email/i }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Copy unavailable — select the email address.",
      ),
    );
    expect(selectNodeContents).toHaveBeenCalledWith(email);
    expect(addRange).toHaveBeenCalledOnce();
  });

  it("uses the selection fallback when the Clipboard API is missing", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const selectNodeContents = vi.fn();
    const addRange = vi.fn();
    vi.spyOn(window, "getSelection").mockReturnValue({
      addRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection);
    vi.spyOn(document, "createRange").mockReturnValue({
      selectNodeContents,
    } as unknown as Range);

    render(<Contact email="owner@example.test" />);
    const email = screen.getByText("owner@example.test");
    fireEvent.click(screen.getByRole("button", { name: /copy email/i }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Copy unavailable — select the email address.",
      ),
    );
    expect(selectNodeContents).toHaveBeenCalledWith(email);
    expect(addRange).toHaveBeenCalledOnce();
  });

  it.each([
    undefined,
    "",
    "not-an-email",
    "owner@example",
    "owner@example..com",
    "owner@.example.com",
  ])(
    "uses verified LinkedIn as the primary contact for %p",
    (email) => {
      render(<Contact email={email} />);

      const primary = screen.getByRole("link", { name: /contact on linkedin/i });
      expect(primary).toHaveAttribute(
        "href",
        "https://www.linkedin.com/in/leo17/",
      );
      expect(screen.queryByRole("button", { name: /copy email/i })).toBeNull();
      if (email) expect(screen.queryByText(email)).toBeNull();
    },
  );

  it("renders verified social links with safe external-link attributes", () => {
    render(<Contact />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer noopener");
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
    }
  });
});

describe("LocalTime", () => {
  it("formats Bangkok time across a UTC date boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T20:30:00Z"));

    render(<LocalTime />);

    expect(screen.getByText("03:30 GMT+7")).toBeVisible();
  });

  it("hydrates with Thailand time and updates only once per minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T12:00:00Z"));
    render(<LocalTime />);

    expect(screen.getByText("19:00 GMT+7")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(screen.getByText("19:00 GMT+7")).toBeVisible();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("19:01 GMT+7")).toBeVisible();
  });

  it("aligns the first update to the next minute boundary, then ticks every minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T12:00:45Z"));
    render(<LocalTime />);

    expect(screen.getByText("19:00 GMT+7")).toBeVisible();

    act(() => vi.advanceTimersByTime(14_999));
    expect(screen.getByText("19:00 GMT+7")).toBeVisible();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("19:01 GMT+7")).toBeVisible();

    act(() => vi.advanceTimersByTime(59_999));
    expect(screen.getByText("19:01 GMT+7")).toBeVisible();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("19:02 GMT+7")).toBeVisible();
  });

  it("exposes a machine-readable Bangkok date-time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T20:30:12Z"));
    render(<LocalTime />);

    expect(screen.getByText("03:30 GMT+7")).toHaveAttribute(
      "datetime",
      "2026-09-25T03:30+07:00",
    );
  });

  it.each([
    ["before the first boundary", 10_000],
    ["after the minute interval starts", 75_000],
  ])("cleans up every pending timer on unmount %s", (_label, elapsed) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T12:00:30Z"));
    const { unmount } = render(<LocalTime />);

    act(() => vi.advanceTimersByTime(elapsed));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
