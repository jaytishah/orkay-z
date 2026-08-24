import { cx } from './cx';

export interface LogoProps {
  /** `xl` is the 2.7x hero treatment; it eases down to `default` on first scroll. */
  size?: 'default' | 'xl';
  /** Link target. Defaults to the top-of-page anchor. */
  href?: string;
  className?: string;
}

function Glyphs() {
  return (
    <>
      <span className="logo__o">
        <span className="logo__dot" />
      </span>
      <span className="logo__rest">RKAY</span>
      <span className="logo__reg">&#8482;</span>
      <span className="logo__tag">Tiles</span>
    </>
  );
}

/**
 * The fixed brand wordmark — the most distinctive element in the system.
 *
 * The `O` is the brand bullseye: a `currentColor` ring with a brand-red centre
 * dot. The mark renders as two stacked layers — a base layer and an `ink` clone
 * on top. At runtime the site measures which `ui-light` sections sit under the
 * mark each frame and clips the ink layer to exactly those rectangles, so the
 * wordmark is black over white sections and white over dark ones, splitting
 * mid-letter during a transition. That clipping is driven by the host app; the
 * component ships both layers ready for it and renders correctly without it.
 */
export function Logo({ size = 'default', href = '#top', className }: LogoProps) {
  return (
    <a
      href={href}
      className={cx('logo', size === 'xl' && 'logo--xl', className)}
      aria-label="ORKAY — back to top"
    >
      <span className="logo__layer logo__layer--base"><Glyphs /></span>
      <span className="logo__layer logo__layer--ink" aria-hidden="true"><Glyphs /></span>
    </a>
  );
}
