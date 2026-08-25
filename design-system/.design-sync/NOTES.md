# design-sync notes — @orkay/ds

## What this package is

`orkay-z` is a Next.js **app**, not a component library. This package was extracted from it
so the design system could be synced to claude.ai/design. Two generators keep it honest:

- `scripts/build-css.mjs` regenerates `src/styles.css` by concatenating the app's own
  `app/globals.css` + `app/z9/z9.css`, rewriting `/fonts/` and `/img/` to relative paths and
  copying the woff2 files into `src/fonts/`. **The design system cannot drift from the
  shipping site** — re-run it whenever either stylesheet changes.
- `scripts/build-docs.mjs` writes `docs/<Name>.md`. Frontmatter `category` sets the DS-pane
  group. Edit the generator, not the generated files.
- `scripts/build-previews.mjs` writes `.design-sync/previews/*.tsx`. These are authored
  stories kept in one generator so the shared `Frame` and the SVG photography stand-ins stay
  identical across all 24 cards.

`npm run build` runs build-css then `tsc`. Run `build-docs` and `build-previews` by hand
after editing their generators.

## Environment

- Converter deps live in `.ds-sync/` (gitignored). `--node-modules ../node_modules` — react
  resolves from the orkay-z app, not from this package.
- **playwright must be 1.58.0**: the cached chromium here is build **1208**, and 1.58.0 is
  the release that pins it. 1.62 pins 1234 and fails with "Executable doesn't exist".
  Install with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.
- Entry is `./dist/index.js` (tsc output, not a bundler).

## Component decisions

- Framework-free React only — no `next/link`, no `@/content` imports. That is what lets the
  bundle build with esbuild and render in headless chromium with **no provider config at all**.
- `GlobalMap` and `CollectionReveal` from the app were deliberately **excluded**: the first is
  a one-off data visualisation whose data is the component, the second returns `null`.
- `Caption`, `FormatPlan` and `LocCard` gained props during this sync (`placement`, `style`,
  `style`) because each had hardcoded page-scoped positioning or sizing that made them
  unusable outside their original section.

## Traps found while making the previews render

These are real component constraints, now documented in each `.prompt.md`:

- `.logo__layer` is hardcoded white and `.logo__layer--ink` ships `clip-path: inset(0 0 100% 0)`.
  **On a light ground the wordmark is invisible** until the host app's zebra pass clips the ink
  in. The `InkedOverLightSection` story engages it the way that pass does.
- `.header` hardcodes `color: #fff`, so there is no light-ground Header variant.
- `.burger` uses `mix-blend-mode: difference` and only inverts correctly while it inherits
  white. Inheriting a light section's black makes it blend to white and vanish.
- `.z9-tile` is an anchor with `flex: none` + a width clamp — outside a flex row it stays
  inline, the width is ignored and the play glyph lands on the label.
- `.journey__slide` takes its type colour from the section around it; with no polarity ground
  the mid-role title renders white on white.

## Known render warns

- **Scrollbar** trips `[RENDER_BLANK]` on the byte heuristic when its frame is flat. The thumb
  is a 3px `mix-blend-mode: difference` hairline; it is genuinely correct at card resolution
  (verified in `_screenshots/navigation__Scrollbar.png`) but disappears when the review sheet
  is downscaled. Fixed by putting imagery behind it. If it re-flags, confirm the full-size
  screenshot before touching the preview.
- **Wordmark** cards crop horizontally even in `column` mode. That is inherent: the row is
  `space-between` across the full viewport by design.

## Discrepancy worth resolving with the client

`guidelines/DESIGN.md` documents a `--c-error` token. **It does not exist** in the shipped
CSS — `.field__error` uses a literal `#c60000`. Either add the token or drop it from the
doc; do not cite it in conventions.md until it exists.

`DESIGN.md` also flags that the quotation's "85,000 sq.m/day" conflicts with the verified
16,000 sq.m/day. Previews use 16,000. Still unresolved with Orkay.

## Re-sync risks

- **The stylesheet is generated.** If someone edits `src/styles.css` directly it will be
  silently overwritten on the next `npm run build`. Edit the app's CSS instead.
