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
    /i like building things that feel good to use\.?/i,
  );
  expect(
    screen.getByText(
      /i'm aung myat kyaw, a developer\. i build digital products and interactive experiences/i,
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/bangkok/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/front-end|full-stack/i)).not.toBeInTheDocument();
  expect(
    screen.getByText(
      /digital products, interactive experiences, and experiments that stay simple to use/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /turn ideas into things that feel clear, useful, and enjoyable/i,
    ),
  ).toBeInTheDocument();
});
