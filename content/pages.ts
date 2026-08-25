/* Content for the ten standalone pages.
 *
 * This is the CMS seam: every page below reads from these typed exports and
 * hardcodes nothing, so swapping a constant for a DynamoDB fetch that returns
 * the same shape leaves the components untouched.
 *
 * FACTS: every number, certificate and date here is taken from the verified
 * Orkay reference library (CE, ISO 9001:2015 and IEC certificates plus the
 * Direct Manufacturer Advantage brief). Do not edit a figure here without a
 * source document — the quotation makes Orkay the owner of every published claim.
 *
 * Anything still awaiting Orkay input is marked `todo: true` and renders with a
 * visible TO CONFIRM badge, so no invented content can reach production unnoticed.
 */

export type Fact = { label: string; value: string; todo?: boolean };
export type Item = { title: string; desc: string; todo?: boolean };
export type Step = { n: string; title: string; desc: string };

/* ─── verified company facts, shared by several pages ─── */

export const company = {
  legalName: 'ORKAY TILES',
  tradingName: 'ORKAY Tiles',
  entity: 'Partnership firm',
  founded: '1996',
  years: '30',
  units: '7',
  capacity: '60,000',
  countries: '40+',
  designs: '4,000+',
  iec: 'AAAFO3244L',
  signatory: 'Padsumbiya Babulal Devshibhai',
  address: 'Shop No. 62, 63, 64, Shakti Chamber-1, 8A National Highway, Morbi-363642, Gujarat, India',
};

export const certifications: Fact[] = [
  { label: 'ISO 9001:2015', value: 'QMS-26041605 · IPQ Management System (UK) · UKAF-CB-021' },
  { label: 'ISO validity', value: '16 Apr 2026 — 15 Apr 2029' },
  { label: 'ISO scope', value: 'Manufacturer and supplier of wall, floor, vitrified porcelain tiles and sanitary wares' },
  { label: 'CE', value: 'QM/26/05AO/PCCE · QM Certification & Assessment Ltd, London' },
  { label: 'CE regulation', value: 'EU Construction Products Regulation (CPR) 305/2011' },
  { label: 'CE validity', value: '18 May 2026 — 17 May 2029' },
  { label: 'CE products', value: 'Bricks, ceramic tiles, vitrified porcelain tiles, sanitary wares' },
  { label: 'Export registration', value: 'DGFT IEC AAAFO3244L, held since December 2020' },
];

/* Quoted verbatim from the approved QC brief — do not paraphrase. */
export const qcSteps: Step[] = [
  {
    n: '01',
    title: 'Pre-production control',
    desc: 'Raw materials and specifications are verified before production begins to ensure consistency with approved samples and technical requirements.',
  },
  {
    n: '02',
    title: 'In-process inspection',
    desc: 'Dimensional accuracy, surface finish, shade, calibration, and physical properties are monitored during production to identify and correct deviations early.',
  },
  {
    n: '03',
    title: 'Pre-packing quality checks',
    desc: 'Tiles are inspected for visual quality, edge condition, surface defects, and batch uniformity before packing approval.',
  },
  {
    n: '04',
    title: 'Packing & pallet verification',
    desc: 'Packing configuration, box weight, pallet stability, labeling, and protection standards are verified to minimize breakage risk during ocean transit.',
  },
  {
    n: '05',
    title: 'Pre-shipment release approval',
    desc: 'Final shipment release is authorized only after QC confirmation that the order complies with approved specifications, documentation, and batch traceability requirements.',
  },
];

/* ─── About ─── */

