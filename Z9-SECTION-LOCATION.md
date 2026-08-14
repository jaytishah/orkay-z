# Build prompt — the LOCATION section (standalone)

Build one section. Self-contained: the primitives it needs are specified here, so
nothing outside this file is required. Measurements are from the reference
implementation. Stack: Next.js App Router + GSAP/ScrollTrigger + Lenis + plain CSS.

---

## Primitives this section needs

| Thing | Spec |
|---|---|
| Easing (discrete) | `cubic-bezier(.7, 0, .3, 1)`, duration `.8s`. The only easing for colour/opacity/hover changes. |
| Easing (scrub) | ease-out quad `2t − t²` when a thing leaves, ease-in quad `t²` when it arrives. |
| Reveal gate | `[data-reveal]:not([data-reveal-visible]) { opacity: .005; pointer-events: none }`. Observer stamps the attribute on enter. No JS → no gate. |
| Text reveal | Split into per-word `.word-wrap` spans inside an `overflow: hidden` line box. Inactive: `opacity: 0; transform: translateY(110%)`. Active: transition `transform, opacity` `1.6s` with `transition-delay: calc(var(--line-index) * 40ms)`. Total = `lines × 40ms + 1.6s`. |
| `imageMove` (scroll) | `<picture>` is `overflow: hidden`; `<img>` inside is `120%` of the frame. Scrub `translateY(0%) → translateY(-16%)`, clamped to the measured container. Frame never moves — only the crop slides. |
| `imageMove` (carousel) | Per card: `maxOffset = picture.offsetWidth − crop.offsetWidth`; as the track advances, the inner picture gets `translateX(-maxOffset × ((clamp(slideOffset, -1.5, 1.5) + 1.5) / 3))`. Cards travel at track speed, photos at a fraction of it. |
| Polarity markers | Empty `div[data-themed-class="ui-dark|ui-light"]` planted in the flow. As each crosses the fixed wordmark's Y band, the wordmark's ink transitions over `.8s`. |
| Zebra logo | A second, absolutely-positioned **black duplicate** of the wordmark: `overflow: hidden`, `width: calc(var(--grid-col) * 3 - var(--spacing-layout))`, `opacity: 0`, `transition-property: opacity, color`. A marker carrying `data-themed-add-class="header__logo--zebra"` fades it to `1`. |
| Grid | 12 columns, `--grid-col`, gutter `--spacing-layout`. |
| Type | `.text-small` (12px, uppercase, letter-spaced) · `.h2` (`6rem`-scale at xxxxl → `4.8 → 3.6 → 1.8` down the steps) · `.h1` (`10rem`-scale at xxxxl → `8.5 → 5.6 → 4.8`). Weight 600, uppercase, `border-radius: 0`, no shadows. |

Honour `prefers-reduced-motion: reduce`: no transitions, all reveals in final
state, carousel becomes a static grid, parallax off.

---

## Section shell

```html
<section id="location"
  class="location section section--no-overflow ui-background pb-2 pb-4:md"
  data-scroll-section
  data-plugin="reveal history"
  data-scroll-snap-point='[{ "viewport": 0, "element": 0, "scrollable": true }]'>
```

- Light polarity (paper background, black ink).
- `history` → entering the section rewrites the URL to `/location`, no navigation.
- `section--no-overflow` — the hero photo and the carousel both bleed past the grid.
- Snap `{ viewport: 0, element: 0, scrollable: true }` — the section's top snaps to
  the viewport top on approach, then **releases** so everything inside scrolls freely.
- `pb-2` / `pb-4:md` — a deliberate band of paper under the carousel. Don't remove it;
  whatever follows climbs into that space.
- First child is `<h2 class="sr-only">Location</h2>`. The visible "Location" further
  down is a `<p>` — only one heading in the a11y tree.

---

## 1 · Hero photo — right 9 columns

