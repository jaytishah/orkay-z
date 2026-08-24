import type { ReactNode } from 'react';
import { cx } from './cx';

export interface HeaderProps {
  /** Right-hand controls — normally a `Button` with `variant="nav"` and a `Burger`. */
  children?: ReactNode;
  className?: string;
}

/**
 * The fixed page header — full width, transparent, ~118px tall, with content
 * scrolling beneath it. It has no background and never gains one on scroll.
 *
 * The bar itself is `pointer-events: none` so it never blocks the page; only its
 * links and buttons take pointer events back. Put the nav CTA and the burger
 * inside it and nothing else — this system has one header action.
 */
export function Header({ children, className }: HeaderProps) {
  return (
    <header className={cx('header', className)}>
      <nav className="header__nav">{children}</nav>
    </header>
  );
}
