# ORKAY TILES — Homepage Design System
### Concept 2: "Crafted in Morbi. Designed for the World."
Reference experience: zorge9.estate/style (Vide Infra) — we replicate its layout language, motion system, logo behaviour, and editorial pacing, re-skinned and re-shot for Orkay Tiles International.

> Photography note: the reference site's photos are theirs. We reproduce the photographic *treatment* (dusk grading, warm architectural lighting, macro material shots, editorial people shots) with Orkay's own / newly produced imagery.

---

## 1. Brand feel

Quiet. Confident. Expensive. A global manufacturer's digital headquarters, not a tile catalogue.
Every screen answers "Why should I trust Orkay?" without saying it.

---

## 2. Design tokens

| Token | Value | Usage |
|---|---|---|
| `--c-white` | `#ffffff` | Light sections bg, dark-section text |
| `--c-black` | `#000000` | Dark sections bg, light-section text |
| `--c-red` | `#ed1c24` | ONLY accent (ORKAY brand red, sampled from logo): underlined CTAs, ambassador label, menu hover, logo bullseye |
| `--c-gray` | `#666666` | Secondary text |
| `--c-gray-light` | `#aaaaaa` | Muted labels, pagination inactive |
| `--c-error` | `#c60000` | Form validation |
| Easing | `cubic-bezier(0.7, 0, 0.3, 1)` | THE house easing — every transition |
| Duration | `0.8s` (micro) / `1.2s` (section reveals) | Nothing faster than 0.4s, nothing bouncy |

No gradients. No shadows. No border radius (0px everywhere). Color is binary black/white; the photography carries all warmth.

### Section polarity system
Every section is either `ui-dark` (black bg, white text) or `ui-light` (white bg, black text). The page alternates: light → dark → light… This polarity drives the logo inversion (below).

---

## 3. Typography

**Face:** Gilroy (fallback: Helvetica, Arial, sans-serif). Single family, weight 600 only.
If Gilroy licensing is a problem: "Hanken Grotesk" or "Poppins" 600 are the closest free approximations — geometric, wide apertures, round O.

**Everything is UPPERCASE.** No serif, no italic, no mixed case anywhere except body paragraphs (which are also uppercase on the reference — keep uppercase).

| Role | Size (desktop 1920) | Weight | Line height | Tracking |
|---|---|---|---|---|
| Giant fixed wordmark | ~600px wide SVG, scales 2.07× → 1× on scroll | — | — | very wide (logo is letter-spaced) |
| Display headline (section titles: "INFRASTRUCTURE", "THE LUXURY OF EXPERIENCE") | 60–90px | 600 | 1.05 | normal |
| H2 chapter statement ("THREE BUILDINGS IN THE STYLE OF…") | 30–48px | 600 | 1.07 | normal |
| Body / captions | 12px | 600 | 16px | 0.36px |
| Stats ("3.6 M") | 48–64px | 600 | 1 | normal |

The tension between the 12px dense caption blocks and 90px display lines IS the visual identity. No intermediate sizes.

---

## 4. The logo system (the "black-and-whiteing")

The single most distinctive element. Replicate exactly:

1. **Giant fixed wordmark** — AS BUILT: wide-tracked `ORKAY®` with the brand's **bullseye O** (currentColor ring + red `#ed1c24` centre dot) and a "TILES · TILES" tagline, pinned top-left, `position: fixed`, links to `#top`.
2. **Scale on scroll:** at page top the logo renders at ~2.07× scale (spans the hero). After the first scroll it eases down to 1× (~600px wide) with the house easing and stays fixed for the whole page.
3. **Dual-layer inversion ("zebra"):**
   - Layer A: white SVG wordmark.
   - Layer B: identical black SVG clone, absolutely positioned on top (`.logo-zebra`).
   - On every scroll frame, measure the light (`ui-light`) sections' rectangles intersecting the logo box; set Layer B's `clip-path` (`polygon`/`inset` slices) so the logo is **black exactly where it overlaps white sections and white where it overlaps dark imagery/sections** — mid-letter splits included (a letter can be half black / half white during a transition).
   - Transition: `opacity/color 0.8s cubic-bezier(0.7,0,0.3,1)` where discrete swaps occur.
4. Footer repeats the wordmark small, in copper `#a0725b`.

---

## 5. Header / navigation

