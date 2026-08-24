---
category: Cards
---

# LocCard

The card used in the horizontal image strip.

The caption sits **inside** the frame at the bottom left, over the image, rather than
beneath it — meta line first in muted 12px, then the title in the mid role. The image
scales 1.05 on hover behind a fixed frame.

The card is half its strip's width by default; pass `style` to size it outside that strip.

## Usage

```tsx
import { LocCard } from '@orkay/ds';

<LocCard title="Morbi" meta="Seven units" src={slab} alt="Veined black marble-look porcelain slab" />
```
