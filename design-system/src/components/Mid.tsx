import type { ReactNode } from 'react';
import { cx } from './cx';

export interface MidProps {
  children?: ReactNode;
  /** Heading level. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
}

/**
 * The chapter-statement type role — `clamp(28px, 3.2vw, 48px)`, line height 1.07.
 * Sits between the 12px caption and the full `Display` headline; used for section
 * statements that need to read as prose rather than as a poster.
 */
export function Mid({ children, as: Tag = 'h2', className }: MidProps) {
  return <Tag className={cx('h-mid', className)}>{children}</Tag>;
}
