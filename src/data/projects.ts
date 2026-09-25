export type ProjectVisual = "orb" | "type" | "reveal" | "dragon";

export type ProjectImage = {
  readonly src: `/${string}`;
  readonly alt: string;
  readonly position?: string;
};

export function isLocalProjectImageSrc(
  value: string,
): value is ProjectImage["src"] {
  return value.startsWith("/") && !value.startsWith("//");
}

export type ProjectOverlay = {
  readonly eyebrow: string;
  readonly caption: string;
};

export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly year: string;
  readonly tags: readonly string[];
  readonly liveUrl: string;
  readonly sourceUrl: string;
  readonly visual: ProjectVisual;
  readonly featured: boolean;
  readonly image?: ProjectImage;
  readonly overlay?: ProjectOverlay;
};

export const projects = [
  {
    slug: "personal-ai-chatbot",
    title: "Leo's Personal AI Chatbot",
    summary:
      "A conversational AI workspace designed around fast, focused personal assistance.",
    year: "2026",
    tags: ["Next.js", "AI", "React"],
    liveUrl: "https://chat.aungmyatkyaw.com/",
    sourceUrl: "https://github.com/popey17/personal-chatbot",
    visual: "orb",
    featured: true,
    image: {
      src: "/images/projects/example.webp",
      alt: "Description of the project interface",
      position: "50% 35%",
    },
    overlay: {
      eyebrow: "Case study",
      caption: "A short project highlight.",
    },
  },
  {
    slug: "threejs-explode-text",
    title: "Three.js Explode Text",
    summary:
      "An interactive typographic experiment that turns WebGL motion into a tactile interface.",
    year: "2024",
    tags: ["Three.js", "WebGL", "GSAP"],
    liveUrl: "https://3js-explode-text.vercel.app/",
    sourceUrl: "https://github.com/popey17/3js-Explode-Text",
    visual: "type",
    featured: true,
    image: {
      src: "/images/projects/example.webp",
      alt: "Description of the project interface",
      position: "50% 35%",
    },
    overlay: {
      eyebrow: "Case study",
      caption: "A short project highlight.",
    },
  },
  {
    slug: "award-winning-image-reveal",
    title: "Award Winning Image Reveal",
    summary:
      "A cinematic hover study exploring image distortion, masking, and responsive motion.",
    year: "2024",
    tags: ["JavaScript", "WebGL", "Interaction"],
    liveUrl: "https://popey17.github.io/hover_preview/",
    sourceUrl: "https://github.com/popey17/hover_preview",
    visual: "reveal",
    featured: true,
    image: {
      src: "/images/projects/example.webp",
      alt: "Description of the project interface",
      position: "50% 35%",
    },
    overlay: {
      eyebrow: "Case study",
      caption: "A short project highlight.",
    },
  },
  {
    slug: "threejs-dragon",
    title: "Three.js Dragon",
    summary:
      "A real-time 3D character study built for the browser with responsive camera behavior.",
    year: "2024",
    tags: ["Three.js", "3D", "WebGL"],
    liveUrl: "https://popey17.github.io/3js-Dragon/",
    sourceUrl: "https://github.com/popey17/3js-Dragon",
    visual: "dragon",
    featured: true,
    image: {
      src: "/images/projects/example.webp",
      alt: "Description of the project interface",
      position: "50% 35%",
    },
    overlay: {
      eyebrow: "Case study",
      caption: "A short project highlight.",
    },
  },
] as const satisfies readonly Project[];
