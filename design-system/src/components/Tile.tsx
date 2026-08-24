import type { CSSProperties } from 'react';
import { cx } from './cx';

export interface TileProps {
  /** Ground colour. `dark` is the video-tile treatment, `light` the CTA treatment. */
  variant?: 'dark' | 'light';
  /** Small label pinned to the top of the tile. */
  label: string;
  /** Optional headline in the mid role, centred. */
  headline?: string;
  /** Optional call to action at the foot, with the wipe rule under it. */
  cta?: string;
  /** Shows the centred play glyph. Use on `dark` tiles that open media. */
  play?: boolean;
  href?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * The paired tiles that sit under the film-curtain headline. Square, flat, no
 * radius — one usually dark with a play glyph, one light with a headline and a
 * call to action.
 *
 * The CTA rule is a two-layer wipe: a static hairline with a second line that
 * slides across it from the left on hover. The play glyph scales 1.3 on hover.
 * Both run on the house easing.
 */
export function Tile({
  variant = 'dark', label, headline, cta, play, href = '#', style, className,
}: TileProps) {
  return (
    <a className={cx('z9-tile', `z9-tile--${variant}`, className)} href={href} style={style}>
      <span className="z9-tile__label text-small">{label}</span>
      {play ? <span className="z9-tile__play" aria-hidden="true">&#9654;</span> : null}
      {headline ? <span className="z9-tile__mid h-mid">{headline}</span> : null}
      {cta ? (
        <span className="z9-tile__cta">
          <span className="z9-tile__word text-small">
            {cta}
            <i className="z9-tile__rule" aria-hidden="true" />
          </span>
        </span>
      ) : null}
    </a>
  );
}
