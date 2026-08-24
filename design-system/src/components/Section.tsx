import type { ReactNode } from 'react';
import { cx } from './cx';

export interface SectionProps {
  /** Black ground with white type, or white ground with black type. */
  polarity: 'dark' | 'light';
  children?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Every section on the site is one of exactly two polarities: `dark` (black
 * ground, white type) or `light` (white ground, black type). The page alternates
 * between them, and that alternation is what drives the logo's ink clipping —
 * which reads the `data-polarity` attribute this component emits. A section that
 * skips it will be invisible to the wordmark and the mark will render wrong over it.
 *
 * There is no third ground colour, no tint and no gradient anywhere in the system.
 */
export function Section({ polarity, children, id, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cx('section', polarity === 'dark' ? 'ui-dark' : 'ui-light', className)}
      data-polarity={polarity}
    >
      {children}
    </section>
  );
}