export const about = {
  kicker: 'About ORKAY',
  title: 'Thirty years of\nfiring porcelain\nin Morbi',
  lede: 'ORKAY Tiles is a manufacturer, not a trading house. Seven production units, 60,000 square metres a day, and our own export code — the tiles in your container were pressed and fired on lines we own.',
  story: [
    'Morbi taught India to fire porcelain, and ORKAY has been part of that since 1996. What began as a single cement-mosaic line in 1996 is now seven units running to a combined 60,000 square metres a day, supplying importers, distributors and project buyers in more than forty countries.',
    'The distinction that matters to a buyer is simple. A trading intermediary sources from whichever factory has stock, so shade, calibre and lead time move with the market. We press, fire, polish and pack on our own lines, hold our own IEC, and answer for every batch that leaves the yard.',
    'That is the whole proposition: one gate in Morbi, one accountable manufacturer, and a batch you can trace from the raw body to the pallet.',
  ],
  figures: [
    { label: 'years manufacturing', value: '30' },
    { label: 'production units', value: '7' },
    { label: 'sq m a day', value: '60,000' },
    { label: 'countries served', value: '40+' },
  ] as Fact[],
  entity: [
    { label: 'Legal entity', value: 'ORKAY TILES — Partnership firm under the Indian Partnership Act' },
    { label: 'Authorised signatory', value: 'Padsumbiya Babulal Devshibhai' },
    { label: 'Importer-Exporter Code', value: 'AAAFO3244L (DGFT, issued December 2020)' },
    { label: 'Registered office', value: 'Shop No. 62, 63, 64, Shakti Chamber-1, 8A National Highway, Morbi-363642, Gujarat, India' },
    { label: 'GST registration', value: 'To be confirmed by Orkay', todo: true },
  ] as Fact[],
};

/* ─── Contact ─── */

export const contactPage = {
  kicker: 'Contact',
  title: 'One gate\nin Morbi',
  lede: 'Export enquiries, domestic supply, private label and dealer applications all reach the same team. Tell us the market and the volume and you will hear back within one business day.',
  desks: [
    { title: 'Export desk', desc: 'Container enquiries, mixed loads, documentation and freight coordination for buyers outside India.' },
    { title: 'Domestic desk', desc: 'Supply across India — dealer stock, project quantities and regional distribution.' },
    { title: 'OEM & private label', desc: 'Your brand on the box and your reference on the face, run on our own lines.' },
    { title: 'Dealer applications', desc: 'District enquiries under the One District, One Dealer model, and the paperless onboarding flow with Aadhaar e-Sign.' },
  ] as Item[],
  visiting: [
    { label: 'Office', value: 'Shop No. 62, 63, 64, Shakti Chamber-1, 8A National Highway, Morbi-363642, Gujarat, India' },
    { label: 'Nearest port', value: 'Mundra — approximately 380 km by road' },
    { label: 'Nearest airport', value: 'Rajkot (RAJ) — approximately 65 km' },
    { label: 'Office hours', value: 'Monday to Saturday, 10:00 — 19:00 IST' },
  ] as Fact[],
};

/* The three ways in on /contact. Each renders a section with its own CTA;
   the button opens that section's form in a modal. `form` names which one —
   the page holds the component map, this file holds the words. */
export type Channel = {
  n: string;
  form: 'inquiry' | 'dealership' | 'support';
  kicker: string;
  title: string;
  lede: string;
  /* what to have to hand before opening the form */
  ready: string[];
  cta: string;
  dialogTitle: string;
  dialogLede: string;
  image: string;
  alt: string;
};

