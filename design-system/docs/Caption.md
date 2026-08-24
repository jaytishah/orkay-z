---
category: Layout
---

# Caption

The dense caption block in the corner of a full-bleed image.

Set in the 12px role and capped at 66 characters so it stays a column against the
photograph rather than a paragraph across it.

Captions in this system sit in surprising corners — bottom-left, right-aligned edges — and
are never centred.

`placement="corner"` adds the absolute section-corner placement and needs a positioned
section with real height around it; the default `flow` sets the same type in normal flow.

## Usage

```tsx
import { Caption } from '@orkay/ds';

<Caption>The lobby is built the way grand hotels are built.</Caption>
```