```html
<div class="row">
  <div class="col col--xs-4 col--md-9 offset--md-3">

    <div data-themed-class="ui-dark"></div>

    <div data-themed-class="ui-dark" data-themed-add-class="header__logo--zebra">
      <picture class="img-full parallax-image-move" data-plugin="appear">
        <source ... media="(min-width: 1920px) and (min-height: 700px)" width="1922" height="1388">
        <source ... media="(min-width: 1440px) and (min-height: 700px)" width="1512" height="1092">
        <source ... media="(min-width: 568px) and (max-aspect-ratio: 13/9),
                          (min-width: 668px) and (min-height: 416px),
                          (min-width: 980px)" width="1080" height="780">
        <img src="hero-xs.webp" alt="" width="360" height="360" draggable="false"
             data-plugin="parallax"
             data-parallax-pattern="imageMove"
             data-parallax-mobile-smooth="true">
      </picture>
    </div>

    <div data-themed-class="ui-light"></div>
```

- The photo is the section's **first paint** — nothing above it. Starts at the top
  edge, offset 3 columns from the left, runs flush to the right edge of the page.
- Art direction is four crops, not one image scaled: `1922×1388` / `1512×1092` /
  `1080×780` / `360×360` (mobile goes square).
- `imageMove` parallax: the crop drifts up ~16% of its own height while the frame
  holds. Reads as the camera settling, not the page scrolling.
- **The three marker divs are the entire logo choreography** — dark above, dark +
  zebra across the photo, light immediately below it. So as the section rises the
  fixed wordmark (a) turns white, (b) grows its clipped black twin over the left
  3 columns where the paper shows, (c) goes fully black the instant the photo's
  bottom edge clears it. Each hop is `.8s cubic-bezier(.7,0,.3,1)` on
  `color` / `opacity`, and the two halves cross-fade **independently** — that's
  what makes the split read as mechanical rather than animated.
- Ship a `<noscript>` twin of the `<picture>` without the lazy/appear classes.

## 2 · Eyebrow

```html
<p class="text-small leading-trim px-1 pl-0:md mt-1 mt-0.66:md">
  <span class="is-hidden--md-down">Privilege&nbsp;of&nbsp;Location</span>
  <span class="is-hidden--md-up">Privilege&nbsp;<br />of&nbsp;Location</span>
</p>
```

Directly under the photo, same 3-column offset. Uppercase, letter-spaced, 12px.
Both variants ship in the markup and toggle by breakpoint — desktop is one
nbsp-bound line, mobile breaks after "Privilege".

## 3 · Statement

```html
<p class="h2 leading-trim px-1 pl-0:md mt-2" data-reveal="text">
  <span class="text-offset text-offset--3 is-hidden--sm-down"></span>
  City skyscrapers and iconic landmarks are at&nbsp;your feet. The&nbsp;capital
  unfolds before&nbsp;you like&nbsp;a&nbsp;grand bouquet of&nbsp;endless opportunities.
</p>
```

```css
.text-offset      { float: left; height: 10px; width: var(--grid-col) }
.text-offset--3   { width: calc(var(--grid-col) * 3) }
```

- That empty floated span is a pure-CSS **first-line indent of three grid
  columns** — line 1 starts a third of the way in, lines 2 and 3 run full width.
  It's dropped below `sm`. No JS, no text-indent, no fake line breaks.
- The indent is exactly the photo's offset above it. They're the same edge.
- Non-breaking spaces are load-bearing: `at your`, `The capital`, `before you`,
  `like a grand`, `of endless`. They fix the ragging at every breakpoint — keep them.
- Three lines → reveal runs `3 × 40ms + 1.6s ≈ 1.72s`, each line sliding up from
  `translateY(110%)` behind its own mask.
- ⚠️ The live source has a **Cyrillic С** on "Сity". Use a Latin C.

## 4 · The big word and the rule

