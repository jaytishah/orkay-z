import type { CSSProperties, ReactNode } from 'react';
import { cx } from './cx';

export interface CaptionProps {
  children?: ReactNode;
  /**
   * `corner` pins the block into a section corner the way the experience
   * chapters do — it needs a positioned section with real height around it.
   * `flow` (the default) sets it in normal flow at the same measure.
   */
  placement?: 'flow' | 'corner';
  style?: CSSProperties;
  className?: string;
}

/**
 * The dense caption block that runs alongside a full-bleed image section.
 * Set in the 12px role and capped at 66 characters so it stays a column against
 * the photograph rather than a paragraph across it.
 *
 * Captions in this system sit in surprising corners — bottom-left, right-aligned
 * edges — and are never centred. Use `placement="corner"` only inside a
 * positioned section; on its own it will pin itself against the page.
 */
export function Caption({ children, placement = 'flow', style, className }: CaptionProps) {
  return (
    <p
      className={cx('text-small', placement === 'corner' && 'experience__caption', className)}
      style={placement === 'flow' ? { maxWidth: '66ch', ...style } : style}
    >
      {children}
    </p>
  );
}
