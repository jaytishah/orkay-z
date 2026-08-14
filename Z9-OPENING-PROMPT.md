# Build prompt — the zorge9.estate opening sequence, reverse-engineered

Measured from the live site (`global.css`, `landing.css`, `shared.js`, `landing.js`,
`v=1779376336`). Everything below is what the site actually does, not an approximation.
Hand this whole file to a coding agent.

Three things share the screen in the shot you sent, so all three are specified:
**preloader → intro (section 1) → about (section 2)**, plus the fixed header logo that
crosses all of them.

---

## 0. Global system (needed before any section)

### Font — one family, one weight
```css
@font-face{
  font-display:swap; font-family:Gilroy; font-style:normal; font-weight:600;
  src:url(Gilroy-SemiBold.woff2) format("woff2"), url(Gilroy-SemiBold.woff) format("woff");
}
```
**Gilroy SemiBold (600) is the only face on the site.** There is no regular, no bold, no
italic, no second family. Fallback stack `Gilroy, Helvetica, Arial, sans-serif`.
Substitutes if Gilroy is unlicensed: Sofia Pro, Poppins SemiBold, Museo Sans Rounded,
or (free) Gilroy-alike **"Grandis Extended"/"Aeonik"**; last resort `Poppins 600`.

### Type scale (fluid, then locked)
```css
:root{
  --vw100: 100vw;
  --scale-px:      max(.5px, min(1px,  calc(.5px + .5 * ((var(--vw100) - 980px) / 220))));
  --scale-text-rem:max(.7rem,min(1rem, calc(.7rem + 3  * ((var(--vw100) - 980px) / 220))));
}
```
Everything is `calc(var(--scale-text-rem) * N)`. Between 980px and 1200px viewport the
whole page shrinks to 70% (text) / 50% (spacing) and then stops. No `clamp()` on
individual elements.

| Class | Size (xxxxl → md) | Leading | Notes |
|---|---|---|---|
| `.h1-large` | 15rem → 7rem (150 → 70px) | 1.0 – 1.07 | not used in the opening |
| `.h1` | 10rem → 4.8rem (100 → 48px) | 1.0 – 1.08 | preloader cover only |
| `.h2` | 6rem → 3.6rem (60 → 36px) | 1.06 – 1.08 | **both hero headlines** |
| `.h3` | 4.4rem → 2.4rem (44 → 24px) | 1.045 – 1.11 | "Special Offers" card |
| `.text-small` | 1.4rem → 1.2rem (14 → 12px) | 1.286 – 1.333 | `text-transform:uppercase`, `letter-spacing:.03em` |

**Only `.text-small` is uppercase.** The headlines are sentence case in the markup and are
*not* transformed — "Life on Your Own Terms" is capitalised by hand, letter by letter.

### Optical leading trim (used on nearly every text node)
```css
.leading-trim{ --fos:-.074em; --foe:-.226em }
.leading-trim:before{ content:""; display:block; height:0; overflow:hidden;
  margin-bottom: calc((var(--lh) - 1em) / -2 + var(--fos)); }
.leading-trim:after { content:""; display:block; height:0; overflow:hidden;
  margin-top:    calc((var(--lh) - 1em) / -2 + var(--foe)); }
```
This kills half-leading *and* Gilroy's ascender/descender slack so the cap-height sits
flush on the layout box. It is why every headline touches its gutter exactly.

### Colour
```
--c-white #fff · --c-black #000
--t-primary #a0725b   /* warm bronze — the ONLY accent. (turquoise #25c2a0 appears only in @media print) */
--c-gray #666 · --c-gray-light #aaa
```
**Polarity classes, not colours.** Every block is `.ui-dark` or `.ui-light` and only reads
tokens:
```css
.ui-dark { --t-background:#000; --t-text:#fff; --t-heading:#fff;
           --t-line:rgba(255,255,255,.2); --t-small:rgba(255,255,255,.5); --t-smallest:rgba(255,255,255,.3) }
.ui-light{ --t-background:#fff; --t-text:#000; --t-heading:#000;
           --t-line:rgba(0,0,0,.1);      --t-small:rgba(0,0,0,.3);       --t-smallest:rgba(0,0,0,.2) }
```
`.ui-background` paints `background: var(--t-background)`. No border-radius anywhere. No
box-shadow except a single `0 0 0 1px var(--t-line)` hairline on the collapsed header.

