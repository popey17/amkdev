"use client";

import { useEffect } from "react";

import {
  contactScrollBehavior,
  scrollToContact,
} from "@/lib/scroll-to-contact";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function scrollToHashTarget(id: string) {
  if (document.body.style.overflow === "hidden") {
    document.body.style.overflow = "";
  }

  const behavior = contactScrollBehavior();

  // Sticky footer sits under <main>; only scrolling to the document end uncovers it.
  if (id === "contact") {
    scrollToContact(behavior);
    return;
  }

  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

/**
 * In-page `#…` links scroll to their targets without writing the hash into the URL.
 */
export function ContactHashScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href^='#']");
      if (!link || link.getAttribute("target") === "_blank") return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const id = decodeURIComponent(href.slice(1));
      if (!id) return;

      event.preventDefault();
      // Defer so a closing mobile drawer can restore body overflow first.
      requestAnimationFrame(() => scrollToHashTarget(id));
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
