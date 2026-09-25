"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { type PointerEvent, type RefObject, useRef } from "react";

import { MagneticLink } from "@/components/ui/magnetic-link";
import type {
  Project,
  ProjectImage,
  ProjectOverlay,
  ProjectVisual,
} from "@/data/projects";
import { isLocalProjectImageSrc } from "@/data/projects";
import { cn } from "@/lib/cn";
import { useScrollRange, useViewportProgress } from "@/lib/use-parallax";

type ProjectCardProps = {
  project: Project;
  index: number;
};

function verifiedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const hoverLayerClass = cn(
  "absolute inset-0 transition-transform duration-700 ease-out motion-reduce:transition-none",
  "[@media(hover:hover)]:group-hover:scale-[1.04]",
);

/**
 * Pins the colour reveal's origin to where the pointer crossed into (or out
 * of) the card, so the circle grows from the entry point and collapses toward
 * the exit. Positions outside the frame clamp to its nearest edge.
 */
function trackRevealOrigin(
  frame: HTMLDivElement | null,
  event: PointerEvent<HTMLElement>,
) {
  if (!frame || event.pointerType !== "mouse") return;
  const bounds = frame.getBoundingClientRect();
  const clamp = (value: number) => Math.min(Math.max(value, 0), 100);
  frame.style.setProperty("--reveal-x", `${clamp(((event.clientX - bounds.left) / bounds.width) * 100)}%`);
  frame.style.setProperty("--reveal-y", `${clamp(((event.clientY - bounds.top) / bounds.height) * 100)}%`);
}

