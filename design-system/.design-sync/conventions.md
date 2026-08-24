## How to build with this system

ORKAY is a manufacturer's digital headquarters: quiet, black-and-white, photography-led.
No gradients, no shadows, **no border radius anywhere**, one accent colour. Everything is
uppercase. The photography carries all the warmth; the interface carries none.

### 1. Every section needs a polarity — this is the one rule that breaks things

There is no provider and no theme context. What each component needs instead is a **ground**:

```tsx
<Section polarity="dark">…</Section>   // black ground, white type
<Section polarity="light">…</Section>  // white ground, black type
```

`Section` emits `class="section ui-dark"` plus `data-polarity="dark"`. Put content in a bare
`<div>` instead and it inherits `--c-white` from `body`, so **black-on-black or white-on-white
is the default failure mode here.** If you are not using `Section`, put `ui-dark` or
`ui-light` on the wrapper yourself.

The page alternates dark → light → dark. That alternation is also what drives the wordmark's
ink inversion, which reads `data-polarity` — a section without it makes `Logo` render wrong
over it.

### 2. Two type sizes. That is the whole scale.

| Component | Class | Size |
|---|---|---|
| `Small` | `text-small` | 12px / 600 / 0.36px tracking |
| `Mid` | `h-mid` | `clamp(28px, 3.2vw, 48px)` |
| `Display` | `h-display` | `clamp(44px, 6.5vw, 110px)` |

The tension between 12px captions and 110px headlines **is** the identity. Do not invent a
16px or 24px step. Break display lines by hand with `<br />` — where the line breaks is a
composition decision, not a viewport accident.

### 3. Tokens

`--c-white` `--c-black` `--c-red` (`#DE2025`, the only accent) `--c-gray` `--c-gray-light`
· `--ease` (`cubic-bezier(0.7, 0, 0.3, 1)` — the house easing, used by every transition)
· `--dur` (0.8s) `--dur-slow` (1.2s) · `--pad` (`clamp(20px, 3vw, 56px)`, the section gutter)
· `--logo-size` `--logo-track`.

Reach for `var(--pad)` for section padding and `var(--ease)`/`var(--dur)` for any motion you
add, so it moves like the rest of the site. Nothing faster than 0.4s, nothing bouncy.

### 4. One button species

`Button` is a text link with a masked label swap — there is no filled button, no border and
no padding box in this system. Variants: `underline` (the standard CTA), `red`, `nav` (the
pill in the fixed header, the single place a fill appears), `plain`.

### 5. Components with a hard requirement

- **`Tile`** must sit in a flex row. It is an anchor with `flex: none` and a width clamp;
  inline, the width is ignored and the play glyph lands on the label.
- **`Logo`** is white until the host app's ink pass clips its `logo__layer--ink` layer. On a
  light section with no such pass it is invisible — place it over dark imagery.
- **`Header`** hardcodes white type. It only ever goes over dark imagery or a dark section.
- **`Burger`** uses `mix-blend-mode: difference` and only inverts correctly while it inherits
  white, the way `Header` sets it.
- **`DayCycleClock`** is absolutely positioned at 92vh — give it a positioned parent with
  real height.

### 6. Where the truth is

Read `styles.css` and its `@import` closure before styling anything — it is the shipping
site's own CSS, generated from it, not a summary. Per-component contracts are in each
`components/<group>/<Name>/<Name>.prompt.md`, and the full design rationale (logo system,
motion vocabulary, photography direction) is in `guidelines/DESIGN.md`.

### 7. A typical composition

```tsx
import { Section, Small, Display, Button, StatItem } from '@orkay/ds';

<Section polarity="dark" id="exports">
  <Small>Export Network</Small>
  <Display>Morbi to<br />40+ countries</Display>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'calc(var(--pad) / 2)',
                borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: '10vh' }}>
    <StatItem value="30" label="years in Morbi" />
    <StatItem value="60,000" label="sq.m a day" />
    <StatItem value="40+" label="countries served" />
    <StatItem value="1,000+" label="designs in catalogue" />
  </div>
  <Button label="Request Catalogue" variant="underline" href="#formats" />
</Section>
```

Layout glue is your own CSS using the tokens above. The library supplies the parts and the
type roles; it does not supply a grid system, and it does not need one.
