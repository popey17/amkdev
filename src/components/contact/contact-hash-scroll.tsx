"use client";

import { useEffect } from "react";

import {
  contactScrollBehavior,
  scrollToContact,
} from "@/lib/scroll-to-contact";

/**
 * Makes `#contact` links (nav, hero CTA, hash on load) scroll to the bottom
 * of the page so the sticky footer reveal actually shows.
 */
export function ContactHashScroll() {
  useEffect(() => {
    function revealContact() {
      scrollToContact(contactScrollBehavior());
    }

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href="#contact"]');
      if (!link || link.getAttribute("target") === "_blank") return;

      event.preventDefault();
      // Defer so a closing mobile drawer can restore body overflow first.
      requestAnimationFrame(() => {
        revealContact();
        if (window.location.hash !== "#contact") {
          history.pushState(null, "", "#contact");
        }
      });
    }

    function onHashChange() {
      if (window.location.hash === "#contact") revealContact();
    }

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);

    if (window.location.hash === "#contact") {
      // Wait a frame for layout (sticky metrics, fonts) before scrolling.
      requestAnimationFrame(revealContact);
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
