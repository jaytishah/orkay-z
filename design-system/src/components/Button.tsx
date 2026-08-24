import { cx } from './cx';

export type ButtonVariant = 'plain' | 'underline' | 'red' | 'nav';

export interface ButtonProps {
  /** The label. Rendered twice — the clone is what slides in on hover. */
  label: string;
  /** `underline` rules the label, `red` paints it brand red, `nav` is the pill in the fixed header. */
  variant?: ButtonVariant;
  /** Renders an anchor when set, a button otherwise. */
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * The only button species in the system — a text link with a masked label swap.
 * There is no filled button, no border, no radius and no padding box anywhere
 * on the site. On hover the label slides up out of its clip window while an
 * identical clone rises into its place, over 0.8s on the house easing.
 *
 * The label is deliberately a string rather than children: the mask needs two
 * identical copies of it, and letting callers pass arbitrary nodes breaks the swap.
 */
export function Button({ label, variant = 'plain', href, onClick, className }: ButtonProps) {
  const cls = cx('btn', variant !== 'plain' && `btn--${variant}`, className);
  const inner = (
    <span className="btn__mask">
      <span className="btn__text">{label}</span>
      <span className="btn__text btn__text--clone">{label}</span>
    </span>
  );
  return href
    ? <a className={cls} href={href} onClick={onClick}>{inner}</a>
    : <button className={cls} type="button" onClick={onClick}>{inner}</button>;
}
