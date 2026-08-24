import { cx } from './cx';

export interface BurgerProps {
  onClick?: () => void;
  'aria-label'?: string;
  className?: string;
}

/**
 * The menu trigger — three hairlines, 88px wide, in `mix-blend-mode: difference`
 * so it stays legible over both dark imagery and white sections without any
 * polarity logic of its own. The outer lines spread 3px on hover.
 */
export function Burger({ onClick, className, ...rest }: BurgerProps) {
  return (
    <button
      type="button"
      className={cx('burger', className)}
      onClick={onClick}
      aria-label={rest['aria-label'] ?? 'Open menu'}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
