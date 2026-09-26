export type NavItem = {
  readonly href: `#${string}`;
  readonly label: string;
};

export type SocialPlatform = "linkedin" | "github";

export type SocialLink = {
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly url: string;
};

export type SiteContact = {
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly location: string;
  readonly availability: string;
  readonly timezone: string;
};

export const contact = {
  name: "Aung Myat Kyaw",
  shortName: "AMK",
  tagline: "Developer",
  location: "Bangkok, Thailand",
  availability: "Open for collaborations",
  timezone: "Asia/Bangkok",
} as const satisfies SiteContact;

export const navigation = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
] as const satisfies readonly NavItem[];

export const socials = [
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/leo17/",
  },
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/popey17",
  },
] as const satisfies readonly SocialLink[];