export const contactChannels: Channel[] = [
  {
    n: '01',
    form: 'inquiry',
    kicker: 'General enquiry',
    title: 'Ask the desk\na direct question',
    lede: 'Pricing, availability, a container, an OEM run, a spec sheet for a project — one form, and it reaches the desk that handles it. The more specific the brief, the faster the quote comes back.',
    ready: [
      'The market and the destination port, if you are importing',
      'Sizes and finishes you are looking at',
      'Monthly or one-off quantity',
      'Whether it is for stock, a project, or private label',
    ],
    cta: 'Open the enquiry form',
    dialogTitle: 'Send an enquiry',
    dialogLede: 'Answered within one business day, by a person, from Morbi.',
    image: '/img/export_sales_desk_morbi.jpg',
    alt: 'Large-format tile samples, a stack of spec sheets and a tape measure laid out along the export desk in the Morbi office, with the sales floor working behind',
  },
  {
    n: '02',
    form: 'dealership',
    kicker: 'Apply for a dealership',
    title: 'One district,\none dealer',
    lede: 'Orkay appoints dealers directly, one per district, on factory pricing. The application checks your district before it proceeds, verifies the firm against its GSTIN, and ends in an Aadhaar OTP e-signature — no paper, no courier.',
    ready: [
      'GSTIN and PAN for the applying firm',
      'The district you intend to serve',
      'An Aadhaar-linked mobile for the signatory',
      'A bank reference, only if you want credit terms',
    ],
    cta: 'Apply for a dealership',
    dialogTitle: 'Dealership application',
    dialogLede: 'Your GSTIN is checked against the GST registry as you type. Nothing is printed or couriered.',
    image: '/img/tile_showroom_gallery.jpg',
    alt: 'A dealer showroom aisle lined with full-height porcelain slab panels in dark steel frames, a sample board rack at the right and a single visitor at the far end',
  },
  {
    n: '03',
    form: 'support',
    kicker: 'Dealer support programme',
    title: 'Already a dealer?\nAsk for support',
    lede: 'Display racks, sample boards, catalogue and range photography, showroom branding, a batch held for a project, or a quality question. Appointed dealers raise it here with their dealer code and it lands with the desk that owns their account.',
    ready: [
      'Your ORKAY dealer code, from your signed agreement',
      'Showroom name and city',
      'What you need, and how much of it',
      'The project or deadline it is for, if there is one',
    ],
    cta: 'Request dealer support',
    dialogTitle: 'Dealer support request',
    dialogLede: 'For appointed Orkay dealers. Your dealer code is on your signed agreement.',
    image: '/img/tile_despatch_morbi.jpg',
    alt: 'Tile sample boards and a flat-packed display stand laid out on a workbench with packing tape, ready for despatch to a dealer, wrapped pallets and the loading bay behind',
  },
];

/* ─── Product ─── */

export const productPage = {
  kicker: 'What we make',
  title: 'Four ranges,\none body of work',
  lede: 'Every range below is pressed, fired, polished and packed on lines Orkay owns. Sizes, finishes and technical properties are published so a specifier can compare them against a datasheet rather than a sales claim.',
  properties: [
    { label: 'Water absorption', value: 'Per-body figures to be published from Orkay test reports', todo: true },
    { label: 'Surface finishes', value: 'Glossy · Matt · Carving · Relief punch · Anti-skid' },
    { label: 'Applications', value: 'Floors, walls, facades, wet areas, terraces, driveways, counter tops' },
    { label: 'Slip rating', value: 'R-value / DCOF per body, to be published from Orkay test reports', todo: true },
    { label: 'Compliance', value: 'CE under CPR 305/2011 · ISO 9001:2015 quality system' },
    { label: 'Full technical datasheet', value: 'Per-SKU datasheet issued on request', todo: true },
  ] as Fact[],
};

/* ─── Catalog ─── */

export type Download = {
  title: string;
  meta: string;
  /* null = the file has not been supplied yet, so the row asks rather than
     offering a link that would 404. Never render a dead download. */
  file: string | null;
};

export const catalogPage = {
  kicker: 'Catalogue',
  title: 'Everything\nin print',
  lede: 'Range catalogues, packing data and compliance certificates. Where a file has not been published yet the row will put you straight through to the export desk instead of offering a broken link.',
  downloads: [
    { title: 'Master export catalogue', meta: 'All six ranges · full size and finish matrix', file: null },
    { title: 'Vitrified porcelain tiles — range catalogue', meta: '600×600 · 600×1200 · 1000×1000 · 1200×1200 · 1200×1800', file: null },
    { title: 'Porcelain slab tiles — range catalogue', meta: '800×2400 · 800×3000 · 1200×1800 · counter tops', file: null },
    { title: 'Ceramic tiles — range catalogue', meta: 'Wall and floor · glossy, matt, carving · range being confirmed', file: null },
    { title: 'Outdoor tiles — range catalogue', meta: '600×600 matt anti-skid · full range being confirmed', file: null },
    { title: 'Packing details', meta: 'Box, pallet and container-load data by size', file: null },
    { title: 'CE certificate — QM/26/05AO/PCCE', meta: 'CPR 305/2011 · valid to 17 May 2029', file: null },
    { title: 'ISO 9001:2015 certificate — QMS-26041605', meta: 'IPQ Management System (UK) · valid to 15 Apr 2029', file: null },
    { title: 'Importer-Exporter Code — AAAFO3244L', meta: 'DGFT, Government of India', file: null },
  ] as Download[],
};

