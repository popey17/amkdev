"use client";

import { motion } from "motion/react";
import { type ReactNode, useRef } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SplitText } from "@/components/ui/split-text";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";
import { useScrollRange, useViewportProgress } from "@/lib/use-parallax";

type ProjectsProps = {
  projects: readonly Project[];
};

const editorialPlacement = [
  "@min-[48rem]:col-span-7",
  "@min-[48rem]:col-span-5 @min-[48rem]:mt-[clamp(5rem,8cqw,12rem)]",
  "@min-[48rem]:col-span-5",
  "@min-[48rem]:col-span-7 @min-[48rem]:mt-[clamp(3rem,6cqw,9rem)]",
] as const;

const centeredPlacement =
  "@min-[48rem]:col-span-8 @min-[48rem]:col-start-3";

export function getProjectPlacement(index: number, count: number): string {
  const isFinalUnpairedProject = count % 2 === 1 && index === count - 1;

  return isFinalUnpairedProject
    ? centeredPlacement
    : editorialPlacement[index % editorialPlacement.length];
}

/**
 * On the two-column layout, right-hand cards travel faster than left-hand ones
 * so the staggered grid shears slightly as it scrolls.
 */
function ColumnDrift({ children, index }: { children: ReactNode; index: number }) {
  const item = useRef<HTMLDivElement>(null);
  const isTwoColumn = useMediaQuery("(min-width: 48rem)");
  const progress = useViewportProgress(item);
  const distance = isTwoColumn ? (index % 2 === 0 ? 40 : 110) : 0;
  const y = useScrollRange(progress, distance, -distance, 0);

  return (
    <motion.div ref={item} style={{ y }}>
      {children}
    </motion.div>
  );
}

export function Projects({ projects }: ProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section
      aria-labelledby="selected-work-title"
      className="@container shell section-space min-w-0"
      id="work"
    >
      <Reveal className="mb-[clamp(3rem,7cqw,9rem)] grid gap-6 border-t border-ink/15 pt-5 @min-[48rem]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @min-[48rem]:items-end">
        <p className="flex items-center gap-3 font-mono text-(length:--text-small) uppercase tracking-[0.2em] text-ink-muted">
          <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
          Portfolio / 2024–26
        </p>
        <h2
          className="max-w-[10ch] text-(length:--text-h2) font-semibold leading-[0.9] tracking-[-0.06em] text-ink"
          id="selected-work-title"
        >
          <SplitText>Selected work</SplitText>
        </h2>
      </Reveal>

      <ol className="grid min-w-0 gap-y-[clamp(4rem,10cqw,11rem)] @min-[48rem]:grid-cols-12 @min-[48rem]:gap-x-[clamp(1.5rem,4cqw,5rem)]">
        {projects.map((project, index) => (
          <li
            className={cn(
              "min-w-0",
              getProjectPlacement(index, projects.length),
            )}
            key={project.slug}
          >
            <ColumnDrift index={index}>
              <Reveal delay={Math.min(index * 0.06, 0.18)}>
                <ProjectCard index={index} project={project} />
              </Reveal>
            </ColumnDrift>
          </li>
        ))}
      </ol>
    </section>
  );
}
