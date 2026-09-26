import { cn } from "@/lib/cn";

/**
 * Monogram: a solid lime square carrying a geometric "A", stacked over an
 * outlined square that echoes the cursor trail. On hover the front square
 * slides into the back square's slot and the outline swings a quarter turn.
 * Inherits hover state from the nearest `group` ancestor.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-11 shrink-0 overflow-visible", className)}
      fill="none"
      viewBox="0 0 44 44"
    >
      <rect
        className="origin-[26px_26px] stroke-ink/35 transition-[rotate,stroke] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 group-hover:stroke-accent-ink motion-reduce:transition-none"
        height="30"
        strokeWidth="1.5"
        width="30"
        x="11"
        y="11"
      />
      <g className="transition-[translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px] group-hover:translate-y-[5px] motion-reduce:transition-none">
        <rect className="fill-accent" height="30" width="30" x="3" y="3" />
        {/* Geometric A: chevron plus a crossbar that stops short of the right leg. */}
        <path
          className="stroke-on-accent"
          d="M10 26.5 18 9.5l8 17"
          strokeLinecap="square"
          strokeWidth="3.4"
        />
        <path className="stroke-on-accent" d="M13.6 20.5h6.6" strokeWidth="3" />
        <rect className="fill-on-accent" height="3.4" width="3.4" x="22.6" y="18.8" />
      </g>
    </svg>
  );
}

export function LogoWordmark({ name }: { name: string }) {
  return (
    <span className="hidden flex-col leading-none sm:flex">
      <span className="text-sm font-semibold tracking-tight">{name}</span>
      <span className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-muted transition-colors group-hover:text-accent-ink">
        Developer
      </span>
    </span>
  );
}