- **Previews are generated too.** `.design-sync/previews/*.tsx` are overwritten by
  `build-previews.mjs`. Hand-edits there will be lost — change the generator.
- The SVG slab data-URIs in the previews are stand-ins, not Orkay photography. If real
  rights-cleared imagery is added to the package later, swap them in the generator.
- `overrides` in config.json carries `cardMode` for 14 components. Those were derived from
  `[GRID_OVERFLOW]` warnings against this preview set; changing preview sizes may make them
  stale in either direction.
- Only the *homepage* design system is covered. The 17-page quoted scope (product catalog,
  filters, product detail, dealer onboarding) has no components here yet — those will need a
  second pass once built.

## CR Rev 1 (22 Aug 2026)

- Figures and names follow the client Change Request Rev 1: capacity **60,000 sq m/day**
  (supersedes 16,000 everywhere), brand name **"Orkay Tiles"** (no "International"), the
  Logo tag reads **"TILES"** with a **trademark (TM)** mark instead of (R), the red token is
  `#DE2025`, and `--c-ink: #2B2A29` exists for type on white grounds. Grounds stay `#000`.
- `styles.css` is regenerated from the app CSS, so these token changes arrive automatically
  on `npm run build`; docs/previews strings were updated in the generators.
- "Double Charge" and "Wooden Plank" are removed product lines — do not reintroduce them in
  preview copy (SplitSlide preview now says "Porcelain Slab").

## Re-sync 24 Aug 2026 — the brand mark became artwork

The app replaced its CSS-drawn wordmark with the client's supplied lockup
(`public/img/logo_orkay{,_white}.png`) and **deleted the entire `.logo__*` rule family**.
Because `src/styles.css` is generated from the app's CSS, the DS inherited that deletion
and its `Logo` — whose `O` was an *empty* span drawn purely by `.logo__o` — silently
rendered as "RKAY(TM)TILES".

**Nothing mechanical caught it.** The DS component's own source had not changed, so its
`sourceKey` matched the anchor and the driver classified `Logo` as `unchanged`; the render
check passed because the root was non-empty. Only reading the contact sheet found it.
*Lesson: on any re-sync where `styles.css` changed, read the contact sheets even when the
verdict is all-green — a generated stylesheet can rewrite components the diff calls
unchanged.*

Fixed by following the app: `scripts/build-logo-art.mjs` (new, wired into `npm run build`)
inlines both colourways as **lossless WebP data-URIs** into `src/components/logo-art.ts`,
and `Logo.tsx` renders `<img class="brandmark">` in the two existing layers. `LogoProps` is
unchanged, so the `.d.ts` contract did not move.

- **Why data-URIs, not a path:** the uploaded bundle has no image channel — a design built
  from this DS would resolve `/img/logo_orkay.png` against its own origin and 404. Inlining
  is what makes the mark travel. Cost: bundle 29 KB → 57 KB.
- Both colourways are required. The white one is not a filter of the dark one — the red
  bullseye and swoosh stay red in both.
- The surviving `.logo`, `.logo--xl` (scale 2.7), `.logo__layer--ink`
  (`clip-path: inset(0 0 100% 0)`) and `.brandmark` (`height: 1.55em`) rules still drive it,
  so the whole lockup still scales from one `--logo-size`.

## conventions.md drift found this run (not yet applied — author's call)

- **`--logo-track` no longer exists.** Removed with the text-wordmark CSS; conventions.md
  §3 still lists it. An agent trusting it emits `var(--logo-track)`, which resolves to
  nothing.
- **`guidelines/DESIGN.md` is the wrong path.** In the bundle it is
  `guidelines/docs/guides/DESIGN.md` (driven by `guidelinesGlob: docs/guides/**/*.md`).

Everything else in conventions.md re-verified clean against this build: all 9 other tokens,
every class, all 11 named components, and all four `Button` variants — `plain` is the
default and correctly emits **no** modifier class, and `nav` is built dynamically as
`btn--${variant}` so the literal never appears in the bundle. Don't "fix" those two.
