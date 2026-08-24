import type { ReactNode } from 'react';
import { cx } from './cx';

export interface SplitSlideProps {
  /** Headline, set in the mid role. */
  title: ReactNode;
  /** Supporting copy in muted 12px. */
  desc?: string;
  src: string;
  alt: string;
  /** Which half the image takes. Defaults to the right. */
  mediaSide?: 'left' | 'right';
  className?: string;
}

/**
 * The signature composition of the whole system: a full-viewport slide split in
 * half, copy on one side and a photograph butting the viewport edge on the other.
 *
 * The copy half is vertically centred with a deep top pad so the text sits below
 * the fixed header, and the description is capped at 440px so it stays a column.
 * Alternate `mediaSide` between consecutive slides — the alternation is what
 * stops a pinned chapter reading as a slideshow.
 */
export function SplitSlide({ title, desc, src, alt, mediaSide = 'right', className }: SplitSlideProps) {
  const media = <figure className="journey__media" key="m"><img src={src} alt={alt} /></figure>;
  const info = (
    <div className="journey__info" key="i">
      <h3 className="h-mid">{title}</h3>
      {desc ? <p className="text-small journey__desc">{desc}</p> : null}
    </div>
  );
  return (
    <article className={cx('journey__slide', className)}>
      {mediaSide === 'left' ? [media, info] : [info, media]}
    </article>
  );
}
