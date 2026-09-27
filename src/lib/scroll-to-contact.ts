/**
 * The contact footer is `position: sticky; bottom: 0` under an opaque <main>,
 * so it already occupies the viewport (behind the page) for most of the
 * scroll. Native `#contact` / scrollIntoView therefore no-ops. Scrolling to
 * the document end is what slides <main> off and uncovers it.
 */
export function scrollToContact(behavior: ScrollBehavior = "smooth") {
  // Mobile nav locks body overflow while open; clear it so this scroll can run
  // even if the drawer hasn't finished its close effect yet.
  if (document.body.style.overflow === "hidden") {
    document.body.style.overflow = "";
  }

  const top = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );
  window.scrollTo({ top, behavior });
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function contactScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}