- `position: fixed`, full-width, ~118px tall, transparent — content scrolls beneath.
- Right side: one text CTA **"REQUEST CATALOGUE"** (their "CHOOSE AN APARTMENT") — 12px/600/uppercase, no border, no fill.
- Far right: hamburger = two thin horizontal lines, ~90px wide, white/black per polarity.
- Nav text follows the same polarity inversion as the logo.
- Fullscreen menu overlay (black) on burger click — for the presentation homepage a simple overlay with 5 links is enough.

---

## 6. Buttons & CTAs

One button species only — the **underlined text link**:

- 12px / 600 / uppercase / 0.36px tracking
- No background, no border, no radius, no padding box
- 1px underline offset ~6px below
- Accent variant in copper `#a0725b` ("WATCH", "REQUEST CATALOGUE")
- **Hover:** masked text swap — the label slides up out of a `clip-path` window while an identical clone slides in from below (two stacked `.btn__text` spans, clip `polygon` windows, 0.8s house easing). Arrow-icon variants nudge the arrow 8px on hover with the same mask trick.
- Slider arrows: long thin `→` strokes, 60–90px wide, 1px weight.

---

## 7. Scroll & motion system

**Engine:** Lenis (or Locomotive Scroll v4 like the original) + GSAP ScrollTrigger. Native scrollbar replaced by 3px thumb at right edge.

Motion vocabulary (all with the house easing):

| Pattern | Where | Spec |
|---|---|---|
| Smooth inertia scroll | whole page | lerp ~0.08 |
| Logo scale-down | hero → rest | 2.07× → 1× over first ~600px scroll |
| Horizontal chapter wipe | between major dark/light chapters | outgoing section translates X (up to −100vw) while next slides in from right; driven by scroll position, scrubbed, not timed |
| Pinned slider | "Amenities"-style chapter (5 slides) | section pins; each scroll step slides full-viewport split-slides (text left / photo right) horizontally; pagination "1 — 5" top-left; typewriter reveal on captions |
| Parallax depth | hero + large images | images translate slower than scroll (~0.85×); floating collage items each get different speeds |
| Image reveal | every image on first view | `clip-path: inset(0 0 100% 0)` → `inset(0)` 1.2s + slight scale 1.08 → 1 |
| Text reveal | headlines | split into lines; lines rise from below a clip mask, 0.08s stagger |
| Number counters | stats bar | count up on inview, slow (1.5s) |
| Day-cycle slider | "07:00" module | time-of-day stepper crossfades duplicate renders at different light; big clock numeral crossfades |
| Micro-interactions | links, arrows | masked swap (see §6) |

**Rules:** slow is luxury. Nothing autoplays fast, nothing bounces, no opacity-only fades for imagery (always masked). Respect `prefers-reduced-motion`: kill transforms, keep opacity.

---

## 8. Layout grid

- Full-bleed sections; content on a 12-col grid, generous asymmetry.
- Signature composition: **half-screen photo | half-screen black panel with 12px caption block bottom-left and display headline right-aligned bottom.**
- Captions sit in surprising corners (bottom-left, right-aligned edges) — never centered.
- Images butt to the exact viewport edge on one side; whitespace oceans on the other.
- Display headlines may overflow the viewport edge intentionally (e.g. "INFRASTRUCTURE" bleeding right).

---

## 9. Page structure — Orkay homepage (section by section)

Mirrors the reference's chapter flow, content re-mapped to Orkay:

