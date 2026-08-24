---
category: Modules
---

# FormatPlan

The technical plan drawing for a tile format.

A hairline rectangle in the true aspect ratio of the size, with dimension rules and
millimetre labels. It reads as a drawing off an engineer's sheet, not a product shot:
1.5px stroke on the tile, 0.75px on the dimension lines, no fill, no shadow.

When the format changes the rectangle redraws along its own path length rather than
cross-fading.

The drawing is 20vw wide by default, which collapses in a narrow container — pass
`style={{ width: 240 }}` to size it explicitly.

## Usage

```tsx
import { FormatPlan } from '@orkay/ds';

<FormatPlan width={600} height={1200} />
<FormatPlan width={800} height={800} />
```
