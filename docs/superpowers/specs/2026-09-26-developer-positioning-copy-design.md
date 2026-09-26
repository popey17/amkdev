# Developer Positioning Copy — Design Spec

**Date:** 2026-09-26  
**Status:** Approved for planning  
**Approach:** Copy-only reposition (Approach 1) with About personality heading (from Approach 2)

## Goal

Reposition the portfolio so Aung Myat Kyaw reads as a **Developer** generally — not specifically as a Front-end or Full-stack Developer. Projects demonstrate technical depth; hero and about stay personal, modern, and flexible for web, backend, AI, 3D/WebGL, and other future work.

## Non-goals

- Visual redesign, new sections, or motion-system changes (except a minimal hero H1 layout tweak if required for a single headline).
- Rewriting project blurbs, tech marquee content, or Contact CTAs.
- Removing location from Contact or logo (location stays off About body copy only).

## Copy map

### Hero (`src/components/hero/hero.tsx`)

| Surface | Copy |
| --- | --- |
| H1 | I build digital experiences. |
| Supporting | I create thoughtful, reliable digital experiences where design, interaction, and technology work together. |

Keep existing CTAs, eyebrow (`Portfolio / 2026`), and hero scene. Replace the two role lines (`Front-end developer.` / `Full-stack developer.`) with the new H1. Adapt parallax so a single headline still feels intentional — do not keep a second muted “role” line.

### About (`src/components/about/about.tsx`)

| Surface | Copy |
| --- | --- |
| H2 | I like building things that feel good to use. |
| Bio | I'm Aung Myat Kyaw, a developer. I build digital products and interactive experiences, combining thoughtful design with technology to create things that are useful, engaging, and reliable. |
| Focus | Digital products, interactive experiences, and experiments that stay simple to use. |
| Approach | Turn ideas into things that feel clear, useful, and enjoyable — without losing reliability. |

Do **not** mention Bangkok or location in About copy. Location remains in Contact (“Based in”) and logo wordmark (`Developer / Bangkok`).

### Site data & SEO

| Surface | File | Copy |
| --- | --- | --- |
| Tagline | `src/data/site.ts` | Developer |
| Page title | `src/app/layout.tsx` | Aung Myat Kyaw — Developer |
| Meta description | `src/app/layout.tsx` | Aung Myat Kyaw is a developer building thoughtful digital products and interactive experiences. |

### Leave unchanged

- Logo wordmark: `Developer / Bangkok`
- Contact location block and availability
- Projects section heading (`Selected work`) and project data
- Tech marquee / skills rail
- Contact heading and CTA patterns
- Visual tokens, layout shells, and motion behavior (aside from hero H1 adaptation noted above)

## Language rules

- Prefer **Developer**, **digital products**, **digital experiences**, **interactive experiences**.
- Never use “Front-end Developer”, “Full-stack Developer”, or stacked role titles in user-facing copy or metadata.
- Tone: personal, modern, concise — not corporate/agency.
- Keep copy flexible for future tech directions; avoid locking identity to one stack or layer.

## Tests

Update unit and e2e assertions that expect front-end/full-stack wording (notably `hero.test.tsx`, `e2e/final-review.spec.ts`, and any metadata title/description checks) to match the new strings.

## Acceptance criteria

1. No user-facing string on the site names Front-end or Full-stack as a role.
2. Hero and About match the copy map above (About bio has no location).
3. Tagline and document metadata use Developer positioning.
4. Existing layout and visuals remain intact aside from necessary hero H1 adaptation.
5. Related unit and e2e tests pass with updated expectations.
