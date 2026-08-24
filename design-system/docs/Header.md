---
category: Navigation
---

# Header

The fixed, transparent page header.

Full width, ~118px tall, content scrolling beneath. It has no background and never gains
one on scroll.

The bar is `pointer-events: none` so it never blocks the page; only its links and buttons
take pointer events back. Put the nav CTA and the burger inside it and nothing else —
this system has one header action.

The bar hardcodes white type, so it is only ever shown over dark imagery or a dark
section. There is no light-ground variant.

## Usage

```tsx
import { Header } from '@orkay/ds';

<Header>
  <Button label="Request Catalogue" variant="nav" href="#formats" />
  <Burger />
</Header>
```
