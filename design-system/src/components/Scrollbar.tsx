import { cx } from './cx';

export interface ScrollbarProps {
  /** Thumb height as a CSS length, e.g. `18%`. Driven by the scroll engine at runtime. */
  thumbHeight?: string;
  /** Thumb offset from the top as a CSS length. */
  thumbTop?: string;
  className?: string;
}

/**
 * The replacement scrollbar — a 3px thumb pinned to the right edge. The native
 * bar is hidden site-wide, so this is the only scroll affordance the visitor gets.
 * Position and height are written by the smooth-scroll engine each frame; the
 * props here exist so the component can be rendered in a static state.
 */
export function Scrollbar({ thumbHeight = '18%', thumbTop = '0%', className }: ScrollbarProps) {
  return (
    <div className={cx('scrollbar', className)}>
      <span className="scrollbar__thumb" style={{ height: thumbHeight, top: thumbTop }} />
    </div>
  );
}
