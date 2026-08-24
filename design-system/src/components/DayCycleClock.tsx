import type { CSSProperties } from 'react';
import { cx } from './cx';

export interface DayCycleClockProps {
  /** 24-hour time, e.g. `07:00`. Drives both hands. */
  time?: string;
  className?: string;
}

/** Turns `HH:MM` into the two hand angles the stylesheet reads as `--h` and `--m`. */
function hands(time: string): { h: number; m: number } {
  const [hh, mm] = time.split(':').map((n) => Number(n) || 0);
  return { h: ((hh % 12) * 30 + mm * 0.5), m: mm * 6 };
}

/**
 * The oversized clock dial behind the day-cycle chapter — a 92vh ring with two
 * hairline hands that swing to each hour as the visitor steps through the day.
 *
 * It is a decorative dial, not a control: it carries `aria-hidden` and the real
 * time is announced by the numeral in the panel beside it. The hands transition
 * over 1.2s on the house easing, so stepping reads as a sweep rather than a jump.
 *
 * It is absolutely positioned and sized in viewport units — give it a positioned
 * parent with real height or it will centre itself on the whole page.
 */
export function DayCycleClock({ time = '07:00', className }: DayCycleClockProps) {
  const { h, m } = hands(time);
  return (
    <div
      className={cx('daycycle__ring', className)}
      aria-hidden="true"
      style={{ '--h': h, '--m': m } as CSSProperties}
    >
      <i className="daycycle__hand daycycle__hand--h" />
      <i className="daycycle__hand daycycle__hand--m" />
      <i className="daycycle__pivot" />
    </div>
  );
}
