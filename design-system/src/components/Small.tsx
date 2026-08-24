import type { ReactNode } from 'react';
import { cx } from './cx';

export interface SmallProps {
  children?: ReactNode;
  /** Element to render. Defaults to `p`. */
  as?: 'p' | 'span' | 'div' | 'li' | 'figcaption';
  className?: string;
}

/**
 * The 12px caption role — the smaller of the design system's only two text sizes.
 * 12px / 600 / uppercase / 0.36px tracking, 16px line height.
 * Used for every label, caption, note, nav item and body paragraph on the site.
 * The tension between this and `Display` IS the ORKAY visual identity; there are
 * deliberately no intermediate sizes.
 */
export function Small({ children, as: Tag = 'p', className }: SmallProps) {
  return <Tag className={cx('text-small', className)}>{children}</Tag>;
}
