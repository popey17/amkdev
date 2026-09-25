import * as simpleIcons from "simple-icons";

import rawTechStack from "./tech-stack.json";

/**
 * Generic, non-brand icons a JSON entry can ask for with `"lucide:<name>"`.
 * The client maps each name to a lucide component (see tech-marquee.tsx).
 */
export const genericTechIcons = [
  "cloud",
  "code",
  "cpu",
  "database",
  "globe",
  "layers",
  "server",
  "sparkles",
  "terminal",
] as const;

export type GenericTechIcon = (typeof genericTechIcons)[number];

export type TechIcon =
  | { readonly kind: "brand"; readonly title: string; readonly path: string }
  | { readonly kind: "generic"; readonly name: GenericTechIcon };

export type TechItem = {
  readonly name: string;
  readonly icon?: TechIcon;
};

// Built once on the server; only the resolved paths reach the client bundle.
const brandIconsBySlug = new Map(
  Object.values(simpleIcons).map((icon) => [icon.slug, icon] as const),
);

function resolveIcon(icon: string, entry: string): TechIcon {
  if (icon.startsWith("lucide:")) {
    const name = icon.slice("lucide:".length);
    if (!(genericTechIcons as readonly string[]).includes(name)) {
      throw new Error(
        `${entry}: unknown generic icon "${icon}". Use one of: ${genericTechIcons.map((n) => `lucide:${n}`).join(", ")}.`,
      );
    }
    return { kind: "generic", name: name as GenericTechIcon };
  }

  const brand = brandIconsBySlug.get(icon);
  if (!brand) {
    throw new Error(
      `${entry}: unknown brand icon "${icon}". Use a slug from https://simpleicons.org (e.g. "react", "nextdotjs").`,
    );
  }
  return { kind: "brand", title: brand.title, path: brand.path };
}

/**
 * Validates tech-stack.json and resolves each icon. Throws with the offending
 * entry so a typo fails the build instead of silently dropping an icon.
 */
export function resolveTechStack(raw: unknown): TechItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("tech-stack.json must be an array of { name, icon? } objects.");
  }

  return raw.map((item: unknown, index) => {
    const entry = `tech-stack.json[${index}]`;
    if (typeof item !== "object" || item === null) {
      throw new Error(`${entry} must be an object with a "name".`);
    }
    const { name, icon } = item as Record<string, unknown>;
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`${entry} needs a non-empty "name" string.`);
    }
    if (icon !== undefined && typeof icon !== "string") {
      throw new Error(`${entry} "icon" must be a string when present.`);
    }
    return icon ? { name, icon: resolveIcon(icon, entry) } : { name };
  });
}

export const techStack = resolveTechStack(rawTechStack);