### Grid
```
12 columns md-up, 4 columns below.  --grid-gutter: 0vw   /* columns are FLUSH — no gutter */
--grid-col: calc((100vw - 0) / 12)
--spacing-layout: 20px → 30px (via --scale-px)   /* the only page gutter */
```
Utilities: `pl-layout`, `pr-layout`, `px-layout`, `py-layout`, and breakpoint variants
(`pr-layout:md`, `py-layout:md`). Everything is placed on column multiples —
`calc(var(--grid-col) * 8)`, `* 6`, `* 3` — never on percentages.

### Motion — one curve, two durations
```
--ease: cubic-bezier(.7, 0, .3, 1)      /* the ONLY easing in the entire site */
0.8s  → all UI: buttons, header, hover, logo scale
1.6s  → all entrances: preloader out, intro reveals, logo mask
0.4s  → generic fade-in / fade-out only
```
Reveal system: an element carries `data-reveal="<name>"`, `data-reveal-delay="<ms>"`,
`data-reveal-distance="0"`. JS swaps `animation--<name>--inactive` → `animation--<name>`.
Distance `0` means "no travel offset — use the named animation's own transform".

Scroll: locomotive-style smooth scroll (`has-scroll-smooth`, `data-scroll`,
`data-scroll-sticky`, `data-scroll-section`) plus snap points declared per section as
`data-scroll-snap-point='[{"viewport":0,"element":0}]'`.

Root classes toggled by JS: `no-js` → `js`, plus `has-hover`, `is-win`, `not-ready`
(kills all transitions until first paint is done). Page transitions run on barba.js
(`data-barba="wrapper"` / `data-barba="container"`).

---

## 1. BEFORE the section — the preloader

Two `.preloader` elements in the markup: the first is `is-hidden` + `aria-hidden` (the
first-paint blocker, no exit animation), the second is the live one with
`data-preloader-animation-name-out="preloader-slide-out"`.

```css
.preloader{ --progress:0; position:fixed; inset:0 auto auto 0;
            width:100vw; height:100%; z-index:14 }
.preloader__content{ position:absolute; inset:0; display:flex;
                     align-items:center; justify-content:center;
                     background:var(--t-background) }   /* .ui-dark → black */
```

**The card** — dead centre, portrait:
```css
.preloader__card{
  width: calc(var(--grid-col) * 2);      /* 2 of 12 columns ≈ 16.7vw */
  aspect-ratio: 240 / 360;               /* 2:3 */
  display:flex; flex-direction:column; align-items:center; justify-content:space-between;
  padding: 24px 20px 20px;               /* × --scale-px */
  position:relative;
}
```
Contents, top to bottom:
1. **Border + progress ring.** Two identical SVG paths on a `240×360` viewBox, the plain
   rectangle `M239 1H1V359H239V1Z`:
   - track: `stroke:white; stroke-opacity:.3`
   - progress: `stroke:white; stroke-dasharray:1192; stroke-dashoffset:calc(1192 * (1 - var(--progress)))`
   The whole SVG is `transform: scaleX(-1)` so the line draws **counter-clockwise**. The
   rectangle literally writes itself around the card as assets load. `--progress` 0 → 1.
2. **The wordmark**, `width:100%` of the card, `height:auto` (viewBox `0 0 673 87` — a very
   wide, low lockup; aspect ≈ 7.7:1).
3. **`.text-small.text-center.leading-trim`** — *"The Luxury / of Experience"*, hard `<br>`,
   two lines, uppercase, 12–14px, centred, at the card's bottom edge.

**Exit:**
```css
.animation--preloader-slide-out{ transition:1.6s cubic-bezier(.7,0,.3,1);
                                 transition-property:transform,opacity; }
.animation--preloader-slide-out--active{
  transform: translateX(calc(var(--grid-col) * -8));   /* slides LEFT 8 of 12 columns */
  opacity: 0;
}
```
It does not fade in place and it does not wipe — the black plate travels two-thirds of the
screen to the left over 1.6s while fading, revealing the intro underneath. `.no-js
.preloader{display:none!important}`.

The intro's own reveals fire on a **1600ms delay**, i.e. exactly as the preloader clears.

---

## 2. THE SECTION — intro (section 1)

