import { describe, expect, it } from "vitest";
import {
  isLocalProjectImageSrc,
  projects,
  type Project,
  type ProjectImage,
} from "./projects";

const localImageSrc: ProjectImage["src"] = "/images/projects/chatbot.webp";
// @ts-expect-error Remote project images are not approved.
const remoteImageSrc: ProjectImage["src"] = "https://example.com/chatbot.webp";

const imageProject = {
  ...projects[0],
  image: {
    src: "/images/projects/chatbot.webp",
    alt: "Chatbot conversation interface",
    position: "50% 35%",
  },
  overlay: {
    eyebrow: "AI workspace",
    caption: "Focused conversations, designed for speed.",
  },
} satisfies Project;

const projectsWithImages: readonly Project[] = [...projects, imageProject];

describe("project data", () => {
  it("has unique slugs and secure external URLs", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.liveUrl).toMatch(/^https:\/\//);
      expect(project.sourceUrl).toMatch(/^https:\/\/github\.com\//);
    }
  });

  it("validates every configured project image", () => {
    let configuredCount = 0;

    for (const project of projectsWithImages) {
      if (!project.image) continue;

      configuredCount += 1;
      expect(isLocalProjectImageSrc(project.image.src)).toBe(true);
      expect(project.image.alt.length).toBeGreaterThan(0);
    }

    expect(configuredCount).toBeGreaterThan(0);
  });

  it("rejects remote and protocol-relative project image sources", () => {
    expect(isLocalProjectImageSrc(localImageSrc)).toBe(true);
    expect(isLocalProjectImageSrc(remoteImageSrc)).toBe(false);
    expect(isLocalProjectImageSrc("http://example.com/chatbot.webp")).toBe(false);
    expect(isLocalProjectImageSrc("//example.com/chatbot.webp")).toBe(false);
  });

  it("accepts optional image and overlay metadata", () => {
    expect(imageProject.overlay?.eyebrow).toBe("AI workspace");
  });
});
