import { cx } from './cx';

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuProps {
  links: MenuLink[];
  /** Open state. The overlay animates by clip-path, so it stays in the DOM when closed. */
  open?: boolean;
  className?: string;
}

/**
 * The fullscreen navigation overlay. It opens by animating `clip-path` from a
 * closed inset to zero over 0.8s on the house easing — never by fading, and never
 * by mounting: the panel stays in the DOM and is hidden with `visibility`, so the
 * transition has something to animate from.
 *
 * Links are set large and centred, and pick up brand red on hover — one of the
 * few places the accent colour is used.
 */
export function Menu({ links, open = false, className }: MenuProps) {
  return (
    <div className={cx('menu', open && 'is-open', className)} aria-hidden={!open}>
      <nav className="menu__nav">
        {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
      </nav>
    </div>
  );
}
