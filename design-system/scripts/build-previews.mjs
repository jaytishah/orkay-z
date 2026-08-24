/* Authors .design-sync/previews/<Name>.tsx — one file per component.
   Hand-written story sets kept in one generator so the shared frame and the
   photography stand-ins stay identical across all 24 cards.
   Re-run after editing; the converter never touches that directory. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../.design-sync/previews');
mkdirSync(out, { recursive: true });

/* Photography stand-ins. Inline SVG so a card never depends on a file outside
   the bundle — a 404 image reads as a broken component in the grid. */
const PREAMBLE = `import type { ReactNode } from 'react';

const DARK_SLAB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23241f1c'/%3E%3Cstop offset='.55' stop-color='%233d3531'/%3E%3Cstop offset='1' stop-color='%23171310'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='480' height='360' fill='url(%23g)'/%3E%3Cpath d='M-20 250 C 110 190 180 300 500 140' stroke='%23b9ab97' stroke-opacity='.42' stroke-width='2.5' fill='none'/%3E%3Cpath d='M-20 296 C 140 240 240 320 500 196' stroke='%23d8cbb6' stroke-opacity='.22' stroke-width='1.2' fill='none'/%3E%3Cpath d='M-20 190 C 160 150 250 210 500 96' stroke='%23a2937f' stroke-opacity='.18' stroke-width='1' fill='none'/%3E%3C/svg%3E";

const LIGHT_SLAB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Cdefs%3E%3ClinearGradient id='l' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23efeae2'/%3E%3Cstop offset='.5' stop-color='%23dcd4c8'/%3E%3Cstop offset='1' stop-color='%23c9bfb0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='480' height='360' fill='url(%23l)'/%3E%3Cpath d='M-20 230 C 120 170 190 280 500 120' stroke='%238d8274' stroke-opacity='.4' stroke-width='2' fill='none'/%3E%3Cpath d='M-20 280 C 150 220 250 300 500 180' stroke='%236f6558' stroke-opacity='.2' stroke-width='1' fill='none'/%3E%3C/svg%3E";

/* The site's chrome is position:fixed. A transform on the wrapper makes it the
   containing block, so a card holds the component instead of it escaping to the
   viewport. Pass \`fixed\` only when the component needs a hard box to lay out
   against — otherwise height stays open so nothing gets clipped. */
function Frame({ ground = 'dark', h, w, pad = 28, fixed, children }: {
  ground?: 'dark' | 'light'; h?: number; w?: number; pad?: number;
  fixed?: boolean; children: ReactNode;
}) {
  return (
    <div
      className={ground === 'dark' ? 'ui-dark' : 'ui-light'}
      style={{
        position: 'relative', transform: 'translateZ(0)', padding: pad,
        minHeight: h, height: fixed ? h : undefined, width: w,
        overflow: fixed ? 'hidden' : undefined,
      }}
    >
      {children}
    </div>
  );
}
`;

