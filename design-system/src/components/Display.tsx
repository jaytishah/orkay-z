import type { ReactNode } from 'react';
import { cx } from './cx';

export interface DisplayProps {
  children?: ReactNode;
  /** Heading level. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
}

/**
 * The poster headline role — `clamp(44px, 6.5vw, 110px)`, line height 1.02.
 * Section titles are set in this and nothing else. Headlines are allowed to
 * overflow the viewport edge on purpose; break lines by hand with `<br />`
 * rather than letting the browser wrap them.
 */
export function Display({ children, as: Tag = 'h2', className }: DisplayProps) {
  return <Tag className={cx('h-display', className)}>{children}</Tag>;
}
