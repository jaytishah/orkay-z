# Build prompt — Section 04 "LOCATION" (zorge9.estate/location)

Companion to `Z9-PROMPT.md`. Same tokens, same easing, same polarity system.
This file is a **behavioural spec reverse-engineered from the live page**, then
mapped onto ORKAY content. Nothing here copies their code, copy, or assets —
only the layout and motion conventions.

Reference stack (theirs) → our stack:

| zorge9.estate | ORKAY equivalent |
|---|---|
| Locomotive Scroll v4 (`data-scroll-section`, `data-scroll-sticky`, `.has-scroll-smooth`) | Lenis + GSAP ScrollTrigger |
| Barba.js page transitions | Next.js App Router |
| Splitting.js line split | `reveal-lines` primitive from `Z9-PROMPT.md` |
| jQuery `parallax` plugin patterns | ScrollTrigger `scrub` tweens |

**The one easing for everything on this page:** `cubic-bezier(0.7, 0, 0.3, 1)`.
UI/hover transitions are `0.4s`. Text reveals are `1.6s`. Nothing else exists.

---

## A. What happens BEFORE the section arrives

The preceding section (`#about`, "Life on Your Own Terms") is a **pinned
full-viewport layer**, not a normal block. Reproduce three things:

1. **Pin.** The about block is `position: sticky`, full height, with a
   negative bottom margin equal to the pin distance and a spacer pseudo-element
   of `calc(pin-distance + 33svh)`. In GSAP: `ScrollTrigger.create({ pin: true,
   pinSpacing: true, end: '+=133svh' })`.

2. **Counter-drift while pinned.** The about *content* (headline + cards) runs a
   scrubbed ±10svh drift across its whole life:

   ```
   progress -1.0 → translateY( 10svh)   // still below, floating up
   progress  0.0 → translateY(  0svh)   // parked
   progress  1.0 → translateY(-10svh)   // leaving upward
   ```

   Desktop only (`md-up`), clamped at both ends. The background video layer does
   **not** move — only the content, so the text appears to slide over a still frame.

3. **The handoff is a COVER, not a fade.** Location is opaque and light-polarity;
   it simply scrolls up over the pinned dark about layer. No crossfade, no
   opacity on the incoming section. The pinned layer underneath drifts up a
   further `-10svh` as it is covered (their `sectionOutTiny` pattern), which is
   what makes the cover read as a card sliding over a receding surface rather
   than a hard cut.

   ```
   // outgoing pinned layer, scrubbed
   progress 2.0 → translateY(  0svh)
   progress 1.0 → translateY(-10svh)
   ```

4. **Snap.** The section declares a snap point: `{ viewport: 0, element: 0,
   scrollable: true }` — the section's top snaps to the viewport top, but the
   section stays freely scrollable once engaged. Implement as a soft
   `ScrollTrigger` snap with `duration: { min: 0.2, max: 0.6 }`, never a hard
   scroll-snap CSS lock.

5. **URL.** The section carries a history plugin — scrolling into it rewrites
   the address bar to `/location` without a navigation. In Next.js:
   `history.replaceState` from a ScrollTrigger `onToggle`.

---

## B. The section itself

```
<section id="location" class="location section section--no-overflow ui-light">
```

`section--no-overflow` = `contain: content; overflow: hidden`. This matters —
every parallax child overflows its box by 20% and must be clipped.

Polarity flips **light** here (previous section is dark). Invisible
`data-themed-class` marker divs are placed immediately before and after the hero
image so the fixed header logo re-clips itself: `ui-dark` while it overlaps the
photo, `ui-light` once past it. That is the "zebra" logo behaviour from
`Z9-PROMPT.md`.

An `<h2 class="sr-only">Location</h2>` carries the real heading for a11y — the
visible giant "LOCATION" word later is a `<p>`.

### B1. Hero block — a 9-of-12 column, offset by 3

```
row
└ col--xs-4  col--md-9  offset--md-3        ← left quarter deliberately empty
   ├ [ui-dark marker]
   ├ <picture> hero image        .img-full .parallax-image-move
   ├ [ui-light marker]
   ├ <p class="text-small">      Privilege of Location
   └ <p class="h2" reveal-lines> [3-col indent] body sentence
```

- **Image parallax (`imageMove`).** The `<img>` is rendered at `height: 120%`
  inside an `overflow: hidden` picture, then scrubbed:

  ```
  entering viewport → translateY(0%)
  leaving  viewport → translateY(-16.667%)     // = -(120-100)/120
  ```

  Clamped at both ends. This is a *cover-crop drift*: the visible crop window
  travels down the photograph as you scroll. It is measured against the
  `<picture>` element, not the viewport.

