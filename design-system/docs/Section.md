---
category: Layout
---

# Section

The polarity primitive every section is built on.

Every section is one of exactly two polarities: `dark` (black ground, white type) or
`light` (white ground, black type). The page alternates between them.

That alternation drives the logo's ink clipping, which reads the `data-polarity` attribute
this component emits. **A section that skips it is invisible to the wordmark and the mark
will render wrong over it.**

There is no third ground colour, no tint and no gradient anywhere in the system.

## Usage

```tsx
import { Section } from '@orkay/ds';

<Section polarity="dark" id="exports">
  <Display>Morbi to<br />40+ countries</Display>
</Section>
```