```html
<section class="section section--full-height ui-dark ui-background"
         data-scroll-section
         data-scroll-snap-point='[{"viewport":0,"element":0}]'
         data-themed-class="ui-dark" data-plugin="history">
  <div class="sticky sticky--under-next sticky--full-height"
       data-plugin="parallax" data-parallax-pattern="sectionOutTiny" data-parallax-enable-mq="null">
    <div class="intro sticky__layer sticky__layer--sticky" data-scroll data-scroll-sticky data-reveal-group>
      …
```
```css
.section--full-height{ height:100svh; width:100%; contain:strict }
.section--full-height:first-child:not(:last-child){ height:calc(100svh + 1px) }
```

### Pinning / overlap mechanic
```css
.sticky{ display:grid; grid-template-areas:"sticky_content"; grid-auto-rows:1fr;
         --sticky-under-next-distance:100svh; --sticky-under-previous-distance:100svh }
.sticky__layer{ grid-area:sticky_content; align-self:start; position:relative }
.sticky__layer--sticky{ position:sticky; top:0; contain:content }
.sticky--under-next{ margin-bottom:calc(var(--sticky-under-next-distance) * -1); position:relative }
.sticky--under-next:after{ content:""; display:block; height:var(--sticky-under-next-distance) }
.sticky--full-height, .sticky--full-height .sticky__layer{ min-height:100svh }
.sticky--full-height .sticky__layer--sticky{ height:100svh }
```
Negative margin + an equal-height `::after` spacer = the intro **stays put for one extra
viewport of scroll** while the next section rides up over it. Nothing is pushed.

Parallax pattern `sectionOutTiny` (applied because the container has `sticky--under-next`):
```
parallax-200-100 → translateY(  0svh)
parallax-100-100 → translateY(-10svh)      clamp: true
```
A 10svh drift upward — deliberately tiny, so the pinned intro reads as *receding*, not
scrolling.

### Layer stack (z order bottom → top)

**z0 — `.intro__background` (the building photo, RIGHT 8 columns)**
```css
.intro__background{ position:absolute; top:0; right:0; height:100%;
                    width: calc(var(--grid-col) * 8);   /* = 8/12 = 66.7vw, flush right */
                    max-height:133.333vw; z-index:0 }
```
It is a `contentAnimation` crossfader with **two** exposures of the same frame:
```html
<div data-plugin="contentAnimation"
     data-content-animation-animations='{"changeShow":{"name":"fadeIn","duration":2}}'
     data-content-animation-plugins="controller events counter autoplay"
     data-content-animation-autoplay-delay="7">
  <div data-content-animation-item="intro-night" class="ui-background background background--cover">…</div>
  <div data-content-animation-item="intro-day"   class="… is-hidden" aria-hidden="true">…</div>
</div>
```
**Dusk ↔ day: hold 7s, crossfade 2s, loop.** Same camera, same building — only the light
changes. Art-directed `<picture>`, four sources:
`xxxl` ≥1920w & ≥700h (1709×1388) · `xxl` ≥1440w (1344×1092) · `md` (960×780) ·
`xs` fallback (360×480, a *different, portrait* crop). Note the desktop crops are
**portrait-ish** (1.23:1 tall) — the photo is a tall slab, not a 16:9 still.

**z0 — `.intro__back` (the black plate that wipes in)**
```css
.intro__back{ position:absolute; top:0; left:0; height:100%; width:100vw }
.intro__back[data-reveal-old]{ left: calc(var(--grid-col) * -8) }
.animation--intro-back{ transition:1.6s var(--ease); transition-property:transform,opacity }
.animation--intro-back--inactive{ transform:translateX(calc(var(--grid-col) * 8)); opacity:0 }
```
`data-reveal="intro-back"`, delay **0**, `data-reveal-visible`. It slides in from +8
columns as the preloader slides out −8 columns: the two movements are a single continuous
gesture in opposite directions. Hidden `sm-down`.

