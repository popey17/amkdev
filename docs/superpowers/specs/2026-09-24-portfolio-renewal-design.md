# Aung Myat Kyaw Portfolio Renewal

## Product Goal

Create a premium, award-site-inspired portfolio that presents Aung Myat Kyaw as a front-end and full-stack developer. The experience should feel expressive and memorable without sacrificing accessibility, mobile usability, or load performance.

## Art Direction

The visual direction is editorial with restrained 3D:

- Dark graphite surfaces with warm white text and a vivid acid-lime accent.
- Oversized typography, asymmetric composition, generous negative space, and thin technical rules.
- A reactive hero orb or shader mesh as the main visual signature.
- Kinetic typography and image reveals used selectively instead of constant motion.
- A small abstract eye character that looks toward the pointer on pointer-capable devices only; it remains static on touch devices.

The design should feel crafted rather than template-driven. Decorative effects must support hierarchy and interaction instead of obscuring content.

## Information Architecture

1. Sticky header
   - AMK monogram and full-name wordmark.
   - Thailand availability badge.
   - Theme or accent control.
   - Desktop navigation and touch-friendly mobile drawer.
2. Hero
   - Primary positioning statement.
   - Short supporting copy.
   - Project and contact calls to action.
   - Interactive 3D orb with a non-WebGL fallback.
   - Animated scroll cue.
3. About
   - Brand-aligned, performance-focused introduction.
   - Key capabilities and experience signals.
4. Technology rail
   - Continuously scrolling, pauseable skill list.
   - HTML5, CSS3, JavaScript, React, Next.js, PHP, Laravel, Git, and cloud services.
5. Selected work
   - Leo's Personal AI Chatbot.
   - Three.js Explode Text.
   - Award Winning Image Reveal.
   - Three.js Dragon.
   - Each entry supports a brief, technology tags, preview link, and source link. Links are rendered only when a verified URL exists in project data.
6. Contact and footer
   - “Let's Work Together” CTA.
   - Copyable email address with accessible feedback.
   - LinkedIn and GitHub links.
   - Thailand local-time indicator.

## Interaction Design

- Header condenses after leaving the hero and remains readable over all sections.
- Hero typography enters in a short stagger; the 3D object follows pointer movement with damped motion.
- Project media uses clipped image reveals and subtle scale changes. Touch devices receive a stable, tap-first presentation.
- Section content enters only once as it approaches the viewport.
- The mobile menu traps focus, closes on Escape or route selection, and restores focus to its trigger.
- Email copying reports success or failure through an ARIA live region.
- Accent changes are stored locally and never block first render.
- Motion is substantially reduced when `prefers-reduced-motion` is enabled.

## Responsive System

- Mobile-first layout with a 375px lower design target.
- Fluid type, spacing, gaps, and page padding use `clamp()` rather than abrupt breakpoint jumps.
- Main content uses a centered fluid container with a readable maximum width on ultrawide displays.
- Selected work shifts from one column on mobile to an asymmetric two-column editorial grid.
- Container queries adapt project cards to their actual allocated width.
- Three-dimensional effects reduce detail and pixel ratio on small or resource-constrained devices.
- No horizontal page overflow is permitted at any supported width.

## Technical Architecture

- Next.js App Router with TypeScript.
- Tailwind CSS for tokens, fluid utilities, layout, and state styling.
- Framer Motion for component entrances, menu transitions, and pointer-responsive UI.
- React Three Fiber with Drei for the isolated hero scene.
- Server components by default; client boundaries only for motion, WebGL, controls, clipboard, and local time.
- Static project data kept in a typed module so project cards remain reusable and easy to update.

Primary component boundaries:

- `SiteHeader`: navigation state, accent control, mobile drawer.
- `Hero`: content shell and calls to action.
- `HeroScene`: WebGL rendering and visual fallback.
- `About`: editorial introduction.
- `TechMarquee`: pauseable technology loop.
- `Projects`: section composition and typed project list.
- `ProjectCard`: reusable project presentation.
- `Contact`: clipboard interaction and verified social links. Unconfigured links remain hidden rather than using invented placeholders.
- `LocalTime`: client-only Thailand clock.

## Typography and Tokens

- Display typography scales fluidly from approximately 3rem on mobile to a capped ultrawide size.
- Body copy remains measure-constrained and does not scale beyond comfortable reading sizes.
- Fluid tokens cover display, heading, body, caption, page gutter, section spacing, and component gaps.
- Semantic colors are exposed as CSS custom properties so accent and theme changes do not require duplicated utility classes.

## Performance and Failure Handling

- Keep the initial hero scene compact; avoid large textures and unnecessary post-processing.
- Dynamically load WebGL code and reserve its layout space to prevent shifts.
- Cap renderer device pixel ratio and pause rendering when the scene is not visible.
- Show a CSS gradient-orb fallback if WebGL fails or is unavailable.
- Use optimized responsive images with explicit dimensions.
- Avoid scroll-jacking; native scrolling remains intact.
- Clipboard failure leaves the email selectable and changes feedback to an instruction.

## Accessibility

- Maintain WCAG AA text contrast.
- All controls have visible focus states and minimum touch targets.
- Navigation, project links, and controls are fully keyboard operable.
- Decorative canvas output is hidden from assistive technology.
- Semantic headings follow document order.
- Marquee motion can be paused and is disabled under reduced-motion preferences.

## Verification

- Type checking, linting, and production build must pass.
- Test viewport widths at 375, 768, 1440, 2560, and 3840 pixels.
- Check keyboard navigation, focus restoration, reduced motion, mobile drawer behavior, clipboard fallback, and WebGL fallback.
- Confirm there is no horizontal overflow at each target width.
- Use Lighthouse as a final performance and accessibility check, targeting at least 90 in both categories on the production build.

## Deliverables

- A step-by-step implementation plan.
- A Tailwind and CSS fluid-token system using `clamp()`.
- Working Hero and Projects sections integrated into the application.
- Supporting header, about, technology rail, contact, and footer needed to make the first portfolio version coherent.

## Selected Work Image Extension

- The selected-work grid must support an arbitrary number of projects without requiring manual layout changes.
- The alternating 7/5 and 5/7 editorial placement repeats in pairs.
- When the final project is unpaired, it uses a centered, wider desktop placement instead of leaving an accidental empty column.
- Each project may provide a local public image path beginning with `/`, descriptive alternative text, and focal position; remote image hosts are not approved.
- Images render through `next/image` inside the existing clipped `project-artwork-layer`, preserving responsive sizing and hover zoom.
- When no image is configured, the current generated artwork remains visible as the fallback.
- An optional image overlay may contain a short eyebrow and caption.
- The overlay is a stationary sibling of the zooming artwork layer inside the clipped frame, using a strong bottom gradient and text opacity that preserve WCAG AA contrast over bright images without depending on hover.
- Overlay content is real text, while generated fallback artwork remains decorative.
- Project metadata remains typed so newly added projects receive compile-time validation.

## Out of Scope for the First Version

- CMS or admin dashboard.
- Blog.
- Full project case-study routes.
- Analytics, contact-form backend, or email service integration.
- Heavy cinematic post-processing or scroll-jacking.
