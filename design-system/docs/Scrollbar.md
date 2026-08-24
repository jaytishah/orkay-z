---
category: Navigation
---

# Scrollbar

The replacement scrollbar — a 3px thumb at the right edge.

The native bar is hidden site-wide, so this is the only scroll affordance the visitor
gets. Position and height are written by the smooth-scroll engine each frame; the props
exist so the component can be rendered in a static state.

## Usage

```tsx
import { Scrollbar } from '@orkay/ds';

<Scrollbar thumbHeight="18%" thumbTop="24%" />
```
