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
      <motion.div
        className="shell pb-6 pt-[var(--space-section)]"
        style={{ y: contentY }}
      >
        <div className="grid gap-[clamp(3rem,8vw,8rem)] lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
          <div>
            <p className="mb-[clamp(1.5rem,3vw,3rem)] flex items-center gap-3 font-mono text-(length:--text-small) uppercase tracking-[0.2em] text-ink-muted">
              <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
              Have a project in mind?
            </p>
            <motion.h2
              className="max-w-[9ch] origin-bottom-left text-(length:--text-h1) font-semibold leading-[0.88] tracking-[-0.065em] text-ink"
              id="contact-title"
              style={{ scale: headingScale }}
            >
              Let&apos;s work together.
            </motion.h2>

            <div className="mt-[clamp(2rem,5vw,5rem)]">
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
                className="mt-4 min-h-6 text-sm text-ink-muted"
                role="status"
              >
                {copyStatus}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-10 lg:pt-8">
            <div>
              <p className="font-mono text-(length:--text-small) uppercase tracking-[0.16em] text-ink-muted">
                Based in
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

        <div className="mt-[clamp(3rem,7vw,8rem)]">
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
