# Preload Walker — Design

Date: 2026-09-26

## Goal

Add a full-screen preload overlay where the footer pixel person walks along a progress bar from 0% to 100%. Do not change footer behavior or visuals. Reuse the existing person sprite.

## Decisions

| Topic | Choice |
| --- | --- |
| Progress model | Hybrid: timer eases toward ~90%; 100% only when page is ready |
| Long load feedback | After **1.5s** still waiting, gait switches walk → run |
| Layout | Full-screen overlay; centered track + person on the bar + % |
| Footer | Untouched in behavior/UI; may only re-import shared sprite render helpers |
| Character | Person only (`personSprite`); no dog |

## Visual design

- Fixed full-viewport overlay using theme `surface` background, `z-index` above site chrome
- Centered composition:
  - Thin horizontal progress track (ink / muted tokens)
  - Pixel person standing on the track; horizontal position = progress (0 left → 100 right)
  - Percentage label near the bar (e.g. `42%`)
- Walk frames advance by distance travelled (same stride idea as footer)
- After 1.5s elapsed and page not ready: use run cycle and faster progression toward the soft cap
- Exit: short opacity fade (~200–300ms), then unmount
- `prefers-reduced-motion`: no gait animation — person idle at tip of filled bar; bar still fills to 100%

## Progress logic

1. On mount, start timer and listen for readiness:
   - `document.readyState === "complete"`, or `window` `load` if still loading
   - `document.fonts.ready` when available (do not block forever if fonts API fails)
2. Displayed progress `p` eases toward a soft cap (~0.9) while not ready
3. When ready **and** minimum display time (~1.2s) has elapsed, animate `p` to 1.0, then exit
4. At **1.5s** elapsed while not finished: set gait to `run`
5. Cap never reaches 100% before ready (avoids a fake “done” state)

Session: show once per full page load (normal remount on hard refresh). No persistent “already seen” cookie required.

## Architecture

```
src/components/preload/
  preload.tsx          # overlay UI + progress / gait loop
  preload.test.tsx
src/components/pixel-sprite/   # or shared under contact/ extracted helpers
  sprite-sheet.tsx     # SpriteSheet + frameSize + palette usage
src/components/contact/
  footer-sprites.ts    # unchanged sprite data (personSprite, etc.)
  footer-crowd.tsx     # imports shared SpriteSheet; behavior unchanged
src/app/layout.tsx     # mount <Preload />
```

### Shared pieces

- Extract `SpriteSheet` and `frameSize` (and pixel size constant if shared) so preload and footer both render from `personSprite` / palette
- Keep `footer-sprites.ts` as the single source of sprite frame data
- Footer crowd AI, cast, pointer flee, dog — unchanged

### Preload component

- Client component
- Owns: progress state, gait (`walk` | `run` | `idle`), exit/unmount
- Renders one actor using shared sheet + `personSprite`
- `aria-busy` / polite status for screen readers (percentage or “Loading”); decorative sprite `aria-hidden`

## Testing

- Progress stays below 100% until readiness signal
- Gait becomes `run` after 1.5s while still loading
- Reduced motion: idle frame, no walk cycle
- Footer crowd tests still pass; footer markup/behavior unchanged
- Overlay unmounts after reaching 100% and exit animation

## Out of scope

- Changing footer cast, dog, or pointer interaction
- Fake network progress from individual asset fetches beyond `load` / fonts
- Brand logo or extra marketing copy on the preload screen