- **Lazy-in.** Image ships as an inline SVG placeholder of the exact intrinsic
  size (`data:image/svg+xml,<svg width=360 height=360 …>`), `data-src` holds the
  real file, and the element is `opacity: 0` until decode, then fades in. Keeps
  layout stable, zero CLS. A `<noscript>` twin renders the plain image.

- **`Privilege of Location`** — 12px uppercase, letter-spacing `.03em`,
  weight 600. Two variants in the markup: one line on desktop, hard-broken
  `Privilege /  of Location` on mobile.

- **The body sentence** uses a *float-based first-line indent*, not
  `text-indent`: an empty `<span>` floated left, `width: calc(var(--grid-col) * 3)`,
  `height: 10px`. The first line clears three grid columns, every following line
  runs the full 9-column width. Desktop only. This is the detail that makes the
  paragraph look typeset rather than boxed.

  Verbatim copy on the live site:

  > **Privilege of Location**
  >
  > City skyscrapers and iconic landmarks are at your feet. The capital unfolds
  > before you like a grand bouquet of endless opportunities.

### B2. The title bar

`margin-top: 4.5 units` mobile / `8 units` desktop, then a bottom-aligned row:

```
row (align-items: flex-end)
├ col--md-8   (empty — pure whitespace)
└ col--md-4   <p class="h1 text-right" reveal-lines>Location</p>
<hr class="location__line">          ← margin-top: -1px, sits flush under the word
```

`.h1` is the display size: `10 × --scale-text-rem` at xxxxl, `8.5` at xxxl,
`5.6` at xxl, `4.8` at md, `2.4` mobile. Uppercase, weight 600,
`letter-spacing: 0`, `line-height: 1em`. The word is right-aligned and the
hairline runs the **full page width** beneath it — the word appears to rest on
the rule. Hidden on `sm-down`.

### B3. The card carousel

```
.js-location-container  (px-1, mt-1)
└ carousel  [md-up only]  slidesPerView: { xs: 1, md: 2 }  effect: imageMove
   └ ul.carousel__list__inner        cursor: grab; touch-action: pan-y
      └ li × 5  →  .location-card
```

**Card geometry**

| property | value |
|---|---|
| `aspect-ratio` | `1.42708` desktop · `1.33333` (4:3) mobile |
| slide width | `50%` exactly (`min-width` **and** `max-width`) |
| gap | `--item-spacing: calc(var(--scale-px) * 10)` |
| inner padding | `--card-spacing-h/v: calc(var(--scale-px) * 20)` |
| clip | `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)` — square corners, forces its own paint layer |
| scrim | `::before`, top-right, `70% × 70%`, `linear-gradient(225deg, rgba(bg,.5) 0, rgba(bg,0) 50%)` |

**Two independent parallaxes run on every card image at once.** This is the
"animation that coincides with the positioning" — the image is oversized on
*both* axes (`width: 120%`, `height: 120%`) precisely to give both movements
room to travel:

1. **Vertical, driven by page scroll.** Scrubbed against the carousel container,
   clamped:

   ```
   container entering → translateY(0%)
   container leaving  → translateY(-16%)
   ```

2. **Horizontal, driven by carousel position.** Each slide's picture wrapper
   counter-translates inside its crop:

   ```
   maxOffset = pictureWidth - cardWidth          // = 20% of card width
   p         = (clamp(slideOffset, -1.5, 1.5) + 1.5) / 3     // → 0…1
   translateX = -maxOffset * p
   ```

   Slides move at 100%; the photographs inside them move at ~80%. Depth without
   a single shadow.

**Card content** — bottom-left only, `max-width: 73%`: an (empty on the live
site) `text-small` eyebrow, then the name at `.h2` with `margin-top: 0.66`.
Cards are `ui-dark` regardless of section polarity — white type on photo.

Five cards, in order:

```
Walking park · School · Sport center · Embankment · Restaurants
```

**Navigation** — no visible arrows. An absolutely-positioned nav layer covers
the entire carousel and bleeds one page-gutter past both edges
(`left: -var(--spacing-layout); right: -var(--spacing-layout)`), split into two
`<button>`s of `50% × 100%`. Hovering the left half or right half shows a
**custom circular outline arrow that follows the pointer**; the OS cursor stays
visible underneath. Prev is `is-disabled` at index 0. The whole nav layer is
hidden on `sm-down` and on any device without hover.

**Carousel timing:** `1000ms` settle after a free drag, `1200ms` for a
prev/next click, separate easing curves for each (`easeFreeCarousel` vs
`easeCarousel` — the click curve is the sharper of the two).

**Mobile (`sm-down`)** the carousel is replaced by native horizontal
overflow-scroll with snap: item width `calc(100vw - var(--spacing) * 2)`,
gap `calc(var(--spacing) / 2)`. No JS, no custom cursor, no buttons.

