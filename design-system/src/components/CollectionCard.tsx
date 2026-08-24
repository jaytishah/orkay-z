import { cx } from './cx';

export interface CollectionCardProps {
  /** Collection name, set in the mid type role. */
  name: string;
  /** Finish and format line, e.g. `Glossy · 600x1200`. */
  meta?: string;
  src: string;
  alt: string;
  href?: string;
  className?: string;
}

/**
 * A collection tile from the horizontal collections track. The image sits in a
 * fixed-height figure and scales 1.06 on hover over 1.2s — the slow scale is the
 * point, a fast one reads as a web store rather than a manufacturer.
 *
 * Name goes in the mid role, the finish/format line underneath in muted 12px.
 */
export function CollectionCard({ name, meta, src, alt, href = '#', className }: CollectionCardProps) {
  return (
    <a className={cx('collections__card', className)} href={href}>
      <figure><img src={src} alt={alt} /></figure>
      <p className="h-mid">{name}</p>
      {meta ? <p className="text-small collections__meta">{meta}</p> : null}
    </a>
  );
}
