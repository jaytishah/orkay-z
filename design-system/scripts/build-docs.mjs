/* Generates docs/<Name>.md — one per component.
   Frontmatter `category` sets the group the card lands in inside the Design
   System pane; the body is what the design agent reads as usage reference. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
mkdirSync(out, { recursive: true });

const PHOTO = "src={slab} alt=\"Veined black marble-look porcelain slab\"";

const DOCS = {
  Small: ['Type', 'The 12px caption role — one of only two text sizes in the system.',
    `Everything that is not a headline is set in this: labels, captions, notes, nav items,
body paragraphs. 12px / 600 / uppercase / 0.36px tracking.

There are deliberately **no intermediate sizes**. The jump from this to \`Display\` is the
ORKAY identity; adding a 16px or 24px role in between dissolves it.`,
    `<Small>Morbi, Gujarat, India</Small>
<Small as="figcaption">Bone Travertino Ivory · 800×1600</Small>`],

  Mid: ['Type', 'The chapter-statement role — clamp(28px, 3.2vw, 48px).',
    `Used for section statements that need to read as a sentence rather than a poster, and
for the figure in a \`StatItem\` or the name on a \`CollectionCard\`. Line height 1.07.`,
    `<Mid>Seven manufacturing units. 60,000 sq m a day. Thirty years of craft.</Mid>`],

  Display: ['Type', 'The poster headline — clamp(44px, 6.5vw, 110px).',
    `Section titles are set in this and nothing else. Line height 1.02.

Break lines by hand with \`<br />\` rather than letting the browser wrap: where the line
breaks is a composition decision, not a viewport accident. Headlines are allowed to
overflow the viewport edge on purpose.`,
    `<Display>Morbi to<br />40+ countries</Display>`],

  Logo: ['Brand', 'The fixed brand wordmark, with its two-layer ink inversion.',
    `The most distinctive element in the system. The \`O\` is the brand bullseye — a
currentColor ring with a brand-red centre dot.

It renders as two stacked layers, a base and an \`ink\` clone. At runtime the site measures
which \`ui-light\` sections sit under the mark each frame and clips the ink layer to exactly
those rectangles, so the wordmark is black over white sections and white over dark ones,
splitting mid-letter during a transition. That clipping is the host app's job; the
component ships both layers ready for it and renders correctly without it.

**On a light section the mark is invisible on its own.** The base layer is hardcoded
white and the black ink clone ships fully clipped away, so nothing shows until the
runtime pass clips the ink in. Place it over dark imagery, or make sure that pass is running.

\`size="xl"\` is the 2.7x hero treatment that eases down to \`default\` on first scroll.`,
    `<Logo />
<Logo size="xl" />`],

  Wordmark: ['Brand', 'The full-bleed glyph row spanning the hero foot.',
    `Each character is its own span and the row is \`space-between\`, so the glyphs touch both
viewport edges exactly whatever the font metrics do.

Never set letter-spacing on it — the spacing *is* the layout.`,
    `<Wordmark />
<Wordmark lead="ORKAY" trail="2026" />`],

  Button: ['Actions', 'The only button species — a text link with a masked label swap.',
    `There is no filled button, no border, no radius and no padding box anywhere on this site.
On hover the label slides up out of its clip window while an identical clone rises into
place, over 0.8s on the house easing.

\`label\` is a string rather than children on purpose: the mask needs two identical copies,
and arbitrary nodes break the swap.

- \`plain\` — bare label
- \`underline\` — ruled, the standard CTA
- \`red\` — brand accent, used sparingly
- \`nav\` — the pill in the fixed header, the one place a fill appears`,
    `<Button label="Request Catalogue" variant="nav" href="#formats" />
<Button label="See the range" variant="underline" />`],

  Arrow: ['Actions', 'The slider arrow — a bare glyph that nudges on hover.',
    `Used by the day-cycle stepper and the applications stepper. Never given a border or a
background: it is a stroke, not a control surface. Always pass a real \`aria-label\` — the
glyph alone reads as punctuation to a screen reader.`,
    `<Arrow direction="prev" aria-label="Previous time" />
<Arrow direction="next" aria-label="Next time" />`],

  Burger: ['Actions', 'The menu trigger — three hairlines in difference blend.',
    `88px wide, in \`mix-blend-mode: difference\` so it stays legible over both dark imagery and
white sections without any polarity logic of its own. The outer lines spread 3px on hover.

The blend only works while the lines inherit **white**, the way the fixed header sets
it. Let them inherit a light section's black and they blend to white and disappear.`,
    `<Burger onClick={openMenu} />`],

  Header: ['Navigation', 'The fixed, transparent page header.',
    `Full width, ~118px tall, content scrolling beneath. It has no background and never gains
one on scroll.

The bar is \`pointer-events: none\` so it never blocks the page; only its links and buttons
take pointer events back. Put the nav CTA and the burger inside it and nothing else —
this system has one header action.

The bar hardcodes white type, so it is only ever shown over dark imagery or a dark
section. There is no light-ground variant.`,
    `<Header>
  <Button label="Request Catalogue" variant="nav" href="#formats" />
  <Burger />
</Header>`],

  Menu: ['Navigation', 'The fullscreen navigation overlay.',
    `Opens by animating \`clip-path\` from a closed inset to zero over 0.8s — never by fading,
and never by mounting. The panel stays in the DOM and is hidden with \`visibility\`, so the
transition has something to animate from.

Links are set large and centred and pick up brand red on hover — one of the few places the
accent colour is used.`,
    `<Menu open links={[
  { label: 'Home', href: '#top' },
  { label: 'About Us', href: '#about' },
]} />`],

  Pagination: ['Navigation', 'The slide counter used by every stepped chapter.',
    `Reads \`1 — 5\`. Set in the 12px role and parked in a corner of the pinned section, never
centred and never styled as a control.`,
    `<Pagination current={1} total={5} />`],

  Scrollbar: ['Navigation', 'The replacement scrollbar — a 3px thumb at the right edge.',
    `The native bar is hidden site-wide, so this is the only scroll affordance the visitor
gets. Position and height are written by the smooth-scroll engine each frame; the props
exist so the component can be rendered in a static state.`,
    `<Scrollbar thumbHeight="18%" thumbTop="24%" />`],

  Section: ['Layout', 'The polarity primitive every section is built on.',
    `Every section is one of exactly two polarities: \`dark\` (black ground, white type) or
\`light\` (white ground, black type). The page alternates between them.

That alternation drives the logo's ink clipping, which reads the \`data-polarity\` attribute
this component emits. **A section that skips it is invisible to the wordmark and the mark
will render wrong over it.**

There is no third ground colour, no tint and no gradient anywhere in the system.`,
    `<Section polarity="dark" id="exports">
  <Display>Morbi to<br />40+ countries</Display>
</Section>`],

  SplitSlide: ['Layout', 'The signature half-copy, half-photograph composition.',
    `A full-viewport slide split down the middle: copy on one side, a photograph butting the
viewport edge on the other.

The copy half is vertically centred with a deep top pad so text clears the fixed header,
and the description is capped at 440px so it stays a column. **Alternate \`mediaSide\`
between consecutive slides** — the alternation is what stops a pinned chapter reading as a
slideshow.

It takes its type colour from the section around it, so give it a \`Section\` or a
\`ui-dark\`/\`ui-light\` ground — with neither, the mid-role title renders white on white.`,
    `<SplitSlide title="Glazed Vitrified" desc="Full-body porcelain…" ${PHOTO} />
<SplitSlide title="Porcelain Slab" mediaSide="left" ${PHOTO} />`],

  Caption: ['Layout', 'The dense caption block in the corner of a full-bleed image.',
    `Set in the 12px role and capped at 66 characters so it stays a column against the
photograph rather than a paragraph across it.

Captions in this system sit in surprising corners — bottom-left, right-aligned edges — and
are never centred.

\`placement="corner"\` adds the absolute section-corner placement and needs a positioned
section with real height around it; the default \`flow\` sets the same type in normal flow.`,
    `<Caption>The lobby is built the way grand hotels are built.</Caption>`],

  CollectionCard: ['Cards', 'A collection tile from the horizontal collections track.',
    `The image sits in a fixed-height figure and scales 1.06 on hover over 1.2s. The slow
scale is the point — a fast one reads as a web store rather than a manufacturer.

Name in the mid role, finish and format line underneath in muted 12px.`,
    `<CollectionCard name="Statuario" meta="Glossy · 800×1600" ${PHOTO} />`],

  TechCard: ['Cards', 'A service card from the technologies stack.',
    `Deliberately plain: a rule, a name, a description. No border box, no icon, no hover lift.
The cards brighten in sequence as the section scrolls; that sequencing is the host app's
job and the card renders at full brightness without it.`,
    `<TechCard name="Digital Quality Lab" desc="Every batch gauged for calibre, warp and tone." />`],

  LocCard: ['Cards', 'The card used in the horizontal image strip.',
    `The caption sits **inside** the frame at the bottom left, over the image, rather than
beneath it — meta line first in muted 12px, then the title in the mid role. The image
scales 1.05 on hover behind a fixed frame.

The card is half its strip's width by default; pass \`style\` to size it outside that strip.`,
    `<LocCard title="Morbi" meta="Seven units" ${PHOTO} />`],

  Tile: ['Cards', 'The paired tiles under the film-curtain headline.',
    `Square, flat, no radius — one usually dark with a play glyph, one light with a headline
and a call to action.

The CTA rule is a two-layer wipe: a static hairline with a second line sliding across it
from the left on hover. The play glyph scales 1.3 on hover. Both on the house easing.

**It must sit in a flex row.** The tile is an anchor with \`flex: none\` and a width clamp;
outside a flex container it stays inline, the width is ignored and the play glyph lands
on top of the label.`,
    `<Tile variant="dark" label="About the factory" play />
<Tile variant="light" label="Private label" headline="Custom Runs" cta="See the range" />`],

  StatItem: ['Cards', 'One cell of the trust-figures grid.',
    `The figure in the mid role, the label in muted 12px beneath it. The rule above belongs to
the grid, not the item, so items never carry their own border.

Figures count up from zero when the grid first enters view. **Every number shown on the
site must come from Orkay's verified figures**, not from a brochure.`,
    `<StatItem value="60,000" label="sq.m a day" />
<StatItem value="35+" label="countries" />`],

  DayCycleClock: ['Modules', 'The oversized clock dial behind the day-cycle chapter.',
    `A 92vh ring with two hairline hands that swing to each hour as the visitor steps through
the day. Hands transition over 1.2s, so stepping reads as a sweep rather than a jump.

It is decorative, not a control: it carries \`aria-hidden\` and the real time is announced by
the numeral in the panel beside it.

**It is absolutely positioned and sized in viewport units** — give it a positioned parent
with real height or it will centre itself on the whole page.`,
    `<DayCycleClock time="07:00" />
<DayCycleClock time="19:30" />`],

  FormatPlan: ['Modules', 'The technical plan drawing for a tile format.',
    `A hairline rectangle in the true aspect ratio of the size, with dimension rules and
millimetre labels. It reads as a drawing off an engineer's sheet, not a product shot:
1.5px stroke on the tile, 0.75px on the dimension lines, no fill, no shadow.

When the format changes the rectangle redraws along its own path length rather than
cross-fading.

The drawing is 20vw wide by default, which collapses in a narrow container — pass
\`style={{ width: 240 }}\` to size it explicitly.`,
    `<FormatPlan width={600} height={1200} />
<FormatPlan width={800} height={800} />`],

  InquiryForm: ['Forms', 'The B2B export inquiry form.',
    `The only form in the system, and the one place \`Button\`'s underline and red variants
appear together.

Labels sit above their inputs in the 12px role; inputs are underlined rules with no box,
no radius and no fill, matching the button species.

The four interest values are fixed — each maps to a different CRM follow-up sequence, so
changing them silently breaks lead routing.

Validation messages come back from the server per field. The client does not duplicate the
rules, so there is exactly one source of truth for what is valid.`,
    `<InquiryForm />
<InquiryForm initialState="sent" />`],

  FloatingActions: ['Forms', 'The two persistent buttons at the bottom right.',
    `WhatsApp, and chat.

The chat button degrades honestly: with no chat widget mounted it becomes a link to the
contact block rather than a button that does nothing. **Never render a control here with
nothing behind it** — a dead floating button is worse than no floating button.

WhatsApp opens with the inquiry already written, so the buyer's first message is a real one
and reaches the CRM already qualified.`,
    `<FloatingActions whatsapp="919104488859" />`],
};

let n = 0;
for (const [name, [category, summary, body, example]] of Object.entries(DOCS)) {
  const md = `---
category: ${category}
---

# ${name}

${summary}

${body}

## Usage

\`\`\`tsx
import { ${name} } from '@orkay/ds';

${example}
\`\`\`
`;
  writeFileSync(`${out}/${name}.md`, md);
  n += 1;
}
console.log(`docs: wrote ${n} component pages`);
