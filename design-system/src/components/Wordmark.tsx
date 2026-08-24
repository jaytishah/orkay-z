import { cx } from './cx';

export interface WordmarkProps {
  /** Left group of glyphs. */
  lead?: string;
  /** Right group of glyphs, separated from the lead by a fixed gap. */
  trail?: string;
  className?: string;
}

/**
 * The full-bleed glyph row that spans the hero foot — `SINCE 1996` by default.
 *
 * Each character is its own span and the row is `space-between`, so the glyphs
 * touch both viewport edges exactly whatever the font metrics do. Never set
 * letter-spacing on it; the spacing is the layout, not the type.
 */
export function Wordmark({ lead = 'SINCE', trail = '1996', className }: WordmarkProps) {
  return (
    <p className={cx('hero__wordmark', className)} aria-hidden="true">
      {[...lead].map((c, i) => <span key={`l${i}`}>{c}</span>)}
      <span className="hero__wordmark-gap" />
      {[...trail].map((c, i) => <span key={`t${i}`}>{c}</span>)}
    </p>
  );
}
