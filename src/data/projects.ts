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
  readonly liveUrl?: string;
  readonly sourceUrl: string;
  readonly visual: ProjectVisual;
  readonly featured: boolean;
  readonly image?: ProjectImage;
  readonly overlay?: ProjectOverlay;
};

export const projects = [
  {
    slug: "website-crawler",
    title: "CrawlX",
    summary:
      "Concurrent Go CLI crawler using a worker pool, channels, and mutex-protected visited tracking — reports broken links with referrers and is race-checked with Go’s -race flag.",
    year: "2026",
    tags: ["Go", "CLI", "Concurrency"],
    sourceUrl: "https://github.com/popey17/crawlX",
    visual: "type",
    featured: true,
    image: {
      src: "/images/projects/crawlX.webp",
      alt: "CrawlX",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
    },
  },
  {
    slug: "go-url-shortener",
    title: "miniLink",
    summary:
      "REST API that creates short codes, validates URLs, and redirects with click tracking — persisted in PostgreSQL via pgx, with a live React UI.",
    year: "2026",
    tags: ["Go", "PostgreSQL"],
    liveUrl: "https://minilink.amkdev.com/",
    sourceUrl: "https://github.com/popey17/urlshortener",
    visual: "orb",
    featured: true,
    image: {
      src: "/images/projects/miniLink.webp",
      alt: "miniLink URL shortener",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
    },
  },
  {
    slug: "personal-notes-api",
    title: "Personal Notes API",
    summary:
      "Notes API with register/login, bcrypt hashing, and JWT-protected routes — ownership-scoped so notes stay private to each user, with SQL migrations and auth unit tests.",
    year: "2026",
    tags: ["Go", "PostgreSQL", "JWT"],
    liveUrl: "https://ubinote-seven.vercel.app",
    sourceUrl: "https://github.com/popey17/Ubinote",
    visual: "reveal",
    featured: true,
    image: {
      src: "/images/projects/ubinote.webp",
      alt: "Ubinote",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
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
      eyebrow: "Personal Project",
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
    visual: "dragon",
    featured: true,
    image: {
      src: "/images/projects/leoChat.webp",
      alt: "Leo's Personal AI Chatbot",
      position: "50% 100%",
    },
    overlay: {
      eyebrow: "Personal Project",
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
    },
  },
] as const satisfies readonly Project[];
