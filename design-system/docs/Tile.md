---
category: Cards
---

# Tile

The paired tiles under the film-curtain headline.

Square, flat, no radius — one usually dark with a play glyph, one light with a headline
and a call to action.

The CTA rule is a two-layer wipe: a static hairline with a second line sliding across it
from the left on hover. The play glyph scales 1.3 on hover. Both on the house easing.

**It must sit in a flex row.** The tile is an anchor with `flex: none` and a width clamp;
outside a flex container it stays inline, the width is ignored and the play glyph lands
on top of the label.

## Usage

```tsx
import { Tile } from '@orkay/ds';

<Tile variant="dark" label="About the factory" play />
<Tile variant="light" label="Private label" headline="Custom Runs" cta="See the range" />
```
