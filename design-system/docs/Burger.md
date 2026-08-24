---
category: Actions
---

# Burger

The menu trigger — three hairlines in difference blend.

88px wide, in `mix-blend-mode: difference` so it stays legible over both dark imagery and
white sections without any polarity logic of its own. The outer lines spread 3px on hover.

The blend only works while the lines inherit **white**, the way the fixed header sets
it. Let them inherit a light section's black and they blend to white and disappear.

## Usage

```tsx
import { Burger } from '@orkay/ds';

<Burger onClick={openMenu} />
```
