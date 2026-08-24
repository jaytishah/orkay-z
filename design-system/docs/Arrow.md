---
category: Actions
---

# Arrow

The slider arrow — a bare glyph that nudges on hover.

Used by the day-cycle stepper and the applications stepper. Never given a border or a
background: it is a stroke, not a control surface. Always pass a real `aria-label` — the
glyph alone reads as punctuation to a screen reader.

## Usage

```tsx
import { Arrow } from '@orkay/ds';

<Arrow direction="prev" aria-label="Previous time" />
<Arrow direction="next" aria-label="Next time" />
```
