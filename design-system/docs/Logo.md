---
category: Brand
---

# Logo

The fixed brand wordmark, with its two-layer ink inversion.

The most distinctive element in the system. The `O` is the brand bullseye — a
currentColor ring with a brand-red centre dot.

It renders as two stacked layers, a base and an `ink` clone. At runtime the site measures
which `ui-light` sections sit under the mark each frame and clips the ink layer to exactly
those rectangles, so the wordmark is black over white sections and white over dark ones,
splitting mid-letter during a transition. That clipping is the host app's job; the
component ships both layers ready for it and renders correctly without it.

**On a light section the mark is invisible on its own.** The base layer is hardcoded
white and the black ink clone ships fully clipped away, so nothing shows until the
runtime pass clips the ink in. Place it over dark imagery, or make sure that pass is running.

`size="xl"` is the 2.7x hero treatment that eases down to `default` on first scroll.

## Usage

```tsx
import { Logo } from '@orkay/ds';

<Logo />
<Logo size="xl" />
```
