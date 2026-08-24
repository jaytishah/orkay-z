---
category: Cards
---

# StatItem

One cell of the trust-figures grid.

The figure in the mid role, the label in muted 12px beneath it. The rule above belongs to
the grid, not the item, so items never carry their own border.

Figures count up from zero when the grid first enters view. **Every number shown on the
site must come from Orkay's verified figures**, not from a brochure.

## Usage

```tsx
import { StatItem } from '@orkay/ds';

<StatItem value="60,000" label="sq.m a day" />
<StatItem value="35+" label="countries" />
```
