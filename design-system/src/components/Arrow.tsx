import { cx } from './cx';

export interface ArrowProps {
  /** Which way it points. */
  direction?: 'next' | 'prev';
  /** Accessible label — always set one, the glyph alone reads as punctuation. */
  'aria-label'?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * The slider arrow — a bare glyph that nudges 6px in its own direction on hover.
 * Used by the day-cycle stepper and the applications stepper. Never given a
 * border or a background; it is a stroke, not a control surface.
 */
export function Arrow({ direction = 'next', onClick, className, ...rest }: ArrowProps) {
  return (
    <button
      type="button"
      className={cx('arrow', direction === 'prev' && 'arrow--prev', className)}
      onClick={onClick}
      aria-label={rest['aria-label'] ?? (direction === 'prev' ? 'Previous' : 'Next')}
    >
      {direction === 'prev' ? '\u2190' : '\u2192'}
    </button>
  );
}