function ProjectArtwork({
  frame,
  image,
  overlay,
  title,
  visual,
}: {
  frame: RefObject<HTMLDivElement | null>;
  image?: ProjectImage;
  overlay?: ProjectOverlay;
  title: string;
  visual: ProjectVisual;
}) {
  const safeImage = image && isLocalProjectImageSrc(image.src) ? image : undefined;
  const hasAccessibleContent = Boolean(safeImage || overlay);
  const objectPosition = safeImage?.position ?? "50% 50%";
  const progress = useViewportProgress(frame);
  // Artwork zooms out and drifts against the scroll inside a fixed frame; the
  // frame itself opens like a window over the first third of its travel.
  const artworkY = useScrollRange(progress, "-5%", "5%", "0%");
  const artworkScale = useScrollRange(progress, 1.18, 1.12, 1);
  const inset = useScrollRange(progress, 9, 0, 0, [0, 0.35]);
  const clipPath = useTransform(inset, (value) => `inset(${value}%)`);

  return (
    <motion.div
      aria-hidden={hasAccessibleContent ? undefined : "true"}
      className="relative aspect-4/3 min-h-56 overflow-clip border border-line bg-surface-raised"
      data-testid={`project-visual-${visual}`}
      data-visual={visual}
      ref={frame}
      style={{ clipPath }}
    >
      {/* Scroll parallax lives on its own layer: the hover layer's CSS transition would otherwise lag every scroll frame. */}
      <motion.div
        className="absolute inset-0"
        data-testid="project-artwork-parallax"
        style={{ y: artworkY, scale: artworkScale }}
      >
        <div className={hoverLayerClass} data-testid="project-artwork-layer">
          {safeImage ? (
            <Image
              alt={safeImage.alt}
              className="project-photo object-cover"
              fill
              sizes="(min-width: 1024px) 67vw, 100vw"
              src={safeImage.src}
              style={{ objectPosition }}
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0">
              {visual === "orb" && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(243,241,232,0.12),transparent_28%),linear-gradient(135deg,#171a16,#090a09)]" />
                  <div className="absolute left-1/2 top-1/2 aspect-square w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,#f3f1e8_0%,#8d9188_12%,#2b2e2a_43%,#101210_68%,#050605_100%)] shadow-[0_2rem_6rem_rgba(243,241,232,0.12)]" />
                  <div className="absolute left-[13%] top-[17%] h-px w-[22%] bg-white/35" />
                  <span className="absolute bottom-[9%] right-[8%] font-mono text-[0.65rem] tracking-[0.24em] text-white/45">
                    INTELLIGENCE / 01
                  </span>
                </>
              )}

              {visual === "type" && (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,#0b0c0b_0_46%,#1c1f1b_46%_49%,#101210_49%)]" />
                  <span className="absolute left-[-3%] top-[4%] text-[clamp(5rem,20cqw,14rem)] font-black leading-none tracking-[-0.12em] text-[#e5e2d8]">
                    TYPE
                  </span>
                  <span className="absolute bottom-[7%] right-[5%] max-w-[8ch] text-right font-mono text-[clamp(0.65rem,2.5cqw,0.9rem)] uppercase tracking-[0.2em] text-white/45">
                    Break the grid
                  </span>
                  <div className="absolute bottom-0 left-[17%] h-[38%] w-px rotate-12 bg-white/25" />
                </>
              )}

              {visual === "reveal" && (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,#20231e,#0b0c0b_65%)]" />
                  <div className="absolute inset-[9%_12%] border border-white/20 bg-[#171916]">
                    <div className="absolute inset-y-0 left-0 w-[48%] bg-[#d7d4ca]" />
                    <div className="absolute inset-y-0 left-[48%] w-px bg-black/35" />
                    <div className="absolute left-[13%] top-[17%] h-[66%] w-px bg-black/35" />
                    <span className="absolute bottom-[8%] left-[6%] text-[clamp(2rem,9cqw,5rem)] font-semibold leading-none tracking-[-0.08em] text-[#161816]">
                      04
                    </span>
                  </div>
                  <span className="absolute right-[4%] top-1/2 -translate-y-1/2 rotate-90 font-mono text-[0.6rem] tracking-[0.25em] text-white/45">
                    MASK / REVEAL
                  </span>
                </>
              )}

              {visual === "dragon" && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,#292c27_0%,#111310_52%,#080908_100%)]" />
                  <div className="absolute left-[22%] top-[24%] h-[45%] w-[56%] -rotate-6 rounded-[58%_42%_65%_35%] border border-white/40 shadow-[inset_0_0_3rem_rgba(243,241,232,0.06)]" />
                  <div className="absolute left-[31%] top-[31%] h-[21%] w-[25%] rotate-28 border-l border-t border-white/45" />
                  <div className="absolute bottom-[15%] left-[17%] h-px w-[66%] bg-white/20" />
                  <span className="absolute bottom-[6%] left-[7%] text-[clamp(2.5rem,12cqw,7rem)] font-black leading-none tracking-[-0.08em] text-white/10">
                    DRGN
                  </span>
                </>
              )}

              <span className="sr-only">{title} abstract project artwork</span>
            </div>
          )}
        </div>
      </motion.div>

      {/*
        Photos rest desaturated under a theme tint; on hover a full-colour copy
        spreads out in a circle from the pointer (see .project-reveal). The copy
        sits outside the parallax layer so its clip circle is measured against
        the fixed frame, then repeats the same motion values inside.
      */}
      {safeImage && (
        <>
          <div
            aria-hidden="true"
            className="project-veil pointer-events-none absolute inset-0 bg-surface/30"
            data-testid="project-artwork-veil"
          />
          <div
            aria-hidden="true"
            className="project-reveal pointer-events-none absolute inset-0"
            data-testid="project-artwork-reveal"
          >
            <motion.div className="absolute inset-0" style={{ y: artworkY, scale: artworkScale }}>
              <div className={hoverLayerClass}>
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 67vw, 100vw"
                  src={safeImage.src}
                  style={{ objectPosition }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}

      {overlay && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-surface/95 via-surface/75 to-transparent px-[clamp(1rem,4cqw,2rem)] pb-[clamp(1rem,4cqw,2rem)] pt-[clamp(3rem,12cqw,7rem)] text-ink"
          data-testid="project-artwork-overlay"
        >
          <p className="font-mono text-[clamp(0.65rem,2cqw,0.8rem)] uppercase tracking-[0.18em] text-ink-muted">
            {overlay.eyebrow}
          </p>
          <p className="mt-2 max-w-[28ch] text-[clamp(1rem,3.5cqw,1.5rem)] font-medium leading-tight">
            {overlay.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const liveUrl = verifiedUrl(project.liveUrl);
  const sourceUrl = verifiedUrl(project.sourceUrl);
  const titleId = `project-${project.slug}-title`;
  const frame = useRef<HTMLDivElement>(null);

  return (
    <article
      aria-labelledby={titleId}
      className="@container/card group min-w-0 border-t border-ink/15 pt-[clamp(0.75rem,2cqw,1.25rem)]"
      onPointerEnter={(event) => trackRevealOrigin(frame.current, event)}
      onPointerLeave={(event) => trackRevealOrigin(frame.current, event)}
    >
      <div className="mb-[clamp(0.75rem,2cqw,1.25rem)] flex items-center justify-between gap-4 font-mono text-(length:--text-small) uppercase tracking-[0.18em] text-ink-muted">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{project.year}</span>
      </div>

      <ProjectArtwork
        frame={frame}
        image={project.image}
        overlay={project.overlay}
        title={project.title}
        visual={project.visual}
      />

      <div className="grid min-w-0 gap-5 pt-[clamp(1.25rem,4cqw,2.25rem)] @min-[34rem]/card:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)] @min-[34rem]/card:items-start">
        <div className="min-w-0">
          <h3
            className="max-w-[15ch] text-[clamp(1.75rem,7cqw,4rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-ink"
            id={titleId}
          >
            {project.title}
          </h3>
          <ul
            aria-label="Technologies"
            className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-(length:--text-small) uppercase tracking-[0.12em] text-ink-muted"
          >
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5">
          <p className="max-w-136 text-(length:--text-body) leading-relaxed text-ink-muted">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/15 pt-3">
            {liveUrl && (
              <MagneticLink
                className="gap-2 text-sm font-medium uppercase tracking-[0.12em] text-ink"
                href={liveUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                View live
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </MagneticLink>
            )}
            {sourceUrl && (
              <MagneticLink
                className="gap-2 text-sm font-medium uppercase tracking-[0.12em] text-ink"
                href={sourceUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                Source code
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </MagneticLink>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