/* ─── Orkay Solution ─── */

export const solutionPage = {
  kicker: 'Orkay Solution',
  title: 'What a factory\ncan do that a\ntrader cannot',
  lede: 'Six ways buyers work with us. Each one depends on owning the line — a trading intermediary can quote them, but cannot run them.',
  offerings: [
    { title: 'OEM & private label', desc: 'Your brand on the box, your reference on the face. Artwork, carton design and shade approval handled before the run starts, on our own lines.' },
    { title: 'Mixed container loads', desc: 'Multiple sizes, finishes and ranges consolidated into one container, so a distributor can stock a full offer without committing to a container per SKU.' },
    { title: 'Project supply', desc: 'Single-batch quantities held for a project so the lobby, the corridors and the last floor all come from the same firing.' },
    { title: 'Reference matching', desc: 'Send the tile you already sell — or a photograph of it — and we will run the closest body and face we can press. Over 4,000 designs already exist to start from.' },
    { title: 'Export documentation', desc: 'Invoice, packing list, certificate of origin, CE and ISO paperwork issued from Morbi with the container, under our own IEC.' },
    { title: 'Dealer support', desc: 'Sample boards, display racks, territory protection and a named contact for every market. Covered in full on the dealer programme page.' },
  ] as Item[],
  applications: [
    { title: 'Facade', desc: 'Large-format slabs on ventilated and adhered facades, colour-stable through sun and rain.', img: '/img/light_facade.jpg', alt: 'Building facade clad in large-format ORKAY porcelain' },
    { title: 'Lobby & commercial floor', desc: 'Polished vitrified porcelain that holds its gloss under trolley wheels and cleaning machines.', img: '/img/cr_lobby.jpg', alt: 'Hotel lobby floored in polished large-format ORKAY vitrified porcelain' },
    { title: 'Bathroom & wet area', desc: 'Matched wall and floor bodies, with anti-skid options where water sits.', img: '/img/gal_bath.jpg', alt: 'Bathroom in dark stone-look ORKAY porcelain' },
    { title: 'Kitchen & counter', desc: 'Non-porous slab tops cut from the same body as the floor, so a room runs one material.', img: '/img/life_kitchen.jpg', alt: 'Kitchen with an ORKAY porcelain slab counter top' },
    { title: 'Outdoor & terrace', desc: 'Anti-skid matt bodies rated for frost, sun and standing water.', img: '/img/life_outdoor.jpg', alt: 'Terrace paved in anti-skid ORKAY outdoor porcelain' },
    { title: 'Parking & driveway', desc: 'Heavy-duty 400×400 bodies built for vehicle loads and constant abrasion.', img: '/img/fmt_parking.png', alt: 'Driveway laid in heavy-duty ORKAY parking tiles' },
  ],
};

/* ─── Dealer support programme ─── */

