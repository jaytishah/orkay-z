import { FloatingActions } from '@orkay/ds';
import type { ReactNode } from 'react';

const DARK_SLAB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23241f1c'/%3E%3Cstop offset='.55' stop-color='%233d3531'/%3E%3Cstop offset='1' stop-color='%23171310'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='480' height='360' fill='url(%23g)'/%3E%3Cpath d='M-20 250 C 110 190 180 300 500 140' stroke='%23b9ab97' stroke-opacity='.42' stroke-width='2.5' fill='none'/%3E%3Cpath d='M-20 296 C 140 240 240 320 500 196' stroke='%23d8cbb6' stroke-opacity='.22' stroke-width='1.2' fill='none'/%3E%3Cpath d='M-20 190 C 160 150 250 210 500 96' stroke='%23a2937f' stroke-opacity='.18' stroke-width='1' fill='none'/%3E%3C/svg%3E";

const LIGHT_SLAB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Cdefs%3E%3ClinearGradient id='l' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23efeae2'/%3E%3Cstop offset='.5' stop-color='%23dcd4c8'/%3E%3Cstop offset='1' stop-color='%23c9bfb0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='480' height='360' fill='url(%23l)'/%3E%3Cpath d='M-20 230 C 120 170 190 280 500 120' stroke='%238d8274' stroke-opacity='.4' stroke-width='2' fill='none'/%3E%3Cpath d='M-20 280 C 150 220 250 300 500 180' stroke='%236f6558' stroke-opacity='.2' stroke-width='1' fill='none'/%3E%3C/svg%3E";

/* The site's chrome is position:fixed. A transform on the wrapper makes it the
   containing block, so a card holds the component instead of it escaping to the
   viewport. Pass `fixed` only when the component needs a hard box to lay out
   against — otherwise height stays open so nothing gets clipped. */
function Frame({ ground = 'dark', h, w, pad = 28, fixed, children }: {
  ground?: 'dark' | 'light'; h?: number; w?: number; pad?: number;
  fixed?: boolean; children: ReactNode;
}) {
  return (
    <div
      className={ground === 'dark' ? 'ui-dark' : 'ui-light'}
      style={{
        position: 'relative', transform: 'translateZ(0)', padding: pad,
        minHeight: h, height: fixed ? h : undefined, width: w,
        overflow: fixed ? 'hidden' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* chatReady swaps the anchor for a button and is visually identical, so there is
   only one card here — the difference is in the API, not the render. */
export function ContactFallback() {
  return (
    <Frame h={230} pad={0} fixed>
      <FloatingActions whatsapp="919104488859" />
    </Frame>
  );
}
