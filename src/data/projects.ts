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
  readonly caption?: string;
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
    slug: "go-url-shortener",
    title: "URL Shortener",
    summary: "A URL shortener built with Go and PostgreSQL.",
    year: "2026",
    tags: ["Go", "PostgreSQL"],
    liveUrl: "https://minilink.amkdev.com/",
    sourceUrl: "https://github.com/popey17/urlshortener",
    visual: "orb",
    featured: true,
    image: {
      src: "/images/projects/miniLink.webp",
      alt: "miniLink",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
      // caption: "A URL shortener built with Go and PostgreSQL.",
    },
  },
  {
    slug: "personal-website",
    title: "My Personal Website",
    summary: "A personal website built with Next.js and Tailwind CSS.",
    year: "2026",
    tags: ["Next.js", "Tailwind CSS"],
    liveUrl: "https://amkdev.com/",
    sourceUrl: "https://github.com/popey17/amkdev",
    visual: "orb",
    featured: true,
    image: {
      src: "/images/projects/img_portfolio.webp",
      alt: "amkdev",
      position: "0% 100%",
    },
    overlay: {
      eyebrow: "Personal Project"
      // caption: "A personal website built with Next.js and Tailwind CSS.",
    },
  },
  {
    slug: "personal-ai-chatbot",
    title: "Leo's Personal AI Chatbot",
    summary:
      "A conversational AI workspace designed around fast, focused personal assistance.",
    year: "2026",
    tags: ["Next.js", "AI", "React"],
    liveUrl: "https://chat.amkdev.com/",
    sourceUrl: "https://github.com/popey17/personal-chatbot",
    visual: "orb",
    featured: true,
    image: {
      src: "/images/projects/leoChat.webp",
      alt: "Leo's Personal AI Chatbot",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project"
      // caption: "A conversational AI workspace designed around fast, focused personal assistance.",
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
      src: "/images/projects/img_3js.webp",
      alt: "3js Explode Text",
      position: "0% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
      // caption: "A short project highlight.",
    },
  }
] as const satisfies readonly Project[];
