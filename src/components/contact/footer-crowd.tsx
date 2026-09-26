"use client";

import { useEffect, useRef } from "react";

import { SpriteSheet, frameSize } from "@/components/pixel-sprite/sprite-sheet";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

import { dogSprite, personSprite, type Sprite } from "./footer-sprites";

type Gait = "idle" | "walk" | "run";

type ActorConfig = {
  readonly id: string;
  readonly sprite: Sprite;
  readonly speed: { readonly walk: number; readonly run: number };
  /** Where the actor starts, as a fraction of the stage width. */
  readonly start: number;
  /** Gait odds when choosing what to do next (idle, walk, run). */
  readonly temperament: readonly [number, number, number];
  /** Trails another actor instead of wandering (the dog). */
  readonly follows?: string;
};

const cast: readonly ActorConfig[] = [
  { id: "walker", sprite: personSprite, speed: { walk: 36, run: 115 }, start: 0.18, temperament: [0.2, 0.6, 0.2] },
  { id: "dog", sprite: dogSprite, speed: { walk: 50, run: 150 }, start: 0.08, temperament: [0, 1, 0], follows: "walker" },
  { id: "runner", sprite: personSprite, speed: { walk: 44, run: 150 }, start: 0.72, temperament: [0.1, 0.3, 0.6] },
];

const fleeRadius = 110;

type ActorState = {
  config: ActorConfig;
  x: number;
  dir: 1 | -1;
  gait: Gait;
  distance: number;
  decideIn: number;
  fleeFor: number;
};

function pickGait([idle, walk]: ActorConfig["temperament"]): Gait {
  const roll = Math.random();
  if (roll < idle) return "idle";
  return roll < idle + walk ? "walk" : "run";
}

/**
 * A little pixel crowd along the footer's ground line: people amble, sprint,
 * pause and turn at the edges, a dog trots after its owner, and everyone
 * scatters from the cursor. Frames advance by distance travelled, so the legs
 * match the speed. Reduced motion leaves them standing still.
 */
export function FooterCrowd() {
  const stage = useRef<HTMLDivElement>(null);
  const actorNodes = useRef(new Map<string, HTMLDivElement>());
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = stage.current;
    if (!element || shouldReduceMotion) return;

    let width = element.clientWidth;
    const states = new Map<string, ActorState>(
      cast.map((config) => [
        config.id,
        {
          config,
          x: config.start * width,
          dir: Math.random() < 0.5 ? 1 : -1,
          gait: config.follows ? "idle" : "walk",
          distance: 0,
          decideIn: 1 + Math.random() * 3,
          fleeFor: 0,
        },
      ]),
    );
    const pointer = { x: -Infinity, y: -Infinity };
    let frame = 0;
    let last = 0;
    let isVisible = false;

    const render = (state: ActorState) => {
      const node = actorNodes.current.get(state.config.id);
      if (!node) return;
      const { sprite } = state.config;
      const cycle = sprite.cycles[state.gait];
      const step = state.gait === "idle" ? 0 : Math.floor(state.distance / sprite.stride[state.gait]);
      const frameIndex = cycle[step % cycle.length]!;
      node.style.left = "0";
      node.style.transform = `translate3d(${state.x}px, 0, 0) scaleX(${state.dir})`;
      const sheet = node.querySelector<SVGElement>("[data-sprite-sheet]");
      if (sheet) sheet.style.transform = `translateX(${-frameIndex * frameSize(sprite).width}px)`;
    };

    const tick = (time: number) => {
      const delta = Math.min((time - (last || time)) / 1000, 0.05);
      last = time;
      const bounds = element.getBoundingClientRect();
      const pointerX = pointer.x - bounds.left;
      const isPointerNear = pointer.y > bounds.top - 80 && pointer.y < bounds.bottom + 20;

      for (const state of states.values()) {
        const { config } = state;
        const actorWidth = frameSize(config.sprite).width;
        const centre = state.x + actorWidth / 2;
        const maxX = Math.max(width - actorWidth, 0);

        if (isPointerNear && Math.abs(pointerX - centre) < fleeRadius) {
          state.fleeFor = 1.1;
          state.dir = pointerX < centre ? 1 : -1;
        }

        if (state.fleeFor > 0) {
          state.fleeFor -= delta;
          state.gait = "run";
        } else if (config.follows) {
          const leader = states.get(config.follows)!;
          const target = leader.x - leader.dir * 44;
          const gap = target - state.x;
          state.gait = Math.abs(gap) > 90 ? "run" : Math.abs(gap) > 10 ? "walk" : "idle";
          state.dir = state.gait === "idle" ? leader.dir : gap > 0 ? 1 : -1;
        } else if ((state.decideIn -= delta) <= 0) {
          state.gait = pickGait(config.temperament);
          if (Math.random() < 0.3) state.dir = state.dir === 1 ? -1 : 1;
          state.decideIn = 1.5 + Math.random() * 4;
        }

        if (state.gait !== "idle") {
          const travel = config.speed[state.gait] * delta;
          state.x += travel * state.dir;
          state.distance += travel;
        }
        if (state.x <= 0 || state.x >= maxX) {
          state.x = Math.min(Math.max(state.x, 0), maxX);
          if (!config.follows) state.dir = state.x <= 0 ? 1 : -1;
        }

        render(state);
      }

      frame = isVisible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (frame || !isVisible) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
    });
    // Only animate while the stage is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      start();
    });

    resize.observe(element);
    visibility.observe(element);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-[72px] overflow-x-clip"
      data-testid="footer-crowd"
      ref={stage}
    >
      {cast.map((config) => {
        const { width, height } = frameSize(config.sprite);
        return (
          <div
            className="absolute bottom-0 origin-center will-change-transform"
            data-actor={config.id}
            key={config.id}
            ref={(node) => {
              if (node) actorNodes.current.set(config.id, node);
              else actorNodes.current.delete(config.id);
            }}
            style={{ height, left: `${config.start * 100}%`, width }}
          >
            <div className="relative size-full overflow-hidden">
              <SpriteSheet sprite={config.sprite} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