**z0 — `.intro__decor` (the foreground cut-out, columns 2–7)**
```css
.intro__decor{ position:absolute; top:0; left: var(--grid-col);
               width: calc(var(--grid-col) * 6); height:100% }
.intro__decor img{ height:100%; object-fit:contain; object-position:bottom }
/* sm-down: */ .intro__decor{ inset:auto auto 0 0; width:100%; height:auto }
```
A transparent-PNG/WebP silhouette (the city skyline) **bottom-anchored and `contain`-fitted**,
occupying columns 2–7, i.e. it overlaps the left edge of the photo. Reveal
`data-reveal="intro-decor"`, distance 0:
```css
.animation--intro-decor--inactive{ transform:translateX(calc(var(--grid-col) * 11)); opacity:0 }
```
It flies in from **11 columns to the right** (nearly off-screen) over 1.6s — the longest
travel on the page.

**z1 — `.intro__content` (copy, LEFT 4 columns)**
```html
<div class="intro__content row">          <!-- position:relative; z-index:1 -->
  <div class="col col--xs-3 col--md-4 pl-layout pr-layout:md py-layout">
    <h1 class="sr-only">Zorge 9 - House with Privileges</h1>
    <p class="h2 leading-trim mb-1.5 mb-layout:xxl"
       data-reveal="text" data-reveal-delay="1600" data-reveal-distance="0">
      Premium residence — the&nbsp;embodiment of&nbsp;your status
    </p>
    <div data-reveal="fade-in block" data-reveal-delay="1600" data-reveal-distance="0">
      <a class="btn btn--link btn--link-static btn--animate-icon" href="#about" aria-label="…">
        <span class="btn__content"><span class="btn__icon">
          <svg class="icon icon-long-arrow-down" width="14" height="41" …>
          <svg class="icon icon-long-arrow-down" width="14" height="41" …>   <!-- duplicate -->
        </span></span>
      </a>
    </div>
  </div>
</div>
```
- The real `<h1>` is **`sr-only`** — the visible headline is a `<p class="h2">`. Do the same:
  one semantic H1 for the machine, a styled paragraph for the eye.
- The headline sits **bottom-left**, 4 of 12 columns wide, one page gutter in from the left,
  with `&nbsp;` binding the short words so lines never break after "the" / "of".
- The scroll cue is a **14×41 long down-arrow**, drawn twice; `btn--animate-icon` translates
  the pair on hover so a second arrow enters from the top as the first exits the bottom —
  an endless downward loop, 0.8s, same easing.