export const dealerPage = {
  kicker: 'Dealer programme',
  title: 'Stock a factory,\nnot a middleman',
  lede: 'Orkay appoints dealers directly on a One District, One Dealer model: one appointed dealer per district, factory pricing, and a named person in Morbi who answers when you call.',
  benefits: [
    { title: 'One District, One Dealer', desc: 'One appointed dealer per district — no second appointment in your catchment. Availability is checked at district level before an application proceeds, and the territory is recorded in the signed agreement.' },
    { title: 'Sample boards & display racks', desc: 'Physical display support, so a showroom can present the full range without holding the full range in stock.' },
    { title: 'Factory pricing', desc: 'You buy from the line that fired the tile. No trading margin sits between the kiln and your invoice.' },
    { title: 'Priority on batch holds', desc: 'Project quantities reserved from a single firing, so a dealer can commit to a specification with confidence.' },
    { title: 'A named contact', desc: 'One person in Morbi accountable for your account — not a shared inbox, not a rotating desk.' },
    { title: 'Marketing assets', desc: 'Range photography, spec sheets and catalogue files supplied for your own campaigns and showroom use.' },
  ] as Item[],
  steps: [
    { n: '01', title: 'Apply online', desc: 'A structured application: firm details, the district you intend to serve, ranges currently carried and expected monthly volume. The district is checked for an existing appointment before the application proceeds.' },
    { n: '02', title: 'Verification', desc: 'KYC and document check, then internal approval of the territory by the Orkay team.' },
    { n: '03', title: 'Digital signature', desc: 'The dealer agreement is signed with a Digio Aadhaar-OTP e-signature — legally valid under the IT Act, 2000, with a full audit trail.' },
    { n: '04', title: 'Dealer code issued', desc: 'A unique dealer code is generated automatically on completion, and the account goes live for ordering.' },
  ] as Step[],
};

/* ─── digiO — paperless dealer onboarding ─── */

export const digioPage = {
  kicker: 'digiO',
  title: 'Paperless\ndealer onboarding',
  lede: 'Apply, verify, sign and receive a dealer code without printing a page. Signatures are captured through Digio using Aadhaar OTP, so the agreement is legally binding and fully auditable from the moment it is signed.',
  legal: [
    { label: 'Signature type', value: 'Aadhaar OTP electronic signature, captured via Digio' },
    { label: 'Legal standing', value: 'Valid under the Information Technology Act, 2000' },
    { label: 'Audit trail', value: 'Who signed, when, and from where — retained against the executed agreement' },
    { label: 'Identity check', value: 'KYC and document verification before the agreement is issued' },
    { label: 'Dealer code', value: 'Unique code generated automatically once onboarding completes' },
    { label: 'Data controller', value: 'Orkay Tiles — enquiry, dealer and KYC data is held by Orkay' },
  ] as Fact[],
  needs: [
    { title: 'Firm documents', desc: 'Registration or incorporation proof, GST certificate and PAN for the applying entity.' },
    { title: 'Aadhaar-linked mobile', desc: 'The signatory must be able to receive the Aadhaar OTP on their registered mobile number.' },
    { title: 'Territory detail', desc: 'The catchment you intend to serve, plus the ranges you currently carry.' },
    { title: 'Bank reference', desc: 'Required only where credit terms are being requested at onboarding.' },
  ] as Item[],
};

/* ─── Corporate & Career ─── */

export const corporatePage = {
  kicker: 'Corporate & careers',
  title: 'Thirty years\nof people who\nfire tile',
  lede: 'Seven units do not run themselves. Production, quality, export documentation, design and dealer support are all held in Morbi by people who have done it for a long time.',
  values: [
    { title: 'Answer for the batch', desc: 'Every tile that leaves the yard carries our name and our IEC. Nobody here passes a defect down the line and calls it somebody else’s problem.' },
    { title: 'Measure, then claim', desc: 'Certificates, capacity and figures are published with numbers and dates a buyer can verify. We do not round them upward.' },
    { title: 'Own the line', desc: 'We manufacture rather than source. It is the harder business, and it is the one that lets us promise a shade will match across a project.' },
  ] as Item[],
  /* No live vacancies supplied yet, so the page invites open applications
     instead of listing roles that do not exist. */
  roles: [] as Item[],
  functions: [
    { title: 'Production & kiln operations', desc: 'Press, glaze line, kiln and polishing across seven units.' },
    { title: 'Quality control', desc: 'The five-stage inspection process, from raw body to pre-shipment release.' },
    { title: 'Export & documentation', desc: 'Freight coordination, certificates of origin and buyer paperwork.' },
    { title: 'Design studio', desc: 'Surface design and reference matching across a catalogue of 4,000+ designs.' },
    { title: 'Dealer & account support', desc: 'Territory management, sample boards and the named-contact model.' },
  ] as Item[],
};

