import { type CSSProperties, Fragment } from "react";

/**
 * Splits a heading into masked words. The rise animation is driven by an
 * enclosing `Reveal` (see `.split-word` in globals.css), so server HTML and
 * reduced motion render the plain, fully visible sentence.
 */
export function SplitText({ children }: { children: string }) {
  const words = children.split(" ");

  return words.map((word, index) => (
    <Fragment key={`${index}-${word}`}>
      <span className="split-word">
        <span style={{ "--word-index": index } as CSSProperties}>{word}</span>
      </span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ));
}
