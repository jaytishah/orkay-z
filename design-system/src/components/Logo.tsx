import { cx } from './cx';
import { LOGO_DARK, LOGO_WHITE } from './logo-art';

export interface LogoProps {
  /** `xl` is the 2.7x hero treatment; it eases down to `default` on first scroll. */
  size?: 'default' | 'xl';
  /** Link target. Defaults to the top-of-page anchor. */
  href?: string;
  className?: string;
}

/**
 * The fixed brand wordmark — the most distinctive element in the system.
 *
 * The lockup is the client's own artwork (bullseye `O`, ORKAY, "since 1996",
 * red swoosh, TILES), inlined into the bundle so it travels with the design
 * system rather than resolving against a host origin that has no copy of it.
 *
 * The mark renders as two stacked layers — a white base and a dark `ink` clone
 * on top. At runtime the site measures which `ui-light` sections sit under the
 * mark each frame and clips the ink layer to exactly those rectangles, so the
 * wordmark is dark over light sections and white over dark ones, splitting
 * mid-letter during a transition. That clipping is driven by the host app; the
 * component ships both layers ready for it.
 *
 * Because `.logo__layer--ink` ships fully clipped (`inset(0 0 100% 0)`), only
 * the white layer is visible without that runtime pass — correct on the dark
 * grounds this system is built around, invisible on a light one until the pass
 * runs. Size comes from the `.logo` font-size: `.brandmark` is `1.55em` tall,
 * so the whole lockup scales from one number.
 */
export function Logo({ size = 'default', href = '#top', className }: LogoProps) {
  return (
    <a
      href={href}
      className={cx('logo', size === 'xl' && 'logo--xl', className)}
      aria-label="ORKAY — back to top"
    >
      <span className="logo__layer logo__layer--base">
        <img className="brandmark" src={LOGO_WHITE} alt="ORKAY Tiles" width={703} height={256} />
      </span>
      <span className="logo__layer logo__layer--ink" aria-hidden="true">
        <img className="brandmark" src={LOGO_DARK} alt="" width={703} height={256} />
      </span>
    </a>
  );
}