/* ─── Testimonials ─── */

export type Review = {
  body: string;
  who: string;
  where: string;
  stars?: number;
};

/* DELIBERATELY EMPTY. Customer testimonials cannot be drafted on Orkay's behalf:
   a written review is a statement attributed to a real third party, and the
   quotation makes Orkay responsible for every claim published on the site.
   Orkay supplies these with written permission from each buyer. Until then the
   page renders an honest empty state rather than invented praise. */
export const reviews: Review[] = [];

export const testimonialPage = {
  kicker: 'Testimonials',
  title: 'What buyers say,\nin their own words',
  lede: 'Reviews are published here verbatim, with the buyer’s market and their permission. We do not write them on anyone’s behalf.',
  proofPoints: [
    { title: '40+ markets', desc: 'Containers leaving Morbi for importers and distributors in more than forty countries.' },
    { title: '30 years', desc: 'Manufacturing continuously since 1996 — long enough for repeat buyers to be the norm.' },
    { title: 'Audited quality', desc: 'ISO 9001:2015 and CE, with certificate numbers published for verification.' },
  ] as Item[],
};

/* ─── Digital visualisation ─── */

/* A floor quad in normalised image coordinates, corners ordered
   top-left, top-right, bottom-right, bottom-left. These are starting
   estimates — the page ships a corner-drag editor so each room can be
   tuned against the real photograph and the numbers pasted back here. */
export type Quad = [number, number][];

export type Room = { name: string; img: string; alt: string; quad: Quad };

export const vizRooms: Room[] = [
  {
    name: 'Hotel lobby',
    img: '/img/gal_lobby.jpg',
    alt: 'Hotel lobby with a polished porcelain floor',
    quad: [[0.30, 0.72], [0.72, 0.72], [1.02, 1.02], [-0.02, 1.02]],
  },
  {
    name: 'Living room',
    img: '/img/life_living.png',
    alt: 'Living room with a large-format porcelain floor',
    quad: [[0.30, 0.74], [0.72, 0.74], [1.02, 1.02], [-0.02, 1.02]],
  },
  {
    name: 'Kitchen',
    img: '/img/life_kitchen.jpg',
    alt: 'Kitchen with a porcelain floor and slab counter',
    quad: [[0.30, 0.76], [0.72, 0.76], [1.02, 1.02], [-0.02, 1.02]],
  },
  {
    name: 'Bathroom',
    img: '/img/gal_bath.jpg',
    alt: 'Bathroom floored in stone-look vitrified porcelain',
    quad: [[0.30, 0.74], [0.72, 0.74], [1.02, 1.02], [-0.02, 1.02]],
  },
  {
    name: 'Terrace',
    img: '/img/life_outdoor.jpg',
    alt: 'Outdoor terrace paved in anti-skid porcelain',
    quad: [[0.26, 0.70], [0.76, 0.70], [1.02, 1.02], [-0.02, 1.02]],
  },
];

export type VizTile = { name: string; meta: string; img: string };

export const vizTiles: VizTile[] = [
  { name: 'Statuario', meta: 'Glossy · marble look', img: '/img/slab_realistik.jpg' },
  { name: 'Nero Veined', meta: 'Glossy · dark marble', img: '/img/slab_nero_veined.jpg' },
  { name: 'Travertino', meta: 'Matt · stone look', img: '/img/slab_travertino.jpg' },
  { name: 'Polar', meta: 'Matt · light stone', img: '/img/slab_polar.jpg' },
  { name: 'Armani', meta: 'Glossy · grey marble', img: '/img/slab_armani.jpg' },
  { name: 'Aura', meta: 'Glossy · veined', img: '/img/slab_aura.jpg' },
  { name: 'Nero', meta: 'Matt · black body', img: '/img/slab_nero.jpg' },
];