| # | Polarity | Reference section | Orkay version |
|---|---|---|---|
| 0 | dark | Hero: dusk cityscape, giant logo | Cinematic dusk shot of Orkay's factory/HQ or premium space clad in Orkay slabs. Tagline: "CRAFTED IN MORBI. DESIGNED FOR THE WORLD." CTA: REQUEST CATALOGUE |
| 1 | light | "Three buildings…" statement + towers | Chapter statement: "SEVEN MANUFACTURING UNITS. 60,000 SQ.M A DAY. THIRTY YEARS OF CRAFT." + wide factory/architecture photo |
| 2 | light | Panoramic windows & lighting split-images | "PANORAMIC SLABS AND ARCHITECTURAL SURFACES" — application shots (facade, lobby floor) |
| 3 | light | PREMIUM MATERIALS floating collage | **Identical collage idea, natural fit:** floating tile finishes — marble-look slab, wood-look plank, black stone circle, brass detail — each with parallax drift |
| 4 | dark | Lobby/facade luxury pair + THE LUXURY OF EXPERIENCE | "THE LUXURY OF SURFACE" — dark showroom & installed-project pair |
| 5 | dark | GALLERY /11 PHOTOS masonry | "PROJECTS GALLERY /11 PHOTOS" — masonry of installed projects (hotel, villa, retail) |
| 6 | dark | 07:00 day-cycle slider | **"A TILE THROUGH THE DAY"** — same room render at 07:00 / 13:00 / 19:00 / 23:00; light plays across the same Orkay floor |
| 7 | dark | Pinned 5-slide amenities slider (Lobby, Concierge…) | Pinned 5-slide **manufacturing journey**: RAW MATERIAL → PRESSING & FIRING → 5-STEP QUALITY CONTROL → PACKAGING & CONTAINER LOADING → GLOBAL DELIVERY. Pagination 1—5, typewriter captions |
| 8 | light | Fitness/pool/sauna chapter | "COLLECTIONS" chapter — full-viewport editorial shots per collection (Glossy, Matt, Carving, 3D) with alternating split layouts |
| 9 | dark | INFRASTRUCTURE street scene | "GLOBAL PRESENCE" — dusk shot + headline bleeding off-edge; export map or container-port image; 35+ countries |
| 10 | light→dark | Private 2-acre park | "THE MORBI CAMPUS" — aerial of the 7 units / cluster |
| 11 | dark | TECHNOLOGIES AND SERVICES cards | Identical outlined-card stack: DIGITAL QUALITY LAB / OEM & PRIVATE LABEL / EXPORT DOCUMENTATION / DEALER SUPPORT — cards brighten sequentially on scroll |
| 12 | dark | Stats (4.2M ceilings, 3.6M windows) | Stats interleaved with imagery: 30 YEARS · 60,000 SQ.M/DAY · 35+ COUNTRIES · 1,000+ DESIGNS · CE · ISO 9001:2015 |
| 13 | dark | Private terraces + closing | "PARTNER WITH US" closing statement + REQUEST CATALOGUE / TALK TO EXPORT TEAM |
| 14 | dark | Footer | © 2026 ORKAY TILES INTERNATIONAL · copper wordmark center · back-to-top arrow · "SITE BY —" |

All trust numbers must come from the `orkay-tiles` verified fact library before shipping (PDF's 85,000 sqm/day conflicts with verified 60,000 sq.m/day — resolve with client).

---

## 10. Photography direction

- **Grading:** warm dusk (golden/amber highlights, deep blacks), never daylight-flat. Interiors: tungsten warmth on dark marble.
- **Sets needed (matching reference shot types):**
  1. Hero dusk architectural exterior (factory or slab-clad building, lit edges)
  2. Macro tile textures (marble vein, wood grain, stone relief) on dark bg
  3. Lifestyle luxury interior with Orkay floor/wall (lobby, bath, kitchen)
  4. People: worker's hands at kiln, QC engineer with gauge, showroom host — editorial, real, no stock feel
  5. Industrial cinematics: kiln fire, press line, container loading at dusk
  6. Same-room-different-time renders for the day-cycle module
- Format: 2560px wide JPG ~70%, `<picture>` with mobile crops. No isolated product-on-white renders anywhere.

---

## 11. Tech implementation notes

- Static single page for the presentation: `index.html` + one CSS + one JS. No build step.
- Libraries: Lenis (smooth scroll) + GSAP ScrollTrigger (pins, scrubbed wipes, reveals). Both via local files (no CDN dependency for offline presentation).
- Logo zebra: one `requestAnimationFrame` pass computing `ui-light` section rects → `clip-path: inset()` slices on the black logo layer. O(sections) per frame, cheap.
- Sliders: GSAP-pinned sections, no slider library.
- Fonts: self-hosted woff2.
- Accessibility: real `<h1>`–`<h3>` hierarchy (visually-hidden where needed, like the reference), keyboard focus visible, `prefers-reduced-motion` fallback, alt text on all imagery.
- Performance: lazy-load below-fold images, `will-change: transform` only on active layers, target LCP < 2.5s (hero image preloaded).

---

## 12. Success test

Shown to Pavan sir, the page should read as: "This is an international company." The visitor never sees a catalogue — they walk through a manufacturer's world at dusk, and every scroll feels engineered, like the tiles.
