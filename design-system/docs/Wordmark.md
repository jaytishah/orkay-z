---
category: Brand
---

# Wordmark

The full-bleed glyph row spanning the hero foot.

Each character is its own span and the row is `space-between`, so the glyphs touch both
viewport edges exactly whatever the font metrics do.

Never set letter-spacing on it — the spacing *is* the layout.

## Usage

```tsx
import { Wordmark } from '@orkay/ds';

<Wordmark />
<Wordmark lead="ORKAY" trail="2026" />
```
