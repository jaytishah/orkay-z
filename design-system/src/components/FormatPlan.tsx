import type { CSSProperties } from 'react';
import { cx } from './cx';

export interface FormatPlanProps {
  /** Tile width in millimetres. */
  width?: number;
  /** Tile height in millimetres. */
  height?: number;
  /** Sizing escape hatch — the drawing is 20vw wide by default. */
  style?: CSSProperties;
  className?: string;
}

/**
 * The technical plan drawing for a tile format — a hairline rectangle in the
 * true aspect ratio of the size, with dimension rules and millimetre labels.
 *
 * It reads as a drawing off an engineer's sheet, not a product shot: 1.5px
 * stroke on the tile, 0.75px on the dimension lines, no fill, no shadow. When
 * the format changes the rectangle redraws along its own path length rather
 * than cross-fading.
 */
export function FormatPlan({ width = 600, height = 1200, style, className }: FormatPlanProps) {
  const maxW = 200, maxH = 320;
  const ratio = width / height;
  const h = ratio > maxW / maxH ? maxW / ratio : maxH;
  const w = h * ratio;
  const x = 60 + (maxW - w) / 2;
  const y = 20 + (maxH - h) / 2;
  return (
    <div className={cx('formats__plan', className)} style={style}>
      <svg viewBox="0 0 420 360" fill="none" aria-hidden="true">
        <rect x={x} y={y} width={w} height={h} stroke="currentColor" strokeWidth="1.5" pathLength="100" />
        <line x1="36" y1={y} x2="36" y2={y + h} stroke="currentColor" strokeWidth="0.75" />
        <line x1={x} y1="352" x2={x + w} y2="352" stroke="currentColor" strokeWidth="0.75" />
        <text x="14" y={y + h / 2} fill="currentColor" fontSize="12" letterSpacing="1" transform={`rotate(-90 22 ${y + h / 2})`}>{height}</text>
        <text x={x + w / 2} y="345" fill="currentColor" fontSize="12" letterSpacing="1" textAnchor="middle">{width}</text>
      </svg>
    </div>
  );
}
