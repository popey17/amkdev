import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }) as MediaQueryList,
  );
});

afterAll(() => vi.unstubAllGlobals());

import { About } from "./about";

it("positions the developer without front-end or full-stack role titles", () => {
  render(<About />);

  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    /i like shipping apis that stay clear and solid\.?/i,
  );
  expect(
    screen.getByText(
      /i'm aung myat kyaw, a developer\. after 3\+ years shipping production web apps/i,
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/bangkok/i)).not.toBeInTheDocument();
  expect(
    screen.queryByText(/junior|backend|front-end|frontend|full-stack/i),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(
      /go apis, postgresql, and concurrency patterns that stay race-safe/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /own features end-to-end — from api design and data ownership to ui integration/i,
    ),
  ).toBeInTheDocument();
});