```html
<div class="mt-4.5 mt-8:md"
     data-plugin="contentAnimation"
     data-content-animation-animations='{"changeShow":{"name":"fadeIn"},
                                         "changeHide":{"name":"fadeOut"}}'>

  <div class="row row--bottom-md">
    <div class="col col--xs-4 col--md-8 px-1 container-h-vars"></div>   <!-- empty -->
    <div class="col col--xs-4 col--md-4 px-1 pb-1 is-hidden--sm-down">
      <p class="h1 text-right leading-trim" data-reveal="text">Location</p>
    </div>
  </div>

  <hr class="location__line">
```

```css
.location__line { margin-top: -1px }
```

- The gap above is large on purpose — `mt-8` on desktop is roughly half a viewport.
  The statement and the big word are not a pair; they're separated by paper.
- Left column is genuinely empty. The word is flush right in the last 4 columns,
  bottom-aligned, hidden below `sm`.
- The `-1px` is what welds the word to the hairline — it sits **on** the rule, not
  above it. Single-line reveal, so it reads as one wipe-up from under the rule.
- The `contentAnimation` wrapper is the tab-switch hook (see §6). Build it, ship
  one group.

## 5 · Amenity carousel

```html
<div class="px-1 mt-1 container-h-vars js-location-container">
  <div class="content-animation">
    <div data-content-animation-item="location-1" class="ui-background" aria-hidden="false">

      <div class="location__carousel carousel carousel--md-up carousel--not-ready"
           data-plugin="carousel"
           data-carousel-enable-mq="md-up"
           data-carousel-breakpoints='{"xs-up":{"slidesPerView":1},
                                       "md-up":{"slidesPerView":2}}'
           data-carousel-effects="imageMove">
        <div class="carousel__list">
          <ul class="carousel__list__inner mobile-scrollable js-carousel-list">
            <li class="carousel__list__item mobile-scrollable__item js-carousel-item">
              <div class="location-card js-picture-crop card ui-dark">
                <picture class="location-card__image background background--cover
                                parallax-image-move js-picture-wrapper">
                  <!-- 1219×854 / 959×672 / 685×480 / 640×480 -->
                  <img ... data-plugin="parallax"
                           data-parallax-measure-selector=".js-location-container"
                           data-parallax-clamp="true"
                           data-parallax-100-0='{"transform":"translateY(-16%)"}'
                           data-parallax-0-100='{"transform":"translateY(0%)"}'
                           data-parallax-mobile-smooth="true">
                </picture>
                <div class="card__lb">
                  <p class="card__title text-small leading-trim"></p>
                  <p class="h2 leading-trim mt-0.66">Walking park</p>
                </div>
              </div>
            </li>
            <!-- ×5 -->
```

```css
.location__carousel            { --item-spacing: calc(var(--scale-px) * 10) }
.location .carousel__list__item{ max-width: 50%; min-width: 50% }
.location-card                 { --card-ratio: var(--md, 1.42708) var(--n-md, 1.33333) }
.location-card__image          { width: 120% }
.location-card .card__lb       { max-width: 73% }
.location-card .card__rb       { bottom: auto; top: var(--card-spacing-v); z-index: 1 }
.location-card:before {
  content: ""; position: absolute; top: 0; right: 0;
  width: 70%; height: 70%; z-index: 1;
  background: linear-gradient(225deg, rgba(var(--t-background-rgb), .5) 0,
                                      rgba(var(--t-background-rgb), 0) 50%);
}
.card {
  --card-spacing-h: calc(var(--scale-px) * 20);
  --card-spacing-v: calc(var(--scale-px) * 20);
  aspect-ratio: var(--card-ratio);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  display: flex; align-items: center; justify-content: center; position: relative;
}
```

- **2 up on desktop, 1 on mobile.** Items locked to `min/max-width: 50%`, gap
  `10 × --scale-px`.
- Cards are landscape `1.42708` (desktop) / `1.33333` (mobile). The `clip-path`
  is a geometric no-op — it exists purely to force a containment boundary so the
  120%-wide image can't paint outside.
