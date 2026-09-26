import { type Sprite, spritePalette } from "@/components/contact/footer-sprites";

export const PIXEL = 4;

export function frameSize(sprite: Sprite) {
  const frame = sprite.frames[0]!;
  return { width: frame[0]!.length * PIXEL, height: frame.length * PIXEL };
}

/** All frames side by side in one SVG; horizontal runs merge into single rects. */
export function SpriteSheet({ sprite }: { sprite: Sprite }) {
  const columns = sprite.frames[0]![0]!.length;
  const rows = sprite.frames[0]!.length;
  const rects: { x: number; y: number; width: number; className: string }[] = [];

  sprite.frames.forEach((frame, frameIndex) => {
    frame.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const char = row[x]!;
        let end = x + 1;
        while (end < row.length && row[end] === char) end += 1;
        const className = spritePalette[char];
        if (className) rects.push({ x: frameIndex * columns + x, y, width: end - x, className });
        x = end;
      }
    });
  });

  return (
    <svg
      className="absolute left-0 top-0 block"
      data-sprite-sheet=""
      height={rows * PIXEL}
      shapeRendering="crispEdges"
      viewBox={`0 0 ${columns * sprite.frames.length} ${rows}`}
      width={columns * sprite.frames.length * PIXEL}
    >
      {rects.map((rect) => (
        <rect
          className={rect.className}
          height={1}
          key={`${rect.x}-${rect.y}`}
          width={rect.width}
          x={rect.x}
          y={rect.y}
        />
      ))}
    </svg>
  );
}