export const vizPage = {
  kicker: 'Digital visualisation',
  title: 'See the floor\nbefore the\ncontainer sails',
  lede: 'Pick a room, drop an ORKAY surface into it, and judge the shade at room scale rather than off a 100mm sample. The tile is mapped into the floor in true perspective and blended with the room\u2019s own light.',
};

/* ─── site navigation ───────────────────────────────────────────────
   One source of truth for every internal destination. The header menu,
   the sub-page nav and the footer all read from here, so a route can
   never exist without a way to reach it. */

export type NavLink = { label: string; href: string };

export const nav = {
  /* the fullscreen menu and the sub-page bar */
  primary: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Products', href: '/products' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Visualiser', href: '/visualizer' },
    { label: 'Downloads', href: '/downloads' },
    { label: 'Dealers', href: '/dealers' },
    { label: 'Contact', href: '/contact' },
  ] as NavLink[],

  /* footer column one */
  explore: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Orkay Solution', href: '/solutions' },
    { label: 'Digital Visualisation', href: '/visualizer' },
    { label: 'Careers', href: '/about#careers' },
  ] as NavLink[],

  /* footer column two — deep links into the six ranges */
  ranges: [
    { label: 'Vitrified Porcelain Tiles', href: '/products#vitrified-porcelain-tiles' },
    { label: 'Porcelain Slab Tiles', href: '/products#porcelain-slab-tiles' },
    { label: 'Ceramic Tiles', href: '/products#ceramic-tiles' },
    { label: 'Outdoor Tiles', href: '/products#outdoor-tiles' },
  ] as NavLink[],

  /* footer column three */
  trade: [
    { label: 'Downloads', href: '/downloads' },
    { label: 'Dealer Programme', href: '/dealers' },
    { label: 'digiO Onboarding', href: '/dealer-onboarding' },
    { label: 'Packing Details', href: '/downloads#packing' },
    { label: 'Certifications', href: '/about#certifications' },
  ] as NavLink[],
};


/* ─── Legal pages (CR §7 L-01…L-05) ───────────────────────────────────
   Standard templates, flagged as drafts: the quotation (Stage G 6.6) includes
   standard policy templates with client approval, and CR Q-08 places the
   drafting itself with Orkay. Nothing here is legal advice. */

export type LegalSection = { h: string; p: string[] };
export type LegalPage = { slug: string; title: string; summary: string; updated: string; sections: LegalSection[] };

const ENTITY = 'Orkay Tiles ("Orkay", "we", "us"), a partnership firm with its registered office at Shop No. 62, 63, 64, Shakti Chamber-1, 8A National Highway, Morbi-363642, Gujarat, India';

