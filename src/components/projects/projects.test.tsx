import { render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

import { projects, type Project } from "@/data/projects";

import { getProjectPlacement, Projects } from "./projects";

beforeAll(() => {
  window.matchMedia = () =>
    ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;

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

// The first project ships with a photo; fallback tests need one without.
const { image: _image, overlay: _overlay, ...artworkOnlyProject } = projects[0];
void _image;
void _overlay;

it("renders verified project actions in an ordered section", () => {
  render(<Projects projects={projects.slice(0, 1)} />);

  expect(
    screen.getByRole("heading", { name: /selected work/i }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: /view live/i })).toHaveAttribute(
    "href",
    "https://chat.aungmyatkyaw.com/",
  );
  expect(screen.getByRole("link", { name: /source code/i })).toHaveAttribute(
    "href",
    "https://github.com/popey17/personal-chatbot",
  );
});

it("renders all four visual directions", () => {
  render(<Projects projects={projects} />);

  for (const project of projects) {
    expect(screen.getByTestId(`project-visual-${project.visual}`)).toHaveAttribute(
      "data-visual",
      project.visual,
    );
  }
});

it.each([
  [
    1,
    ["@min-[48rem]:col-span-8 @min-[48rem]:col-start-3"],
  ],
  [
    2,
    [
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
    ],
  ],
  [
    4,
    [
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-5",
      "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
    ],
  ],
  [
    5,
    [
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-5",
      "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
      "@min-[48rem]:col-span-8 @min-[48rem]:col-start-3",
    ],
  ],
  [
    7,
    [
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-5",
      "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-8 @min-[48rem]:col-start-3",
    ],
  ],
  [
    8,
    [
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-5",
      "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
      "@min-[48rem]:col-span-7",
      "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
      "@min-[48rem]:col-span-5",
      "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
    ],
  ],
])("places %i projects in complete editorial rows", (count, placements) => {
  expect(
    Array.from({ length: count }, (_, index) =>
      getProjectPlacement(index, count),
    ),
  ).toEqual(placements);
});

it("opens verified external project links safely", () => {
  render(<Projects projects={projects.slice(0, 1)} />);

  const card = screen.getByRole("article", {
    name: projects[0].title,
  });

  for (const link of within(card).getAllByRole("link")) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  }
});

it("scales an inner artwork layer while the clipped frame stays fixed", () => {
  render(<Projects projects={projects} />);

  for (const project of projects) {
    const frame = screen.getByTestId(`project-visual-${project.visual}`);
    const layer = within(frame).getByTestId("project-artwork-layer");

    expect(frame).toHaveClass("overflow-clip");
    expect(frame.className).not.toMatch(/scale-/);
    expect(layer.parentElement).toHaveAttribute("data-testid", "project-artwork-parallax");
    expect(layer.parentElement?.parentElement).toBe(frame);
    expect(layer.className).toMatch(/group-hover:scale-\[1\.04\]/);
    expect(layer).toHaveClass("motion-reduce:transition-none");
  }
});

it("renders configured project images and readable overlay content", () => {
  const imageProject = {
    ...projects[0],
    image: {
      src: "/images/chatbot-interface.jpg",
      alt: "Chatbot interface",
      position: "30% 40%",
    },
    overlay: {
      eyebrow: "AI workspace",
      caption: "Fast, focused conversations.",
    },
  } satisfies Project;

  render(<Projects projects={[imageProject]} />);

  const frame = screen.getByTestId(`project-visual-${imageProject.visual}`);
  const layer = within(frame).getByTestId("project-artwork-layer");
  const image = screen.getByRole("img", { name: "Chatbot interface" });
  const overlay = within(frame).getByTestId("project-artwork-overlay");

  expect(image).toBeVisible();
  expect(image.parentElement).toBe(layer);
  expect(image).toHaveAttribute(
    "sizes",
    "(min-width: 1024px) 67vw, 100vw",
  );
  expect(image).toHaveStyle({ objectPosition: "30% 40%" });
  expect(overlay).toHaveClass("bg-linear-to-t");
  expect(overlay).toHaveClass("from-surface/95", "via-surface/75", "text-ink");
  expect(overlay.parentElement).toBe(frame);
  expect(layer).not.toContainElement(overlay);
  expect(within(overlay).getByText("AI workspace")).toHaveClass(
    "text-ink-muted",
  );
  expect(within(overlay).getByText("AI workspace")).toBeVisible();
  expect(
    within(overlay).getByText("Fast, focused conversations."),
  ).toBeVisible();
  expect(frame).not.toHaveAttribute("aria-hidden");
});

it("rejects a remote project image at runtime and keeps the fallback", () => {
  const unsafeImageProject = {
    ...artworkOnlyProject,
    image: {
      src: "https://example.com/chatbot-interface.jpg",
      alt: "Remote chatbot interface",
    },
  } as unknown as Project;

  render(<Projects projects={[unsafeImageProject]} />);

  const frame = screen.getByTestId(
    `project-visual-${unsafeImageProject.visual}`,
  );

  expect(
    within(frame).queryByRole("img", { name: "Remote chatbot interface" }),
  ).not.toBeInTheDocument();
  expect(frame).toHaveAttribute("aria-hidden", "true");
  expect(within(frame).getByText("INTELLIGENCE / 01")).toBeInTheDocument();
});

it("keeps generated artwork as an accessible-hidden image fallback", () => {
  render(<Projects projects={[artworkOnlyProject]} />);

  const frame = screen.getByTestId(`project-visual-${artworkOnlyProject.visual}`);

  expect(within(frame).queryByRole("img")).not.toBeInTheDocument();
  expect(frame).toHaveAttribute("aria-hidden", "true");
  expect(within(frame).getByText("INTELLIGENCE / 01")).toBeInTheDocument();
  expect(
    within(frame).queryByTestId("project-artwork-overlay"),
  ).not.toBeInTheDocument();
  expect(
    within(frame).queryByTestId("project-artwork-veil"),
  ).not.toBeInTheDocument();
});

it("tints project photos in the theme colour and layers a hover colour reveal", () => {
  render(<Projects projects={projects.slice(0, 1)} />);

  const frame = screen.getByTestId(`project-visual-${projects[0].visual}`);
  const veil = within(frame).getByTestId("project-artwork-veil");
  const reveal = within(frame).getByTestId("project-artwork-reveal");

  expect(veil).toHaveClass("project-veil", "bg-surface/30");
  expect(veil.parentElement).toBe(frame);
  expect(reveal).toHaveClass("project-reveal");
  expect(reveal).toHaveAttribute("aria-hidden", "true");
  expect(reveal.parentElement).toBe(frame);
  // The colour copy is decorative, so only the base photo is announced.
  expect(within(frame).getAllByRole("img")).toHaveLength(1);
  expect(within(frame).getByRole("img")).toHaveClass("project-photo");
});

it("omits overlay content when an image has no overlay configured", () => {
  const imageProject = {
    ...artworkOnlyProject,
    image: {
      src: "/images/chatbot-interface.jpg",
      alt: "Chatbot interface",
    },
  } satisfies Project;

  render(<Projects projects={[imageProject]} />);

  const frame = screen.getByTestId(`project-visual-${imageProject.visual}`);
  const image = screen.getByRole("img", { name: "Chatbot interface" });

  expect(image).toHaveStyle({ objectPosition: "50% 50%" });
  expect(
    within(frame).queryByTestId("project-artwork-overlay"),
  ).not.toBeInTheDocument();
  expect(frame).not.toHaveAttribute("aria-hidden");
});

it("renders nothing when there are no projects", () => {
  const { container } = render(<Projects projects={[]} />);

  expect(container).toBeEmptyDOMElement();
  expect(
    screen.queryByRole("heading", { name: /selected work/i }),
  ).not.toBeInTheDocument();
});

it("does not render invalid or non-HTTPS project actions", () => {
  const unsafeProject = {
    ...projects[0],
    liveUrl: "http://example.com/insecure",
    sourceUrl: "not-a-url",
  };

  render(<Projects projects={[unsafeProject]} />);

  const card = screen.getByRole("article", { name: unsafeProject.title });
  expect(within(card).queryByRole("link")).not.toBeInTheDocument();
});
