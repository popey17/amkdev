"use client";

import { ArrowUpRight, Copy } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";

import { FooterCrowd } from "@/components/contact/footer-crowd";
import { LocalTime } from "@/components/contact/local-time";
import { contact, socials } from "@/data/site";
import { useScrollRange } from "@/lib/use-parallax";

type ContactProps = {
  email?: string;
};

const configuredEmailPattern =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function isValidEmail(value: string | undefined): value is string {
  return Boolean(value && configuredEmailPattern.test(value));
}

function isVerifiedHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * How much of the sticky footer the page above has uncovered: 0 while the
 * footer is fully hidden behind <main>, 1 at the very bottom of the page.
 * The footer is the last thing in the document, so its natural top is the
 * document height minus its own height.
 */
function useUncoverProgress(footer: RefObject<HTMLElement | null>) {
  const { scrollY } = useScroll();
  const [metrics, setMetrics] = useState({ top: Infinity, height: 1, viewport: 0 });

  useEffect(() => {
    const element = footer.current;
    if (!element) return;

    const measure = () =>
      setMetrics({
        top: document.documentElement.scrollHeight - element.offsetHeight,
        height: Math.max(element.offsetHeight, 1),
        viewport: window.innerHeight,
      });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [footer]);

  return useTransform(scrollY, (y) =>
    Math.min(Math.max((y + metrics.viewport - metrics.top) / metrics.height, 0), 1),
  );
}

export function Contact({ email }: ContactProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const emailRef = useRef<HTMLSpanElement>(null);
  const configuredEmail = isValidEmail(email) ? email : undefined;
  const verifiedSocials = socials.filter((social) =>
    isVerifiedHttpsUrl(social.url),
  );
  const linkedIn = verifiedSocials.find(
    (social) => social.platform === "linkedin",
  );
  const footer = useRef<HTMLElement>(null);
  const uncovered = useUncoverProgress(footer);
  // Content rises and settles as the page above slides off it.
  const contentY = useScrollRange(uncovered, "-22%", "0%", "0%");
  const headingScale = useScrollRange(uncovered, 0.9, 1, 1);

  async function copyEmail() {
    if (!configuredEmail) return;

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(configuredEmail);
      setCopyStatus("Email copied.");
    } catch {
      const selection = window.getSelection();
      const emailElement = emailRef.current;

      if (selection && emailElement) {
        const range = document.createRange();
        range.selectNodeContents(emailElement);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setCopyStatus("Copy unavailable — select the email address.");
    }
  }

  return (
    // Sticky under <main>: the page slides up like a curtain to uncover it.
    <footer
      aria-labelledby="contact-title"
      className="sticky bottom-0 z-0 min-w-0 bg-surface-raised"
      id="contact"
      ref={footer}
    >
      {/*
        Exactly one screen tall on every device: spacing and the heading scale
        with viewport height (svh), and the condensed sticky header (h-14)
        is cleared at the top. Very short screens (landscape phones) switch to
        two columns and drop the eyebrow.
      */}
      <motion.div
        className="shell flex min-h-svh flex-col pb-[clamp(0.75rem,2.5svh,1.5rem)] pt-[calc(3.5rem+clamp(0.75rem,7svh,6rem))]"
        style={{ y: contentY }}
      >
        <div className="grid flex-1 content-center gap-[clamp(1.25rem,5svh,8rem)] lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] [@media(max-height:32rem)]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-[clamp(0.75rem,3svh,3rem)] flex items-center [@media(max-height:32rem)]:hidden gap-3 font-mono text-(length:--text-small) uppercase tracking-[0.2em] text-ink-muted">
              <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
              Have a project in mind?
            </p>
            <motion.h2
              className="max-w-[9ch] origin-bottom-left text-[length:min(var(--text-h1),12svh)] font-semibold leading-[0.88] tracking-[-0.065em] text-ink"
              id="contact-title"
              style={{ scale: headingScale }}
            >
              Let&apos;s work together.
            </motion.h2>

            <div className="mt-[clamp(0.75rem,5svh,5rem)]">
              {configuredEmail ? (
                <button
                  className="group flex min-h-11 max-w-full items-center gap-3 rounded-sm text-left text-(length:--text-body) text-accent-ink outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
                  onClick={copyEmail}
                  type="button"
                >
                  <span
                    className="select-all break-all underline decoration-current/40 underline-offset-8"
                    ref={emailRef}
                  >
                    {configuredEmail}
                  </span>
                  <Copy aria-hidden="true" className="size-5 shrink-0" />
                  <span className="sr-only">Copy email</span>
                </button>
              ) : linkedIn ? (
                <a
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm text-(length:--text-body) font-medium text-accent-ink underline decoration-current/40 underline-offset-8 outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
                  href={linkedIn.url}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Contact on LinkedIn
                  <ArrowUpRight aria-hidden="true" className="size-5" />
                </a>
              ) : null}
              <p
                aria-atomic="true"
                className="mt-2 min-h-5 text-sm text-ink-muted [@media(max-height:32rem)]:min-h-0"
                role="status"
              >
                {copyStatus}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 content-start gap-6 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:pt-8 [@media(max-height:32rem)]:grid [@media(max-height:32rem)]:gap-4 [@media(max-height:32rem)]:pt-0">
            <div>
              <p className="font-mono text-(length:--text-small) uppercase tracking-[0.16em] text-ink-muted">
                Currently in
              </p>
              <p className="mt-2 text-(length:--text-body) text-ink">
                {contact.location}
              </p>
              <div className="mt-2">
                <LocalTime />
              </div>
            </div>

            <nav aria-label="Social links">
              <ul className="grid gap-1">
                {verifiedSocials.map((social) => (
                  <li key={social.platform}>
                    <a
                      className="flex min-h-11 items-center justify-between rounded-sm border-b border-ink/15 py-2 text-ink outline-none transition-colors hover:border-accent-ink hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      href={social.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {social.label}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="pt-[clamp(0.5rem,4svh,8rem)]">
          <FooterCrowd />
        </div>
        {/* The crowd walks along this rule. */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/25 pt-5 font-mono text-(length:--text-small) uppercase tracking-[0.12em] text-ink-muted">
          <p>© {contact.shortName}</p>
          <p>{contact.availability}</p>
        </div>
      </motion.div>
    </footer>
  );
}
