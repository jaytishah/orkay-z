---
category: Actions
---

# Button

The only button species — a text link with a masked label swap.

There is no filled button, no border, no radius and no padding box anywhere on this site.
On hover the label slides up out of its clip window while an identical clone rises into
place, over 0.8s on the house easing.

`label` is a string rather than children on purpose: the mask needs two identical copies,
and arbitrary nodes break the swap.

- `plain` — bare label
- `underline` — ruled, the standard CTA
- `red` — brand accent, used sparingly
- `nav` — the pill in the fixed header, the one place a fill appears

## Usage

```tsx
import { Button } from '@orkay/ds';

<Button label="Request Catalogue" variant="nav" href="#formats" />
<Button label="See the range" variant="underline" />
```
