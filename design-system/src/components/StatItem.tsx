import { cx } from './cx';

export interface StatItemProps {
  /** The figure itself, e.g. `60,000` or `35+`. */
  value: string;
  /** What it counts, e.g. `sq.m a day`. */
  label: string;
  className?: string;
}

/**
 * One cell of the trust-figures grid. The figure is set in the mid role, the
 * label in muted 12px beneath it, and the row above is ruled — the rule belongs
 * to the grid, not to the item, so items never carry their own border.
 *
 * Figures count up from zero when the grid first enters view. Every number shown
 * on the site has to come from Orkay's verified figures, not from a brochure.
 */
export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div className={cx('advantage__item', className)}>
      <p className="h-mid">{value}</p>
      <p className="text-small advantage__item-desc">{label}</p>
    </div>
  );
}
