# Build prompt — "Z9 opening sequence" for ORKAY Tiles

Hand this whole file to any AI coding tool. It describes the layout language, the
motion system, and the first three sections. It does **not** copy any code, copy
text, or assets from the reference site — only the layout/motion conventions that
luxury real-estate and material sites share.

---

## Reference feel

A luxury developer site: full-bleed photography, a small amount of very large
type, one accent colour, no rounded corners, no shadows, no gradients except a
scrim over photography. Everything moves on one easing curve, slowly. The page
scrolls on inertia (smooth scroll), and content arrives by *uncovering* rather
than fading — a clip-path wipe, never opacity alone.

## Stack

- Next.js App Router (`app/`), React 19, TypeScript
- `gsap` + `gsap/ScrollTrigger` for scroll triggers and pins
- `lenis` for inertial smooth scroll, driven from the GSAP ticker
- Plain CSS (no Tailwind, no CSS-in-JS). Global tokens + BEM-ish section classes
- Native HTML wherever it replaces script: `<details>` for expanders,
  `:target` for modals, CSS keyframes for the hero carousel

## Design tokens (CSS custom properties on `:root`)

```
--c-white #fff · --c-black #000 · --c-red #ed1c24 (ORKAY logo red, the only accent)
--c-gray #666 · --c-gray-light #aaa
--ease cubic-bezier(0.7, 0, 0.3, 1)   /* the ONLY easing in the project */
--dur 0.8s · --dur-slow 1.2s
--pad clamp(20px, 3vw, 56px)          /* the ONLY page gutter */
```

Rules: border-radius `0` everywhere (circles excepted), no box-shadows, uppercase
body text, `font-weight: 600`, three type sizes only —

```
.text-small  12px / 16px / letter-spacing .36px
.h-mid       clamp(28px, 3.2vw, 48px)
.h-display   clamp(44px, 6.5vw, 110px)
```

**Polarity:** every section is either `.ui-dark` (black bg, white text) or
`.ui-light` (white bg, black text) and carries `data-polarity`. Sections
alternate. The fixed logo re-clips itself per frame so its ink layer turns black
exactly where it overlaps a light section.

## Motion primitives (one client component, mounted once)

| Hook | Behaviour |
|---|---|
| `.img-reveal` | figure starts `clip-path: inset(0 0 100% 0)` and its `img` at `scale(1.1)`; on enter (ScrollTrigger `top 88%`, once) it wipes to `inset(0)` and the image settles to `scale(1)` over `--dur-slow` |
| `.img-reveal--r` | same, but wipes in from the right (`inset(0 0 0 100%)`) |
| `.reveal-lines` | JS splits the element's innerHTML on `<br>` into masked lines; each line's inner span starts at `translateY(110%)` and slides up, staggered 80 ms |
| `[data-parallax="0.9"]` | scrubbed `y` translation; `<1` lags the scroll, `>1` leads it |
| smooth scroll | `new Lenis({ lerp: 0.08 })`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `lagSmoothing(0)`; all `a[href^="#"]` route through `lenis.scrollTo(target, { duration: 1.6 })` |
| buttons | text in an `overflow:hidden` mask with a duplicate clone at `top:100%`; hover translates both up `-100%` so the label swaps in place |

Honour `prefers-reduced-motion: reduce`: disable all transitions/animations,
show every reveal in its final state, pause `<video>`, and un-pin every pinned
section so slides stack in normal flow.

---

## Section 01 — HERO

- Full-viewport (`100vh`), no padding, `overflow: hidden`, content bottom-aligned.
- Absolutely-positioned stack of three slides behind everything. Each slide
  crossfades on a 21 s CSS keyframe loop, offset 7 s apart, with a simultaneous
  slow zoom `scale(1.02) → scale(1.12)` (Ken Burns). Slide 1 may be a muted
  autoplay loop video instead of an image. **No JS.** Give slide 1 a base
  `opacity: 1` so reduced-motion (which kills the animation) still shows it.
- Bottom-to-top black scrim over the media so type stays readable.
- Bottom-left: `.h-display` headline, two lines, `reveal-lines`
  → *"The Luxury / of Surface"*.
- Below it, a row: a `--c-gray-light` lede on the left, a red underlined
  masked-swap CTA on the right. Reserve 76 px of right padding so the CTA never
  lands under floating action buttons.
- Right edge, vertically centred: three decorative dots (first one filled).
- Left edge at ~62vh: vertical `writing-mode: vertical-rl` "Scroll" label with a
  1 px rule under it that pulses `scaleY(0.2) → 1` on a 2.4 s loop.

## Section 02 — "SURFACES ON YOUR OWN TERMS" (light)

Two-column grid, gutter `calc(var(--pad) * 1.5)`, `padding-top: 20vh`.

- **Left column** is `position: sticky; top: 22vh` so the headline holds while
  the right column scrolls past: red 12 px eyebrow, `.h-mid` two-line headline
  with `reveal-lines`, then a grey paragraph capped at `40ch`.
- **Right column**, stacked:
  1. Image card → opens a video modal. Full-width figure `42vh`, image scales to
     `1.06` on hover, and a bottom bar with a top-fading black gradient holds a
     12 px label plus a 44 px circular play button that inverts on hover.
  2. Second card, same component, links onward (e.g. packing/loading specs).
     Use `img-reveal--r` on this one so the two cards wipe from opposite sides.
  3. Amenity list: five rows, `grid-template-columns: 28px 1fr auto`, 1 px
     hairline rules top and between, each row = inline 24 px stroked SVG icon +
     label + grey value. Rows turn red on hover.
- The video modal is a `:target` overlay — `position: fixed; inset: 0`,
  `background: rgba(0,0,0,.94)`, toggled by `opacity` + `visibility` (so its
  links leave the tab order when closed). The backdrop itself is an anchor back
  to the section id, which gives click-outside dismissal for free. Video is
  `controls preload="none"` — never autoplay inside a modal.

## Section 03 — "SEVEN UNITS, ONE STANDARD" (dark)

- Red eyebrow → `.h-display` two-line headline (`reveal-lines`, `max-width: 18ch`).
- Full-width `84vh` hero figure with `img-reveal` and `data-parallax="0.9"`.
- Two-column feature blocks, each with a 1 px top rule, an `.h-mid` two-line
  sub-head and a `--c-gray-light` paragraph capped at `42ch`.
- **Material gallery:** a head row with `.h-mid` "Materials" flush left and a
  grey photo count flush right; then a 4-column grid of `26vh` figures, each
  `img-reveal`, image scaling to `1.06` on hover. Below it a native `<details>`
  whose `<summary>` reads "View all N photos" in red with a `+` / `−` marker
  (`::after` content swap on `[open]`, `list-style: none`), revealing the
  remaining figures in the same grid.

## Responsive (`max-width: 900px`)

Both grids collapse to one column, the sticky column goes static, the material
grid drops to 2 columns, the hero meta row stacks, and the vertical "Scroll"
label plus the dots are hidden.

## Content notes for ORKAY

Manufacturer of vitrified and porcelain tiles, Morbi, Gujarat, India. Since 1996.
Seven production units, 16,000 sq.m/day, 1,000+ designs, exports to 40+ countries.
ISO 9001:2015, CE (CPR 305/2011). Positioning: *direct manufacturer, not a
trading house* — formats, finishes and private-label runs are negotiable because
nothing sits between the buyer and the kiln. Voice: short declarative sentences,
no adjective stacking, no exclamation marks.
