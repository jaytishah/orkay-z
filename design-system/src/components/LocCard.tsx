import type { CSSProperties } from 'react';
import { cx } from './cx';

export interface LocCardProps {
  /** Headline, set in the mid role. */
  title: string;
  /** Muted line above the title — distance, category or format. */
  meta?: string;
  src: string;
  alt: string;
  /** Sizing escape hatch — the card is half its strip by default. */
  style?: CSSProperties;
  className?: string;
}

/**
 * The card used in the horizontal image strip. The caption sits *inside* the
 * frame at the bottom left, over the image, rather than beneath it — meta line
 * first in muted 12px, then the title in the mid role. The image scales 1.05 on
 * hover behind a fixed frame.
 */
export function LocCard({ title, meta, src, alt, style, className }: LocCardProps) {
  return (
    <figure className={cx('z9-loc-card', className)} style={style}>
      <img src={src} alt={alt} />
      <figcaption className="z9-loc-card__lb">
        {meta ? <p className="text-small z9-loc-card__meta">{meta}</p> : null}
        <p className="h-mid">{title}</p>
      </figcaption>
    </figure>
  );
}
