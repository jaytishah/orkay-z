---
category: Modules
---

# DayCycleClock

The oversized clock dial behind the day-cycle chapter.

A 92vh ring with two hairline hands that swing to each hour as the visitor steps through
the day. Hands transition over 1.2s, so stepping reads as a sweep rather than a jump.

It is decorative, not a control: it carries `aria-hidden` and the real time is announced by
the numeral in the panel beside it.

**It is absolutely positioned and sized in viewport units** — give it a positioned parent
with real height or it will centre itself on the whole page.

## Usage

```tsx
import { DayCycleClock } from '@orkay/ds';

<DayCycleClock time="07:00" />
<DayCycleClock time="19:30" />
```
