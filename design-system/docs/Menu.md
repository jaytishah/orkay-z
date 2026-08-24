---
category: Navigation
---

# Menu

The fullscreen navigation overlay.

Opens by animating `clip-path` from a closed inset to zero over 0.8s — never by fading,
and never by mounting. The panel stays in the DOM and is hidden with `visibility`, so the
transition has something to animate from.

Links are set large and centred and pick up brand red on hover — one of the few places the
accent colour is used.

## Usage

```tsx
import { Menu } from '@orkay/ds';

<Menu open links={[
  { label: 'Home', href: '#top' },
  { label: 'About Us', href: '#about' },
]} />
```