**z2 — `.intro__logo` (the wordmark, FULL BLEED, bottom edge)**
```css
.intro__logo{ position:absolute; left:0; bottom: var(--spacing-layout);
              width:100%; overflow:hidden; z-index:2 }        /* + .px-layout, .text-color-primary */
.intro__logo svg{ display:block; width:100%; height:auto }
.with-cookie-consent .intro__logo{ bottom: calc(var(--spacing-layout) + 50px) }
```
```css
.animation--intro-logo{ overflow:hidden; transition-duration:1.6s !important }
.animation--intro-logo svg{ transition:1.6s var(--ease); transition-property:transform; will-change:transform }
.animation--intro-logo--inactive svg{ transform: translateY(101%) }
```
`data-reveal="intro-logo"`, delay **1600ms**, distance 0.
**This is the headline logo of the page**: the wordmark spans the entire viewport width
minus one gutter each side, sitting on the bottom edge, in `--t-primary` (#a0725b bronze),
and it **rises out of its own overflow mask** — 101% translateY → 0 over 1.6s. It does not
fade; it is uncovered.

---

## 3. THE LOGO PLACEMENT (this is the whole trick)

There are **three copies of the same 673×87 wordmark**, and they hand off to each other:

| # | Element | Where | Size | Colour |
|---|---|---|---|---|
| 1 | `.preloader__card-logo` | centre of the 2-col portrait card | 100% of card (≈16.7vw) | white |
| 2 | `.intro__logo` | absolute, **bottom edge, full bleed**, z2 | `width:100%` minus gutters (≈100vw) | `--t-primary` #a0725b |
| 3 | `.header__logo` | **fixed, top-left corner** | `calc(50vw - var(--spacing-layout) * 2)` md-up, `220px` below | `currentColor` (white on `.ui-dark`) |

### The fixed header
```html
<header class="header header--sticky ui-dark" data-plugin="themed">
  <div class="header__content row row--top-xs">
    <div class="col col--xs-3 col--md-9 py-layout pl-layout">
      <a class="btn header__logo header__logo--landing btn--link btn--link-static"
         href="#top" data-plugin="parallax" data-parallax-pattern="logo">
        <span class="btn__content">
          <svg class="icon icon-logo" viewBox="0 0 673 87">…</svg>
          <span class="header__logo-zebra is-hidden--sm-down"><svg …>…</svg></span>
        </span>
      </a>
    </div>
    <div class="col col--xs-1 col--md-3 group group--nowrap group--none py-layout pr-layout">…</div>
  </div>
</header>
```
```css
.header{ position:relative; z-index:10; pointer-events:none }   /* children re-enable */
.header--sticky{ position:fixed; top:0; left:0; width:100% }
.header__logo{ pointer-events:all; transform-origin: 0 100%; transition:none }
.header__logo svg{ width: calc(50vw - var(--spacing-layout) * 2); height:auto }  /* md-up */
.header__logo--landing:not(.header__logo--transition){ opacity:0 }
```
Note the split: logo column is **9 of 12**, the nav column **3 of 12** — because the
wordmark is genuinely half the screen wide.

### The scale hand-off (`parallax-pattern="logo"`)
```js
logo:{
  clamp:true, enableMq:null, measureSelector:"header",
  parallax(){
    const w = this.$container.outerWidth();
    const scale = (innerWidth - 2 * this.$container.offset().left) / w;   // ≈ 2.06 at 1920
    this.$container.css("--logo-scale", scale);
    setTimeout(()=> this.$container.addClass("header__logo--transition"), 100);
    return { "parallax-0-0":{progress:0}, "parallax--100-0":{progress:1} };
  },
  enter(){ this.$container.addClass("header__logo--big") },
  leave(){ this.$container.removeClass("header__logo--big") }
}
```
```css
.header__logo--big{ pointer-events:none }
.header__logo--big .btn__content{ opacity:0 }
.header__logo--transition{ transition:.8s var(--ease); transition-property:color,transform }
.header__logo--transition:not(.animation--intro-logo) .btn__content{
  transition:.8s var(--ease); transition-property:opacity,transform }
```
Read it in order:
1. `--logo-scale` is computed as *(viewport width − both gutters) ÷ (header logo width)* —
   about **2.06×**. That is exactly the factor that grows the 50vw header mark to the
   100vw intro mark. The two logos are the same object at two scales.
2. `transform-origin: 0 100%` — bottom-left. Scaling pivots on the corner the mark shares
   in both positions, so the hand-off has no lateral drift.
3. While the hero owns the screen, `header__logo--big` hides the header copy
   (`.btn__content{opacity:0}`) — you only ever see **one** wordmark: the bronze full-bleed
   one on the bottom edge.
4. Scroll one viewport, `leave()` fires, the header copy fades/scales in at its natural
   50vw in the **top-left corner** and stays fixed there for the rest of the site. That is
   the state in the screenshot.

### The zebra copy (ink inversion over light sections)
```css
.header__logo-zebra{ position:absolute; top:0; left:0; color: var(--c-black);
                     width: calc(var(--grid-col) * 3 - var(--spacing-layout));
                     opacity:0; overflow:hidden;
                     transition:.8s var(--ease); transition-property:opacity,color }
.header__logo--zebra .header__logo-zebra{ opacity:1 }
```
A second, **black** copy of the mark, clipped to 3 columns minus a gutter, stacked exactly
on top. When a light section scrolls under the header, the black copy fades in over the
clipped region so the wordmark reads black on white and white on black **at the same time**.
Hidden `sm-down`.

Related states elsewhere on the site (build them if you reuse the header):
`.header--apartments .header__logo .btn__content{opacity:0}`,
`.header--mix-blend` / `.header--fitness{ mix-blend-mode:difference }`,
`.header--request-section .header__logo{ transform: translateY(calc(100svh - var(--translate) - var(--spacing-layout))) scale(var(--logo-scale)) }`
— the same mark flies **back down** to full bleed on the contact section.

### Header right side
```html
<div data-reveal="intro-menu" data-reveal-delay="1600" data-reveal-distance="0">
  <a class="btn btn--link btn--link-static btn--text-small btn--clone"
     href="/apartments" data-plugin=" button" data-button-clone-content="true">
    <span class="btn__content"><span class="btn__text">Choose an Apartment</span></span>
  </a>
</div>
```
- `.animation--intro-menu--inactive{ transform: translateY(101%) }` — the label rises out
  of a mask, same 1.6s, same 1600ms delay as the logo. Header and hero arrive together.
- `btn--clone` duplicates the label and animates `transform` **and** `clip-path` together
  (`translateY(±175%)` with matching polygon clips, 0.8s): on hover the text swaps in place
  with a clean cut, not a fade.
- **Burger**: a 60×8 SVG, two horizontal rules at y=0.65 and y=6.65, `stroke-width:1.3`,
  **each drawn twice**. Hover: copy A `transform:scaleX(0→1)`, copy B
  `translateX(125%)` — the rules wipe through themselves. Stagger `0 / 75 / 100 / 175ms`,
  0.8s, same easing.
- `.header--sticky.header--collapsed .header__background{ transform:translateY(0);
  background:var(--t-background); box-shadow:0 0 0 1px var(--t-line) }` and
  `.header--hidden` pushes bar + background to `translateY(-102%)` — hide-on-scroll-down.

---

## 4. AFTER the section — about (section 2, the one in the screenshot)

```html
<section class="about section ui-dark ui-background" id="about" data-plugin="reveal"
         data-scroll-section
         data-scroll-snap-point='[{"viewport":0,"element":33.34}]'>
  <div class="about__sticky sticky sticky--under-next sticky--under-previous">
```
```css
.sticky--under-previous{ margin-top: calc(var(--sticky-under-previous-distance) * -1) }
.sticky--under-previous:after{ content:""; display:block; height:var(--sticky-under-previous-distance) }
.sticky--under-next + .sticky--under-previous{
  clip-path: inset(100svh 0 0);
  margin-top: calc(var(--sticky-under-previous-distance) * -1 + var(--sticky-under-next-distance) * -1);
  transform: translateZ(1px);
}
.sticky--under-previous.sticky--under-next .sticky__layer--sticky{ max-height:200svh }
.about__sticky.sticky--under-previous.sticky--under-next:after{ height:var(--sticky-under-next-distance) }
```
**The transition between the two sections**: about is pulled up by two viewports and then
`clip-path: inset(100svh 0 0)` cuts off everything above the fold, so as you scroll it
**uncovers itself upward across the pinned intro** — a curtain, not a scroll. The intro
simultaneously drifts −10svh (`sectionOutTiny`). `translateZ(1px)` forces its own
compositing layer so the clip stays crisp. Snap point `element: 33.34` — it snaps when
one third of it is past the top.

Layers:

**Background** — `sticky__layer--sticky`, `data-scroll data-scroll-sticky`:
a full-bleed `background--cover` `<picture>` (1920×1080 xxxl/xxl, 1440×810 md, 607×1080 xs)
with a Vimeo background player laid over it:
```html
<iframe style="--ratio:1.7777777777778; --aspect-ratio:1920 / 1080" width="1920" height="1080"
  src="https://player.vimeo.com/video/…?loop=1&muted=1&autoplay=1&autopause=0&background=1"
  allow="autoplay; encrypted-media" allowfullscreen></iframe>
```
The still is the poster; the video fades over it once buffered.

**Content** — `sticky__layer--sticky sticky__layer--top`, `is-hidden--sm-down`
(a second, parallax-free duplicate exists for `md-down`):
```html
<div class="row">
  <div class="col col--xs-4 col--md-4 px-layout py-2 py-layout:md pr-0:md"
       data-plugin="parallax" data-parallax-pattern="about">
    <h2 class="h2 leading-trim" data-reveal="text" data-reveal-distance="0">
      Life on&nbsp;Your<br />Own Terms
    </h2>
  </div>
  <div class="col col--xs-4 col--md-8 px-layout py-2 py-layout:md"
       data-plugin="parallax" data-parallax-pattern="about">
    <div class="group group--small group--right group--nowrap"> …two cards… </div>
  </div>
</div>
```
Headline **bottom-left**, 4 columns, hard `<br>`, `&nbsp;` after "on"; cards **bottom-right**,
8 columns, right-aligned, never wrapping.

Parallax pattern `about` (md-up only, `measureSelector:".section"`, clamped):
```
parallax-0-0    → translateY( 10svh)
parallax--100-0 → translateY(  0svh)
parallax-100-100→ translateY(-10svh)
```
Copy and cards drift ±10svh against a locked background.

**The two cards**
```css
.about__card{ width: 180px → 240px → 320px }         /* md / xxl / xxxl, × --scale-text-px */
.about-card{ --card-spacing-h:10px→20px; --card-spacing-v:12px→20px;
             --card-ratio: .775 / .81818 / .8 }      /* tall portrait ≈ 4:5 */
.card{ aspect-ratio: var(--card-ratio); display:flex; align-items:center;
       clip-path: polygon(0 0,100% 0,100% 100%,0 100%) }   /* identity rect — exists only so it can be animated */
.card__lt{ position:absolute; top:var(--card-spacing-v); left:var(--card-spacing-h);
           right:var(--card-spacing-h) }
.card__center{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) }
.card__b{ position:absolute; bottom:var(--card-spacing-v); left:var(--card-spacing-h);
          width: calc(100% - var(--card-spacing-h) * 2) }
```
- **Card 1 — `.ui-dark.ui-background`** (solid black): `.card__lt` `text-small`
  "About the Project"; `.card__center` a 12×26 play glyph, **drawn twice**
  (`btn--animate-icon`) so it loops on hover. Links `#video-modal`, carrying
  `data-video-modal-video-id` / `-width` / `-height`.
- **Card 2 — `.ui-light.ui-background`** (solid white, inverted): `.card__lt` "Installment /
  and Mortgage"; `.card__center` `h3 text-center` "Special Offers"; `.card__b`
  `btn--underline btn--text-small` "Watch". Links `#offers-modal`.
- Underline animation:
```css
.btn--underline .btn__underline{ position:absolute; left:0; bottom:-.507em;
  width:100%; height:1px; overflow:hidden }
.btn--underline .btn__underline:before,
.btn--underline .btn__underline:after{ content:""; position:absolute; top:0; left:0; width:100%;
  border-bottom:1px solid var(--border); transition:.8s var(--ease); transition-property:transform }
.btn--underline .btn__underline:before{ border-bottom-color:var(--hover-border);
  transform: translateX(calc(-100% - 8px)); transform-origin:0 0 }
.has-hover .btn--underline:hover .btn__underline:before{ transform: translateX(0) }
```
A second rule slides in from the left with an 8px gap so the two never touch — the
underline appears to be *replaced*, not grown.

The two cards side by side are the only place on the opening screens where black and white
polarity meet, and they meet with a **hard 0-radius edge** and no gap treatment beyond
`group--small`.

---

## 5. Everything else the opening depends on

- `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
  and `<meta name="format-detection" content="telephone=no">`.
- `<meta name="theme-color" content="#000000">`; dark/light favicon pairs swapped by
  `media="(prefers-color-scheme: …)"`.
- Anti-FOUC: inline `<style>` in `<head>` sets `body{background:#fff;color:#fff}` and
  `.js.not-ready, .js.not-ready *{transition:none!important}`.
- First element in `<body>`: `<a href="#top" class="sr-only sr-only--focusable">Skip to main content</a>`.
- `<link rel="preconnect" href="https://storage.googleapis.com" crossorigin>` for the media CDN.
- A `.turn-message` overlay ("Please rotate your phone vertically") for mobile landscape,
  and a `.error-message` live region (`role="alert" aria-live="assertive"`).
- All images `draggable="false"`, `alt=""` on every decorative layer, every icon
  `aria-hidden="true"` and referenced from one sprite via
  `<use href="/assets/images/icons.svg#name">` with inline `--icon-width` / `--icon-height`.

---

## 6. If you build this for ORKAY

Swap only these and the system holds:
- Accent `--t-primary: #a0725b` → ORKAY red `#ed1c24`.
- Wordmark: replace the 673×87 lockup with the ORKAY mark at a comparable extreme
  aspect (a wide, low lockup is what makes the full-bleed bottom placement work — a
  square logo will not).
- Intro copy: `.h2` "Premium residence — the embodiment of your status" →
  *"Vitrified surfaces — direct from the kiln"*; scroll target `#about`.
- Photo pair for the 7s crossfade: same room, two lightings (or same tile, wet/dry).
- Section 2 headline "Life on Your Own Terms" → *"Surfaces on Your Own Terms"*;
  cards → "About the Plant" (video) and "Private Label / Custom Runs" (offers).
- Everything else — Gilroy 600 only, one easing, 0.8/1.6s, zero radius, flush 12-col grid,
  the bottom-to-top-left logo hand-off — transfers unchanged.
