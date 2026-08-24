import { cx } from './cx';

export interface PaginationProps {
  /** 1-based index of the active slide. */
  current: number;
  /** Total slide count. */
  total: number;
  className?: string;
}

/**
 * The slide counter used by every stepped chapter — `1 — 5`.
 * Set in the 12px caption role and parked in a corner of the pinned section,
 * never centred and never styled as a control. The trailing total is muted.
 */
export function Pagination({ current, total, className }: PaginationProps) {
  return (
    <p className={cx('text-small', className)}>
      <span>{current}</span> &#8212; <span>{total}</span>
    </p>
  );
}
