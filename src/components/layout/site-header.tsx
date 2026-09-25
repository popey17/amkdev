"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, Sun, X } from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { LogoMark, LogoWordmark } from "@/components/ui/logo";
import { MagneticLink } from "@/components/ui/magnetic-link";
import { contact, navigation, socials } from "@/data/site";
import { cn } from "@/lib/cn";
import { applyTheme, readTheme, subscribeToTheme, type Theme } from "@/lib/theme";

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const desktopQuery = "(min-width: 64rem)";
const headerHeight = 80;
const subscribeToMount = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const getServerTheme = (): Theme => "dark";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ink";

function ThemeToggle({ isLight }: { isLight: boolean }) {
  return (
    <button
      aria-label="Light theme"
      aria-pressed={isLight}
      className={cn(
        "grid size-11 place-items-center border transition-colors",
        isLight
          ? "border-accent-ink bg-accent text-on-accent"
          : "border-ink/20 text-ink hover:border-accent-ink hover:text-accent-ink",
        focusRing,
      )}
      onClick={() => applyTheme(isLight ? "dark" : "light")}
      title={isLight ? "Switch to dark graphite theme" : "Switch to light parchment theme"}
      type="button"
    >
      <Sun aria-hidden="true" size={18} />
    </button>
  );
}

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isLight =
    useSyncExternalStore(subscribeToTheme, readTheme, getServerTheme) === "light";
  const shouldReduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const homeLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCondensed(!entry?.isIntersecting),
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDrawer();
    };

    const desktop =
      typeof window.matchMedia === "function"
        ? window.matchMedia(desktopQuery)
        : null;
    const handleDesktop = () => {
      if (!desktop?.matches) return;
      setIsOpen(false);
      homeLinkRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", handleEscape);
    desktop?.addEventListener("change", handleDesktop);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      desktop?.removeEventListener("change", handleDesktop);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeDrawer() {
    triggerRef.current?.focus();
    setIsOpen(false);
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    // The sticky box is exactly the condensed bar's height, so once condensed
    // nothing can show through beneath it. The expanded bar overhangs into
    // mb-6, which keeps the total layout height at 80px so condensing never
    // shifts page content.
    <header
      className="pointer-events-none sticky top-0 z-50 mb-6 h-14"
      data-condensed={isCondensed}
    >
      <div
        className={cn(
          "pointer-events-auto border-b border-line backdrop-blur-xl transition-[height,background-color] duration-300 motion-reduce:transition-none",
          isCondensed ? "h-14 bg-surface/95" : "h-20 bg-surface/80",
        )}
        data-testid="header-bar"
      >
        <div className="shell flex h-full items-center justify-between gap-4">
          <MagneticLink
            aria-label={`${contact.name}, home`}
            className="group gap-3 text-ink hover:text-ink"
            href="#top"
            ref={homeLinkRef}
          >
            <LogoMark className={cn("transition-[width,height] duration-300", isCondensed && "size-9")} />
            <LogoWordmark name={contact.name} />
          </MagneticLink>

          <div className="hidden items-center gap-5 lg:flex">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-ink-muted shadow-[0_0_12px_var(--ink-muted)]"
              />
              <span>{contact.availability}</span>
              <span aria-hidden="true">·</span>
              <span>{contact.location}</span>
            </div>

            <nav aria-label="Primary" className="flex items-center gap-1">
              {navigation.map((item) => (
                <MagneticLink
                  className="px-4 text-sm text-ink-muted"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </MagneticLink>
              ))}
            </nav>

            <ThemeToggle isLight={isLight} />
          </div>

          <button
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label="Open menu"
            className={cn(
              "grid size-11 place-items-center border border-ink/20 text-ink lg:hidden",
              "transition-colors hover:border-accent-ink hover:text-accent-ink",
              focusRing,
            )}
            onClick={() => setIsOpen(true)}
            ref={triggerRef}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      {isMounted
        ? createPortal(
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  aria-label="Navigation"
                  aria-modal="true"
                  className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-surface"
                  initial={false}
                  onKeyDown={handleDialogKeyDown}
                  ref={dialogRef}
                  role="dialog"
                >
                  <div className="shell flex min-h-full flex-col py-4">
                    <div className="flex min-h-16 items-center justify-between border-b border-ink/10">
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink-muted">
                        Menu / {contact.location}
                      </p>
                      <div className="flex gap-2">
                        <ThemeToggle isLight={isLight} />
                        <button
                          aria-label="Close menu"
                          className={cn(
                            "grid size-11 place-items-center border border-ink/20",
                            "transition-colors hover:border-accent-ink hover:text-accent-ink",
                            focusRing,
                          )}
                          onClick={closeDrawer}
                          type="button"
                        >
                          <X aria-hidden="true" size={20} />
                        </button>
                      </div>
                    </div>

                    <nav
                      aria-label="Mobile"
                      className="flex flex-1 flex-col justify-center py-[min(2.5rem,6vh)]"
                    >
                      <AnimatePresence initial={!shouldReduceMotion}>
                        {navigation.map((item, index) => (
                          <motion.a
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex min-h-16 items-center border-b border-ink/10",
                              "text-[clamp(2rem,min(11vw,14vh),5rem)] font-semibold leading-none tracking-tighter",
                              "transition-colors hover:text-accent-ink",
                              focusRing,
                            )}
                            href={item.href}
                            initial={
                              shouldReduceMotion ? false : { opacity: 0, y: 20 }
                            }
                            key={item.href}
                            onClick={closeDrawer}
                            ref={index === 0 ? firstLinkRef : undefined}
                            transition={{
                              delay: shouldReduceMotion ? 0 : index * 0.06,
                              duration: 0.4,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className="mr-4 font-mono text-xs text-accent-ink"
                            >
                              0{index + 1}
                            </span>
                            {item.label}
                          </motion.a>
                        ))}
                      </AnimatePresence>
                    </nav>

                    <div className="flex min-h-16 items-center justify-between border-t border-ink/10">
                      <span className="text-xs text-ink-muted">
                        {contact.availability}
                      </span>
                      <div className="flex gap-4">
                        {socials.map((social) => (
                          <a
                            className={cn(
                              "inline-flex min-h-11 items-center text-sm text-ink-muted",
                              "transition-colors hover:text-accent-ink",
                              focusRing,
                            )}
                            href={social.url}
                            key={social.platform}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {social.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </header>
  );
}
