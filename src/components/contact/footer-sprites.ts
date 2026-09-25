/**
 * Pixel sprites for the footer crowd, drawn facing right. Each frame is a grid
 * of equal-length rows; a character picks the colour of that pixel:
 *   # body / head   e eye   s shirt (accent)   p trousers   f shoes   . empty
 */
export type SpriteFrame = readonly string[];

export type Sprite = {
  readonly frames: readonly SpriteFrame[];
  /** Frame indices per gait; distance travelled advances through them. */
  readonly cycles: {
    readonly idle: readonly number[];
    readonly walk: readonly number[];
    readonly run: readonly number[];
  };
  /** Pixels travelled per frame step, so feet don't skate at any speed. */
  readonly stride: { readonly walk: number; readonly run: number };
};

const standing: SpriteFrame = [
  "....####....",
  "...######...",
  "...####e....",
  "....####....",
  "....ssss....",
  "...ssssss...",
  "...ssssss...",
  "...ssssss...",
  "...#ssss#...",
  "....pppp....",
  "....pppp....",
  "....pp.pp...",
  "....pp.pp...",
  "....pp.pp...",
  "....pp.pp...",
  "...fff.fff..",
];

const walkStride: SpriteFrame = [
  "............",
  "....####....",
  "...######...",
  "...####e....",
  "....####....",
  "....ssss....",
  "...ssssss...",
  "..ss.sss.s..",
  "..#..sss..#.",
  "....pppp....",
  "...pp..pp...",
  "...pp...pp..",
  "..pp....pp..",
  "..pp.....pp.",
  "..p......pp.",
  ".ff.......ff",
];

const walkPass: SpriteFrame = [
  "....####....",
  "...######...",
  "...####e....",
  "....####....",
  "....ssss....",
  "...sssss....",
  "...ssssss...",
  "...sssss#...",
  "...#sss.....",
  "....pppp....",
  "....ppppp...",
  "....pp.pp...",
  "....pp..pp..",
  "....pp..pp..",
  "....pp...p..",
  "...fff...ff.",
];

const runReach: SpriteFrame = [
  "............",
  ".....####...",
  "....######..",
  "....####e...",
  ".....####...",
  "....ssss....",
  "...sssss.ss.",
  "..ss.sss..#.",
  ".#...sss....",
  ".....ppp....",
  "....pppp....",
  "...pp..pp...",
  "..pp....pp..",
  ".pp......pp.",
  "pp........p.",
  "f.........ff",
];

const runFloat: SpriteFrame = [
  ".....####...",
  "....######..",
  "....####e...",
  ".....####...",
  "....ssss....",
  "...ssssss...",
  "...s.sss.s..",
  "..#..sss..#.",
  ".....ppp....",
  ".....pppp...",
  "....pp.ppp..",
  "...pp...pp..",
  "..pp.....p..",
  "..ff.....pp.",
  "..........f.",
  "............",
];

const runKnee: SpriteFrame = [
  "............",
  ".....####...",
  "....######..",
  "....####e...",
  ".....####...",
  "....ssss....",
  "...ssssss...",
  "...sssss.#..",
  "..#..ppp....",
  ".....pppp...",
  ".....ppppp..",
  ".....pp..pp.",
  ".....pp..ff.",
  ".....pp.....",
  ".....pp.....",
  ".....ff.....",
];

export const personSprite: Sprite = {
  frames: [standing, walkStride, walkPass, runReach, runFloat, runKnee],
  cycles: { idle: [0], walk: [1, 2], run: [3, 4, 5, 4] },
  stride: { walk: 9, run: 13 },
};

const dogStand: SpriteFrame = [
  "..........##",
  "#........#e#",
  ".#......####",
  "..#######s..",
  "..########..",
  "..##....##..",
  "..#.....#...",
  "..#.....#...",
];

const dogReach: SpriteFrame = [
  "..........##",
  "#........#e#",
  ".#......####",
  "..#######s..",
  "..########..",
  ".##.....##..",
  ".#.......#..",
  "#.........#.",
];

const dogGather: SpriteFrame = [
  "............",
  "..........##",
  "##.......#e#",
  "..#.....####",
  "..#######s..",
  "..########..",
  "...##..##...",
  "...#...#....",
];

export const dogSprite: Sprite = {
  frames: [dogStand, dogReach, dogGather],
  cycles: { idle: [0], walk: [1, 0], run: [1, 2] },
  stride: { walk: 7, run: 11 },
};

/** Tailwind fill class per sprite character; tokens keep both themes legible. */
export const spritePalette: Record<string, string> = {
  "#": "fill-ink",
  e: "fill-surface",
  s: "fill-accent-ink",
  p: "fill-ink-muted",
  f: "fill-ink",
};