- The `:before` corner wash darkens the top-right `70% × 70%` so the label stays
  legible on any photo without a full scrim.
- `.card__lb` (bottom-left, inset by `--card-spacing`, capped at 73% width):
  an **empty** `.card__title` slot — reserved for a distance/time value — then
  `p.h2` with the label.
- **Labels, in order:** Walking park · School · Sport center · Embankment · Restaurants
- **`imageMove` carousel effect:** photos slide inside their frames across a
  ±1.5-slide window while the cards travel at track speed. That
  parallax-inside-the-slide is what makes it feel expensive — don't skip it.
- All slides after the first carry `is-hidden--not-ready` until the plugin boots,
  so nothing flashes as a stack.

### Navigation — no visible arrows

```html
<div class="location__carousel-nav ui-dark is-hidden--sm-down is-hidden--no-hover"
     data-plugin="cursor" data-cursor-show-default-cursor="true">
  <button class="btn location__carousel-link btn--link js-carousel-prev is-disabled"
          aria-label="Previous item"><span class="btn__content"></span></button>
  <button class="btn location__carousel-link btn--link js-carousel-next"
          aria-label="Next item"><span class="btn__content"></span></button>
  <div class="cursor cursor--arrow js-cursor-button">
    <!-- outlined circular button, icon-long-arrow-left / -right, 41×14 -->
  </div>
</div>
```

```css
.location__carousel-nav  { position: absolute; top: 0; height: 100%;
                           left:  calc(var(--spacing-layout) * -1);
                           right: calc(var(--spacing-layout) * -1); z-index: 1;
                           display: flex }
.location__carousel-link { width: 50%; height: 100% }
```

- An invisible overlay spanning the full card row and bleeding a gutter past both
  edges, split into two 50%-wide hit zones: left half = prev, right half = next.
- A cursor-follower renders an outlined circular arrow button that tracks the
  pointer and **flips direction at the midpoint**. The real `<button>`s stay in
  the DOM with `aria-label`s so keyboard and SR users get proper controls.
- Prev carries `.is-disabled` at index 0.
- Hidden on `sm-down` and on `no-hover` devices.

### Mobile

The plugin doesn't initialise below `md`. The `<ul>` falls back to
`.mobile-scrollable` — native horizontal overflow with
`--scrollable-item-width: calc(100vw - var(--spacing) * 2)` and
`--scrollable-item-gap: calc(var(--spacing) / 2)`, snap on. No cursor, no nav,
no JS. Let the platform do it.

## 6 · Tabs (hook only)

```css
.location__tab:before { content: ""; position: absolute; left: 0;
                        bottom: calc(var(--spacing) * -1);
                        width: 100%; height: 1px; background: currentColor;
                        opacity: 0; transition-property: opacity }
.location__tab.is-active:before { opacity: 1 }
```

A row of category tabs, each with a `currentColor` hairline that fades in when
active; switching cross-fades the card sets through the `contentAnimation`
wrapper from §4 (`fadeIn` / `fadeOut`). Wire the mechanism, ship one group
(`location-1`).

---

## Copy block

| Slot | Text |
|---|---|
| `h2.sr-only` | Location |
| Eyebrow | Privilege of Location |
| Statement | City skyscrapers and iconic landmarks are at your feet. The capital unfolds before you like a grand bouquet of endless opportunities. |
| Display word | Location |
| Cards | Walking park · School · Sport center · Embankment · Restaurants |

**ORKAY substitution:** eyebrow → *Privilege of Origin*; statement → *"Morbi,
Gujarat. Seven units, 16,000 sq.m a day, 1,000+ designs, 40+ countries. Nothing
sits between the buyer and the kiln."*; display word → *ORIGIN*; cards →
*Body prep · Press line · Digital print · Kiln · Sorting & pack*.
Accent stays `--c-red #ed1c24`, one accent only, no gradients except the card
corner wash. Voice: short declarative sentences, no adjective stacking.