const P = {
  Small: [`import { Small } from '@orkay/ds';`, `
export function Caption() {
  return (
    <Frame>
      <Small>Premium vitrified surfaces crafted in Morbi, designed for the world.</Small>
    </Frame>
  );
}

export function MutedMeta() {
  return (
    <Frame>
      <Small>Morbi, Gujarat, India</Small>
      <Small as="figcaption">Bone Travertino Ivory &middot; 800&times;1600 &middot; Matt</Small>
    </Frame>
  );
}

export function OnLightGround() {
  return (
    <Frame ground="light">
      <Small>Seven manufacturing units, thirty years, one gate in Morbi.</Small>
    </Frame>
  );
}
`],

  Mid: [`import { Mid } from '@orkay/ds';`, `
export function ChapterStatement() {
  return (
    <Frame>
      <Mid>Seven manufacturing units. 60,000 sq m a day. Thirty years of craft.</Mid>
    </Frame>
  );
}

export function OnLightGround() {
  return (
    <Frame ground="light">
      <Mid>Full-slab walls and mirror-polished floors from our own kilns</Mid>
    </Frame>
  );
}
`],

  Display: [`import { Display } from '@orkay/ds';`, `
export function Headline() {
  return (
    <Frame>
      <Display>Morbi to<br />40+ countries</Display>
    </Frame>
  );
}

export function OnLightGround() {
  return (
    <Frame ground="light">
      <Display>One thousand<br />designs deep</Display>
    </Frame>
  );
}
`],

  Logo: [`import { Logo } from '@orkay/ds';`, `
export function Default() {
  return (
    <Frame h={210} fixed>
      <Logo />
    </Frame>
  );
}

/* The base layer is always white and the black ink clone ships fully clipped
   away, so over a light section the mark is invisible until the runtime zebra
   pass clips the ink in. This engages the ink layer the way that pass does. */
export function InkedOverLightSection() {
  return (
    <Frame ground="light" h={210} fixed>
      <style>{'.ink-demo .logo__layer--ink { clip-path: inset(0); }'}</style>
      <div className="ink-demo"><Logo /></div>
    </Frame>
  );
}
`],

  Wordmark: [`import { Wordmark } from '@orkay/ds';`, `
export function SinceNineteenNinetySix() {
  return (
    <Frame h={230}>
      <Wordmark />
    </Frame>
  );
}

export function CustomGlyphs() {
  return (
    <Frame ground="light" h={230}>
      <Wordmark lead="ORKAY" trail="2026" />
    </Frame>
  );
}
`],

  Button: [`import { Button } from '@orkay/ds';`, `
export function Underline() {
  return (
    <Frame>
      <Button label="Request Catalogue" variant="underline" href="#formats" />
    </Frame>
  );
}

export function Red() {
  return (
    <Frame>
      <Button label="Send Inquiry" variant="red" />
    </Frame>
  );
}

export function Nav() {
  return (
    <Frame>
      <Button label="Request Catalogue" variant="nav" href="#formats" />
    </Frame>
  );
}

export function Plain() {
  return (
    <Frame ground="light">
      <Button label="&larr; All Collections" />
    </Frame>
  );
}
`],

  Arrow: [`import { Arrow } from '@orkay/ds';`, `
export function Pair() {
  return (
    <Frame>
      <div style={{ display: 'flex', gap: 8 }}>
        <Arrow direction="prev" aria-label="Previous time" />
        <Arrow direction="next" aria-label="Next time" />
      </div>
    </Frame>
  );
}

export function OnLightGround() {
  return (
    <Frame ground="light">
      <div style={{ display: 'flex', gap: 8 }}>
        <Arrow direction="prev" aria-label="Previous space" />
        <Arrow direction="next" aria-label="Next space" />
      </div>
    </Frame>
  );
}
`],

  Burger: [`import { Burger } from '@orkay/ds';`, `
export function OnDarkGround() {
  return (
    <Frame h={140}>
      <Burger />
    </Frame>
  );
}

/* The lines are difference-blended, so they invert against whatever is behind
   them — but only while they inherit white, the way the fixed header sets it.
   Let them inherit a light section's black and they blend to white and vanish. */
export function OverLightSection() {
  return (
    <Frame ground="light" h={140}>
      <div style={{ color: '#fff' }}><Burger /></div>
    </Frame>
  );
}
`],

  Header: [`import { Header, Button, Burger } from '@orkay/ds';`, `
/* The bar hardcodes white type, so it is only ever shown over dark imagery or a
   dark section — there is no light-ground variant to author. */
export function WithCatalogueCta() {
  return (
    <Frame h={190} pad={0} fixed>
      <Header>
        <Button label="Request Catalogue" variant="nav" href="#formats" />
        <Burger />
      </Header>
    </Frame>
  );
}
`],

  Menu: [`import { Menu } from '@orkay/ds';`, `
const LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About Us', href: '#about' },
  { label: 'Products', href: '#ranges' },
  { label: 'Contact Us', href: '#contact' },
];

export function Open() {
  return (
    <Frame h={460} pad={0} fixed>
      <Menu links={LINKS} open />
    </Frame>
  );
}
`],

  Pagination: [`import { Pagination } from '@orkay/ds';`, `
export function FirstOfFive() {
  return (
    <Frame>
      <Pagination current={1} total={5} />
    </Frame>
  );
}

export function MidSequence() {
  return (
    <Frame ground="light">
      <Pagination current={3} total={6} />
    </Frame>
  );
}
`],

  Scrollbar: [`import { Scrollbar } from '@orkay/ds';`, `
/* The thumb is difference-blended white, so it needs something behind it to
   invert against — over flat black it is a white hairline nobody can see. */
export function NearTop() {
  return (
    <Frame h={300} w={260} pad={0} fixed>
      <img src={DARK_SLAB} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <Scrollbar thumbHeight="28%" thumbTop="5%" />
    </Frame>
  );
}

export function MidPage() {
  return (
    <Frame h={300} w={260} pad={0} fixed>
      <img src={LIGHT_SLAB} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <Scrollbar thumbHeight="28%" thumbTop="50%" />
    </Frame>
  );
}
`],

  Section: [`import { Section, Display, Small } from '@orkay/ds';`, `
export function Dark() {
  return (
    <div style={{ transform: 'translateZ(0)' }}>
      <Section polarity="dark" id="exports">
        <Small>Export Network</Small>
        <Display>Morbi to<br />40+ countries</Display>
      </Section>
    </div>
  );
}

export function Light() {
  return (
    <div style={{ transform: 'translateZ(0)' }}>
      <Section polarity="light" id="about">
        <Small>The Campus</Small>
        <Display>One thousand<br />designs deep</Display>
      </Section>
    </div>
  );
}
`],

  SplitSlide: [`import { SplitSlide } from '@orkay/ds';`, `
/* The slide inherits its type colour from the section it sits in — without a
   polarity ground the mid-role title renders white on white. */
export function MediaRight() {
  return (
    <div className="ui-light" style={{ transform: 'translateZ(0)', overflow: 'hidden' }}>
      <SplitSlide
        title={<>Glazed<br />Vitrified</>}
        desc="Full-body porcelain pressed and fired on our own lines, polished to a gloss that survives thirty years of traffic."
        src={DARK_SLAB}
        alt="Veined black marble-look porcelain slab"
      />
    </div>
  );
}

export function MediaLeft() {
  return (
    <div className="ui-dark" style={{ transform: 'translateZ(0)', overflow: 'hidden' }}>
      <SplitSlide
        mediaSide="left"
        title={<>Double<br />Charge</>}
        desc="Twice-loaded vitrified with the pattern carried 3 to 4mm into the body, for floors that are ground back and still hold their face."
        src={LIGHT_SLAB}
        alt="Bone travertine-look vitrified slab"
      />
    </div>
  );
}
`],

  Caption: [`import { Caption } from '@orkay/ds';`, `
export function InFlow() {
  return (
    <Frame>
      <Caption>
        The lobby is built the way grand hotels are built: two-metre mirrors, dark glossy
        stone walls, and a floor that holds the reflection of every light above it.
      </Caption>
    </Frame>
  );
}

export function OverImagery() {
  return (
    <Frame h={260} pad={0} fixed>
      <img
        src={DARK_SLAB}
        alt="Hotel lobby clad in dark ORKAY marble slabs"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24 }}>
        <Caption>
          One vein, one shade, one batch — lobby wall to bathroom floor, however many
          floors sit between them.
        </Caption>
      </div>
    </Frame>
  );
}
`],

  CollectionCard: [`import { CollectionCard } from '@orkay/ds';`, `
export function Single() {
  return (
    <Frame ground="light" h={400}>
      <div style={{ width: 260 }}>
        <CollectionCard
          name="Statuario"
          meta="Glossy &middot; 800&times;1600"
          src={LIGHT_SLAB}
          alt="Statuario white marble-look porcelain slab"
        />
      </div>
    </Frame>
  );
}

export function Track() {
  return (
    <Frame ground="light" h={400}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 210 }}>
          <CollectionCard name="Statuario" meta="Glossy &middot; 800&times;1600" src={LIGHT_SLAB} alt="Statuario white marble-look slab" />
        </div>
        <div style={{ width: 210 }}>
          <CollectionCard name="Nero" meta="Matt &middot; 600&times;1200" src={DARK_SLAB} alt="Veined black marble-look slab" />
        </div>
      </div>
    </Frame>
  );
}
`],

  TechCard: [`import { TechCard } from '@orkay/ds';`, `
export function Single() {
  return (
    <Frame>
      <TechCard
        name="Digital Quality Lab"
        desc="Every batch gauged for calibre, warp and tone before it is allowed near a pallet."
      />
    </Frame>
  );
}

export function Stack() {
  return (
    <Frame>
      <div style={{ display: 'grid', gap: 28 }}>
        <TechCard name="OEM &amp; Private Label" desc="Your brand on the box, your reference on the face, run on our lines." />
        <TechCard name="Export Documentation" desc="IEC, CE and ISO paperwork issued from Morbi with the container." />
        <TechCard name="Dealer Support" desc="Sample boards, display racks and a named contact for every market." />
      </div>
    </Frame>
  );
}
`],

  LocCard: [`import { LocCard } from '@orkay/ds';`, `
export function Strip() {
  return (
    <Frame h={260} pad={16}>
      <div style={{ display: 'flex', gap: 10 }}>
        <LocCard title="Morbi" meta="Seven units" src={DARK_SLAB} alt="ORKAY manufacturing campus at dusk" style={{ width: 280 }} />
        <LocCard title="Mundra" meta="380 km &middot; port" src={LIGHT_SLAB} alt="Container yard at Mundra port" style={{ width: 280 }} />
      </div>
    </Frame>
  );
}

export function Single() {
  return (
    <Frame h={260} pad={16}>
      <LocCard title="Morbi" meta="Seven units" src={DARK_SLAB} alt="ORKAY manufacturing campus at dusk" style={{ width: 340 }} />
    </Frame>
  );
}
`],

  Tile: [`import { Tile } from '@orkay/ds';`, `
/* z9-tile is an anchor with flex:none and a width clamp — outside a flex row it
   stays inline, the width is ignored and the play glyph lands on the label. */
export function Pair() {
  return (
    <Frame h={400}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Tile variant="dark" label="About the factory" play />
        <Tile variant="light" label="Private label and mixed loads" headline="Custom Runs" cta="See the range" />
      </div>
    </Frame>
  );
}

export function DarkWithPlay() {
  return (
    <Frame h={400}>
      <div style={{ display: 'flex' }}>
        <Tile variant="dark" label="Inside the kiln line" play />
      </div>
    </Frame>
  );
}
`],

  StatItem: [`import { StatItem } from '@orkay/ds';`, `
export function Grid() {
  return (
    <Frame ground="light">
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          borderTop: '1px solid rgba(0,0,0,0.18)',
        }}
      >
        <StatItem value="30" label="years in Morbi" />
        <StatItem value="60,000" label="sq.m a day" />
        <StatItem value="40+" label="countries served" />
        <StatItem value="1,000+" label="designs in catalogue" />
      </div>
    </Frame>
  );
}

export function Single() {
  return (
    <Frame>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', width: 220 }}>
        <StatItem value="60,000" label="sq.m a day" />
      </div>
    </Frame>
  );
}
`],

  DayCycleClock: [`import { DayCycleClock } from '@orkay/ds';`, `
export function Morning() {
  return (
    <Frame h={360} pad={0} fixed>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 320, height: 320, transform: 'translate(-50%, -50%)' }}>
        <DayCycleClock time="07:00" />
      </div>
    </Frame>
  );
}

export function Evening() {
  return (
    <Frame h={360} pad={0} fixed>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 320, height: 320, transform: 'translate(-50%, -50%)' }}>
        <DayCycleClock time="19:30" />
      </div>
    </Frame>
  );
}
`],

  FormatPlan: [`import { FormatPlan } from '@orkay/ds';`, `
export function Portrait() {
  return (
    <Frame h={320}>
      <FormatPlan width={600} height={1200} style={{ width: 240 }} />
    </Frame>
  );
}

export function Square() {
  return (
    <Frame h={320}>
      <FormatPlan width={800} height={800} style={{ width: 240 }} />
    </Frame>
  );
}

export function LargeFormat() {
  return (
    <Frame h={320}>
      <FormatPlan width={800} height={1600} style={{ width: 240 }} />
    </Frame>
  );
}
`],

  InquiryForm: [`import { InquiryForm } from '@orkay/ds';`, `
export function Empty() {
  return (
    <Frame>
      <InquiryForm />
    </Frame>
  );
}

export function WithServerErrors() {
  return (
    <Frame>
      <InquiryForm
        initialErrors={{ email: 'Enter a valid business email.', country: 'Required.' }}
      />
    </Frame>
  );
}

export function Acknowledged() {
  return (
    <Frame h={220}>
      <InquiryForm initialState="sent" />
    </Frame>
  );
}
`],

  FloatingActions: [`import { FloatingActions } from '@orkay/ds';`, `
/* chatReady swaps the anchor for a button and is visually identical, so there is
   only one card here — the difference is in the API, not the render. */
export function ContactFallback() {
  return (
    <Frame h={230} pad={0} fixed>
      <FloatingActions whatsapp="919104488859" />
    </Frame>
  );
}
`],
};

let n = 0;
for (const [name, [imports, body]] of Object.entries(P)) {
  writeFileSync(`${out}/${name}.tsx`, `${imports}\n${PREAMBLE}${body}`);
  n += 1;
}
console.log(`previews: wrote ${n} story files`);