export const legalPages: LegalPage[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'What we collect through forms, WhatsApp, RCS and analytics, how long we keep it, and how to ask for it to be deleted.',
    updated: 'Draft — 22 August 2026',
    sections: [
      { h: 'Who we are', p: [`${ENTITY}, is the data controller for personal data collected through orkaytiles.com and its enquiry channels.`] },
      { h: 'What we collect', p: ['Enquiry and dealer application forms: name, company, email, phone, country or district, the message you send, and your consent choices with a timestamp.', 'Messaging: if you contact us or opt in on WhatsApp Business or Google RCS Business Messaging, the number you use and the conversation.', 'Analytics: if you accept analytics cookies, page views and interactions collected by Google Analytics 4 in aggregated form. No analytics run before you accept.'] },
      { h: 'Why we use it', p: ['To answer your enquiry, prepare a quotation, process a dealer application (including KYC and the e-Sign agreement), and — only where you opt in — to send you new launches and offers.', 'The legal basis is your consent for marketing and analytics, and our legitimate interest in responding to a business enquiry you initiated.'] },
      { h: 'Where it goes', p: ['Enquiries are routed to our CRM (GoHighLevel) and to our export and dealer desks. Dealer onboarding signatures are processed by Digio under its own terms. We do not sell personal data.'] },
      { h: 'How long we keep it', p: ['Enquiries: 24 months from last contact. Dealer agreements and KYC: for the life of the agreement plus the period required by Indian law. Analytics: per the cookie durations on the Cookie Policy page.'] },
      { h: 'Your rights', p: ['You can ask for a copy of your data, a correction, or deletion, and withdraw consent at any time by writing to info@orkaytiles.com. We answer within 30 days. Indian residents have the rights set out in the Digital Personal Data Protection Act, 2023; EU/UK visitors have the rights set out in the GDPR / UK GDPR.'] },
      { h: 'Changes', p: ['We will post any change to this policy on this page with a new date.'] },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    summary: 'The cookies this site sets, what each one is for, how long it lasts, and how to change your choice.',
    updated: 'Draft — 22 August 2026',
    sections: [
      { h: 'Necessary', p: ['orkay-consent — stores your cookie choice so we do not ask again. 12 months. Cannot be switched off because it records the choice itself.'] },
      { h: 'Analytics (off until you accept)', p: ['_ga, _ga_* — Google Analytics 4, used to count visits and see which pages are read. Up to 24 months. Set only after you accept analytics.'] },
      { h: 'Chat', p: ['If you open the chat widget, its provider (LeadConnector) sets cookies to keep the conversation open across pages. Set only when you start a chat.'] },
      { h: 'Changing your choice', p: ['Use "Cookie settings" in the footer at any time to accept or reject analytics. Clearing your browser storage also resets the choice.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms and Conditions',
    summary: 'Use of this site, ownership of its content and imagery, how products are represented, and the limits of our liability.',
    updated: 'Draft — 22 August 2026',
    sections: [
      { h: 'Use of the site', p: [`This site is published by ${ENTITY}. By using it you accept these terms.`] },
      { h: 'Intellectual property and imagery', p: ['The ORKAY name and mark, the site design, copy, photography and renders are owned by or licensed to Orkay Tiles. They may not be reproduced without written permission. Room scenes are representative and do not depict a specific installation unless stated.'] },
      { h: 'Product representation', p: ['Tile shade, pattern and finish vary between production batches and between a screen and a fired product. Dimensions are nominal. Always approve a physical sample, and order the full quantity for a project from one batch.'] },
      { h: 'Quotations and orders', p: ['Nothing on this site is an offer. Quotations, minimum quantities, lead times and terms of sale are confirmed in writing per order.'] },
      { h: 'Limitation of liability', p: ['To the extent permitted by law, Orkay Tiles is not liable for indirect or consequential loss arising from use of this site or reliance on its content. The site is provided as is.'] },
      { h: 'Governing law', p: ['These terms are governed by the laws of India. The courts of Morbi, Gujarat have jurisdiction.'] },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    summary: 'Colour and shade on screen versus the fired tile, batch variation, and representative imagery.',
    updated: 'Draft — 22 August 2026',
    sections: [
      { h: 'Screen versus product', p: ['Colour and shade on this site depend on your screen and are not a substitute for a physical sample. The digital visualiser is a judgement aid, not a proof.'] },
      { h: 'Batch variation', p: ['Vitrified porcelain and ceramic tiles vary in shade, calibre and pattern between batches. Orkay shade-maps each batch; order a project from one batch and check tiles before laying.'] },
      { h: 'Imagery', p: ['Room scenes and renders are representative of the range and may show sizes or layouts other than the one you order. Confirm sizes against the product pages and the packing data.'] },
      { h: 'Figures', p: ['Capacity, unit counts and certificate details are published by Orkay Tiles and updated when they change. Certificate numbers can be verified with the issuing bodies.'] },
    ],
  },
];

/* Messaging consent language captured at the form (CR L-05). The text is
   stored with the timestamp so the record shows what was agreed to. */
export const consentText = {
  contact: 'I agree that Orkay Tiles may contact me by email, phone and WhatsApp about this enquiry.',
  marketing: 'I would also like to receive new launches and offers from Orkay Tiles by WhatsApp Business and Google RCS. I can opt out at any time by replying STOP or emailing info@orkaytiles.com.',
};