### B4. Reveal mechanics (exact)

Both text reveals (`Location`, and the body sentence) use one primitive:

```css
/* pre-reveal: not display:none, so layout is already measured */
[data-reveal]:not([data-reveal-visible]) { opacity: .005; pointer-events: none; }

.animation--text .word-wrap {
  transition: transform 1.6s cubic-bezier(.7,0,.3,1),
              opacity   1.6s cubic-bezier(.7,0,.3,1);
  transition-delay: calc(var(--line-index) * 40ms);
}
.animation--text--inactive .word-wrap { opacity: 0; transform: translateY(110%); }
```

- Text is split **into lines** (not words, not chars). Each line is wrapped in a
  `.word-wrap` span with `overflow: hidden` plus `margin: -.16em; padding: .16em`
  so descenders and accents are not clipped by the mask.
- Each line rises from `translateY(110%)` + `opacity: 0`, **staggered 40ms per
  line**, `1.6s` each.
- The container's own transition-duration is
  `calc(var(--line-total) * 40ms + 1.6s)` so it knows when the whole block is done.
- Fires **once** on enter and is then destroyed — no replay on scroll-back.
- The images fade in on the same trigger, independent of the line stagger.

---

## C. What happens AFTER — the handoff to the map

The next section is dark and pinned:

```
<section class="map ui-dark">  →  <div class="sticky" id="map">
```

1. **Polarity flip, light → dark**, instant, on section boundary. The header logo
   re-inverts.

2. **The map section rises and brightens as it enters** (their `sectionOutHalf`
   pattern, `md-up` only, clamped, inverse easing):

   ```
   just entering  → translateY(25lvh),  opacity 0.4
   fully in view  → translateY( 0lvh),  opacity 1.0
   ```

   Note the direction: the incoming section moves **slower than the scroll** and
   is dimmed until it lands. Location leaves normally at scroll speed. The
   contrast between the two rates is the whole transition — there is no fade on
   the outgoing section.

3. Once landed, the map **pins** for its full duration (`sticky`,
   `data-scroll-target="#map"`) while the pins/tooltips become interactive.

4. The map re-uses the *same five photographs* from the carousel as pin
   thumbnails, and only now adds the distances — the carousel deliberately shows
   none:

   ```
   Walking park · Embankment 15 min walk · Sport center · Shopping mall
   Polezhaevskaya / Khoroshevskaya  7 min walk
   Zorge  7 min walk · Khoroshevo 10 min walk
   Oktiabrskoe Pole 21 min walk · Panfilovskaya 24 min walk
   Historical park · Landscape park
   ```

   The section heading is again `sr-only` ("Map of the area"). Mobile gets a
   horizontally scrollable plan plus a decorative swipe-hint button.

---

## D. Responsive rules for the whole section

| breakpoint | change |
|---|---|
| `md-up` | 9-col offset-3 hero, 3-col first-line indent, 2-up carousel, custom cursor nav, all parallax active |
| `sm-down` | single column full-bleed, mobile line-break variants of both labels, giant "LOCATION" word hidden, carousel → native scroll-snap, cursor nav removed, card ratio 4:3, parallax runs in "mobile-smooth" (lerped, reduced amplitude) |
| no-hover | cursor nav removed regardless of width |
| `prefers-reduced-motion` | every reveal in final state, all scrubs frozen at progress 0, pins released, carousel becomes a plain scroller |

---

## E. ORKAY mapping

Keep the entire structure; swap the content domain. Location → **where the
tile actually ships from**, which is the honest version of this section for a
manufacturer.

- Eyebrow: `Privilege of Logistics` → **`Advantage of Location`**
- Display word: `Location` → **`Morbi`**
- Body sentence (two lines, 3-column indent on line one):

  > Morbi makes two thirds of India's ceramic tile. Two deep-water ports, a
  > cargo airport and the raw clay are all inside a 200 km radius of the kiln.

- Five cards (photo + name, no figures — figures belong on the map that follows):

  ```
  Mundra Port · Kandla Port · Ahmedabad Airport · Clay reserves · Rail terminal
  ```

- The section that follows is already built: `components/GlobalMap.tsx` +
  `content/worldmap.ts`. Give it the `sectionOutHalf` entrance above
  (`translateY(25lvh) / opacity .4` → `0 / 1`, `md-up`, clamped), pin it, and put
  the distances there — Mundra 180 km, Kandla 220 km, Ahmedabad 200 km — plus the
  40+ export markets already in `pins`. The card carousel names the places; the
  map alone carries the numbers.

Voice stays as in `Z9-PROMPT.md`: short declarative sentences, no adjective
stacking, no exclamation marks.
