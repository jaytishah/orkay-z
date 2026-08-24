---
category: Layout
---

# SplitSlide

The signature half-copy, half-photograph composition.

A full-viewport slide split down the middle: copy on one side, a photograph butting the
viewport edge on the other.

The copy half is vertically centred with a deep top pad so text clears the fixed header,
and the description is capped at 440px so it stays a column. **Alternate `mediaSide`
between consecutive slides** — the alternation is what stops a pinned chapter reading as a
slideshow.

It takes its type colour from the section around it, so give it a `Section` or a
`ui-dark`/`ui-light` ground — with neither, the mid-role title renders white on white.

## Usage

```tsx
import { SplitSlide } from '@orkay/ds';

<SplitSlide title="Glazed Vitrified" desc="Full-body porcelain…" src={slab} alt="Veined black marble-look porcelain slab" />
<SplitSlide title="Porcelain Slab" mediaSide="left" src={slab} alt="Veined black marble-look porcelain slab" />
```
