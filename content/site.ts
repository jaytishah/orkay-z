/* CMS SEAM: every headline, caption and number the homepage renders.
   All figures verified against the Orkay fact library. */

export const formats = [
  { size: '600×1200', v: 1200, h: 600, desc: 'Large-format vitrified slabs · Glossy / Matt · Floors, walls and facades', img: '/img/fmt_600x1200.png', alt: 'Woman in black crossing a terrace paved in 600 by 1200 grey stone-look slabs, concrete villa behind her at dusk' },
  { size: '600×600', v: 600, h: 600, desc: 'Vitrified double-charge floor tiles · Glossy / Matt · Residential and commercial floors', img: '/img/fmt_600x600.png', alt: 'Black marble-look vitrified slab stood on a salt flat between white horses' },
  { size: '300×450', v: 450, h: 300, desc: 'Ceramic wall tiles · Glossy / Carving · Bathrooms and kitchens', img: '/img/fmt_300x450.png', alt: 'Stone-look tiled stair treads and risers, a woman stepping up past a glass balustrade' },
  { size: '400×400', v: 400, h: 400, desc: 'Heavy-duty parking tiles · Matt anti-skid · Driveways, terraces and outdoors', img: '/img/fmt_parking.png', alt: '400 by 400 heavy-duty outdoor tiles installed' },
];

/* The six categories we manufacture — mirrors the ranges on orkaytiles.com */
export const tileTypes = [
  { title: 'Porcelain\nTiles', desc: 'Full-body and double-charge vitrified, pressed dense and fired to near-zero porosity. Floors, walls, wet areas — one body that takes traffic, water and cleaning chemicals without changing.', img: '/img/type_porcelain.png', alt: 'Man leaning on a beige marble-look porcelain wall beside brown veined slabs' },
  { title: 'Porcelain\nSlabs', desc: 'Large format up to 600×1200 and beyond, for floors, feature walls and facades. Fewer joints across a space, and a vein that runs on from one slab to the next.', img: '/img/type_slabs.png', alt: 'Lit corridor floored in polished large-format marble-look porcelain slabs' },
  { title: 'Ceramic\nWall Tiles', desc: 'Glossy, matt and carved faces for kitchens, bathrooms and backsplashes. Light bodies made to be cut and set fast on a wall, in shades that match the floor they meet.', img: '/img/type_ceramic.png', alt: 'Hotel lobby walled in stone-look tile, a guest crossing the polished floor' },
  { title: 'Wooden\nPlank', desc: 'Plank formats printed with real timber grain, then fired. The look of oak or walnut with none of the sealing, swelling or refinishing — and it takes a wet floor.', img: '/img/life_gym.png', alt: 'Wood-look porcelain plank flooring' },
  { title: 'Counter\nTops', desc: 'Non-porous, heat- and stain-resistant surfaces for islands, vanities and worktops. Nothing to seal each year, and the pattern is fired in, so acid and oil do not mark it.', img: '/img/type_countertop.png', alt: 'Grey stone-look porcelain slab stood in a mirrored studio, a man beside it for scale' },
  { title: 'Outdoor\nTiles', desc: 'Anti-skid matt bodies for terraces, driveways, platforms and parking decks. Rated for frost, sun and standing water — the finish stays the same through the seasons.', img: '/img/type_outdoor.png', alt: 'Station platform floored in dark marble-look ORKAY porcelain at sunrise' },
];

/* Arrow-driven carousel under the infrastructure plate */
export const facilities = [
  {
    title: 'Restaurant\nand bar',
    desc: 'Front-of-house floors take the traffic of a full service every night. Full-body vitrified keeps its polish where a stone floor would have dulled and been ground back twice.',
    img: '/img/gal_commercial.jpg', alt: 'Restaurant floored in ORKAY stone-look porcelain',
  },
  {
    title: 'Private\ndining',
    desc: 'Warm travertine-look slabs, matt finished so candlelight sits on the surface instead of glaring off it. Same batch from the entrance through to the private room.',
    img: '/img/app_interior_warm.jpg', alt: 'Private dining room floored in travertine-look porcelain',
  },
  {
    title: 'Hotel\nlobby',
    desc: 'The format that leaves the fewest joints in a space people walk across all day — and a surface that survives trolley wheels, grit and cleaning chemicals.',
    img: '/img/gal_lobby.jpg', alt: 'Hotel lobby clad in ORKAY marble-look slabs',
  },
];

/* Scroll-driven carousel of finished spaces — one photo per step */
export const spaces = [
  {
    name: 'Lobby',
    desc: 'Double-height entrances take the largest formats we run. Fewer joints across the floor, one continuous vein up the feature wall, and a polish that survives the traffic of a commercial entrance.',
    img: '/img/life_lobby.png', alt: 'Dark entrance hall floored and clad in charcoal marble-look ORKAY slabs',
  },
  {
    name: 'Living',
    desc: 'A book-matched fireplace wall in marble-look porcelain: the pattern is printed to the slab, so it never fades, never needs sealing, and repeats exactly on the reorder.',
    img: '/img/life_living.png', alt: 'Living room floored in polished brown marble-look ORKAY porcelain, a horse sculpture on the feature wall',
  },
  {
    name: 'Kitchen',
    desc: 'Dark full-body vitrified for the island and the splashback. Heat, oil and acid do nothing to a fired surface — the counter looks the same after ten years of cooking.',
    img: '/img/life_kitchen.jpg', alt: 'Dark kitchen with a black marble-look porcelain island and splashback, grey stone-look floor',
  },
  {
    name: 'Bath',
    desc: 'Matt and anti-skid finishes rated to AS/NZS 4586, so the floor stays safe wet. The same body, same batch, same shade as the wall it meets.',
    img: '/img/gal_bath.jpg', alt: 'Bathroom in stone-look porcelain',
  },
  {
    name: 'Gym',
    desc: 'Wood-look porcelain takes dropped plates and sweat the way timber never could. Matt, anti-skid, and unaffected by the disinfectant a gym floor is cleaned with every night.',
    img: '/img/life_gym.png', alt: 'Home gym floored in wood-look ORKAY porcelain, rack and bench against a stone-look wall',
  },
];

/* What sits inside the Morbi campus — the LOCATION strip under the hero */
export const nearby = [
  { title: 'Showroom', meta: 'On campus', img: '/img/design_studio.png', alt: 'Buyers reviewing full slabs with the ORKAY team in the campus showroom' },
  { title: 'Seven units', meta: 'One standard', img: '/img/seven_units.png', alt: 'ORKAY production campus lit at dusk, long concrete facade above a porcelain-paved approach' },
  { title: 'Design studio', meta: '1,000+ designs', img: '/img/design_studio_hall.png', alt: 'Decoration line running patterned and plain tiles side by side' },
  { title: 'Loading yard', meta: 'FCL on site', img: '/img/advantage_yard.jpg', alt: 'Crated slabs in the dispatch yard' },
  { title: 'Mundra port', meta: '3 hours away', img: '/img/mundra_port.png', alt: 'Crated ORKAY slabs on pallets at Mundra port at sunrise, a container ship loading behind them' },
];

/* Growth milestones, verbatim from orkaytiles.com/about-us — one card per
   step up in daily output. Figures are the company's own published ones.
   Numerals kept in international format: this site reads outside India. */
export const services = [
  { name: '1996 · 5,000 sq.m a day', desc: 'Late Shri Avcharbhai Patel fires the first ORKAY tile in Morbi. One line, one shift, and a standard set higher than the town was asking for.', img: '/img/milestone_1996_store.png', alt: 'Lit ORKAY Tiles showroom facade at night, gold-lettered sign above glass-block windows' },
  { name: '2008 · 15,000 sq.m a day', desc: 'Output trebles in twelve years, and the first containers leave for buyers who had never heard of Morbi.', img: '/img/milestone_2008.png', alt: 'Woman in gold crossing a lobby walled and floored in beige stone-look ORKAY porcelain' },
  { name: '2013 · 35,000 sq.m a day', desc: 'Digital printing arrives on the line. A thousand faces become possible where a handful of screens used to decide the whole range.', img: '/img/milestone_2013.png', alt: 'Living room floored in polished grey marble-look ORKAY porcelain, a lit fireplace along the far wall' },
  { name: '2016 · 65,000 sq.m a day', desc: 'Glazed and double-charge vitrified run side by side, shade-mapped batch by batch, so a reorder still matches the floor already laid.', img: '/img/milestone_2016.png', alt: 'White statuario-look ORKAY porcelain slab stood on red velvet beneath a crystal chandelier' },
  { name: '2019 · 85,000 sq.m a day', desc: 'Capacity built for the export book: CE marking, ISO 9001:2015 systems, and our own IEC on every shipment that leaves the yard.', img: '/img/milestone_2019.png', alt: 'Barefoot woman in black crossing a candlelit hall floored in polished marble-look ORKAY porcelain' },
  { name: '2020 · 100,000 sq.m a day', desc: 'Porcelain slabs join the range — large format to 1200×2400, and a scale that puts ORKAY among the largest lines in the town that fires most of India’s porcelain.', img: '/img/statement_slabs.png', alt: 'Large-format ORKAY porcelain slabs stood in the yard' },
];

export const stats = [
  { value: 1996, display: '1996', label: 'Manufacturing since' },
  { value: 16000, display: '16,000', label: 'sq.m produced daily' },
  { value: 40, display: '40+', label: 'Export countries' },
  { value: 4000, display: '4,000+', label: 'Designs in range' },
];

export const dayCycle = [
  { time: '07:00', img: '/img/day_0700.jpg' },
  { time: '13:00', img: '/img/day_1300.jpg' },
  { time: '19:00', img: '/img/day_1900.jpg' },
  { time: '23:00', img: '/img/day_2300.jpg' },
];

export const gallery = [
  { img: '/img/gal_terrace.jpg', alt: 'Villa terrace and poolside paved in patterned ORKAY outdoor tiles', title: 'Terrace\n& Poolside', desc: 'Matt anti-skid outdoor tiles. The pattern holds true across the run — laid wet or dry, the grip stays.' },
  { img: '/img/gal_lobby.jpg', alt: 'Hotel lobby in dark marble-look ORKAY slabs with brass and oak', title: 'Hotel\nLobby', desc: 'Dark marble-look vitrified slabs, polished. Warmed by oak and brass, and polished to hold its mirror for decades.' },
  { img: '/img/gal_residential.jpg', alt: 'Family living room floored in warm beige ORKAY vitrified tiles', title: 'Residential\nFloors', desc: '600×600 double-charge vitrified. Shade-mapped per batch, so next year’s reorder matches today’s floor.' },
  { img: '/img/gal_bath.jpg', alt: 'Spa bathroom in stone-look ORKAY wall and floor tiles', title: 'Stone\nBathroom', desc: 'Stone-look ceramic on the wall, matching porcelain underfoot. Low porosity, zero staining, built for daily water.' },
  { img: '/img/gal_commercial.jpg', alt: 'Restaurant interior floored in large-format ORKAY porcelain', title: 'Hospitality\nFloors', desc: 'Full-body porcelain rated for continuous footfall. Dense, inert, and unchanged after thirty years of service.' },
  { img: '/img/gal_largeformat.jpg', alt: 'Open-plan kitchen with 600 by 1200 ORKAY slabs', title: 'Large-Format\nLiving', desc: '600×1200 slabs with joints you have to look for. Fewer lines on the floor, a room that reads larger than it is.' },
  { img: '/img/gal_goldenhour.jpg', alt: 'Living room at golden hour on travertine-look ORKAY porcelain', title: 'Golden\nHour', desc: 'A surface is only as good as its worst light. This one keeps its depth from first sun to last lamp.' },
  { img: '/img/gal_statuario.jpg', alt: 'Bright interior floored in statuario marble-look ORKAY slabs', title: 'Statuario\nWhite', desc: 'Marble-look statuario in large format. The vein runs continuous, edge to edge, across every slab in the crate.' },
];

export const site = {
  name: 'ORKAY Tiles International',
  tagline: 'Crafted in Morbi. Designed for the World.',
  since: 'Since 1996 — Morbi, Gujarat, India',
  email: 'info@orkaytiles.com',
  certs: 'CE Certified · ISO 9001:2015 · IEC Registered Exporter',
  location: 'Morbi · Gujarat · India',
  /* set to '/video/hero_720p.mp4' to run the cinematic hero; null uses the still */
  /* Seedance 2.0 4K master lives in "AI generated content/"; this is its web encode */
  heroVideo: null as string | null,
  heroImage: '/img/hero_interior.jpg',
  /* closing film — same seam as the hero: null falls back to the poster still */
  exhibitionVideo: '/video/exhibition_720p.mp4' as string | null,
  exhibitionPoster: '/img/exhibition_poster.jpg',
};

/* The six product categories ORKAY publishes on orkaytiles.com. */
export const products = [
  { name: 'Porcelain Tiles', meta: 'GVT · PGVT · Double charge', desc: 'Glazed and double-charged vitrified tiles from 400×400 to 600×1200. Dense, low-porosity bodies for floors that take traffic.' },
  { name: 'Porcelain Slab Tiles', meta: '800×1600 to 1200×2400', desc: 'Panoramic slabs for floors, walls, facades and book-matched features. The fewest joints a surface can have.' },
  { name: 'Ceramic Tiles', meta: '200×375 to 300×900', desc: 'Digital ceramic wall tiles in glossy, matt and carved finishes. Built for bathrooms, kitchens and feature walls.' },
  { name: 'Wooden Plank', meta: 'Matt · Carving · Relief punch', desc: 'Timber-look porcelain planks — Birchwood, Alpine, Aston and Bosco ranges. The grain of wood with the life of porcelain.' },
  { name: 'Counter Tops', meta: 'Slab-cut surfaces', desc: 'Full-slab kitchen and vanity tops cut from the same bodies as the floor, so a room can run one material throughout.' },
  { name: 'Outdoor Tiles', meta: 'Matt anti-skid', desc: 'Heavy-duty parking, driveway and terrace tiles. Anti-skid rated, frost stable, and unchanged by weather.' },
];

/* Container-load data published on orkaytiles.com/packing-details.
   Importers plan shipments off these numbers — do not round them. */
export const packing = [
  {
    body: 'Ceramic Wall Tiles',
    rows: [
      { size: '200×600', thick: '9', box: '6', sqm: '0.72', kg: '10.30', sqmC: '1,843.20' },
      { size: '200×375', thick: '6.80', box: '8', sqm: '0.75', kg: '9', sqmC: '2,268.00' },
      { size: '250×400', thick: '7', box: '10', sqm: '1.00', kg: '12', sqmC: '2,240.00' },
      { size: '250×750', thick: '9', box: '5', sqm: '0.94', kg: '15', sqmC: '1,658.16' },
      { size: '300×450', thick: '8', box: '6', sqm: '0.81', kg: '11', sqmC: '2,012.04' },
      { size: '300×600', thick: '9.50', box: '5', sqm: '0.90', kg: '14.90', sqmC: '1,782.00' },
      { size: '300×900', thick: '11.20', box: '4', sqm: '1.08', kg: '19.50', sqmC: '1,490.40' },
    ],
  },
  {
    body: 'Porcelain Tiles · GVT / PGVT',
    rows: [
      { size: '400×400', thick: '10', box: '5', sqm: '0.80', kg: '17', sqmC: '1,276.80' },
      { size: '600×600', thick: '9', box: '4', sqm: '1.44', kg: '28', sqmC: '1,382.40' },
      { size: '800×800', thick: '11', box: '3', sqm: '1.92', kg: '49', sqmC: '998.40' },
      { size: '600×1200', thick: '9', box: '2', sqm: '1.44', kg: '31', sqmC: '1,267.20' },
    ],
  },
  {
    body: 'Porcelain Slabs',
    rows: [
      { size: '800×1600', thick: '9', box: '2', sqm: '2.56', kg: '53', sqmC: '1,290.24' },
      { size: '1200×1200', thick: '9', box: '2', sqm: '2.88', kg: '61', sqmC: '1,140.48' },
      { size: '900×1800', thick: '9', box: '2', sqm: '3.24', kg: '65', sqmC: '—' },
      { size: '1200×2400', thick: '9', box: '1', sqm: '2.88', kg: '61', sqmC: '604.80' },
    ],
  },
];

export const contact = {
  address: 'Corporate Office · 62/63/64, Shakti Chamber-1,\n8A National Highway, Morbi-363642, Gujarat, India',
  exportPhone: '+91 97120 54222',
  domesticPhone: '+91 98246 54222',
  whatsapp: '919712054222',
  email: 'info@orkaytiles.com',
  socials: [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/orkay-tiles/' },
    { name: 'Instagram', href: 'https://www.instagram.com/orkay_tiles/' },
    { name: 'Facebook', href: 'https://www.facebook.com/orkaytiles' },
    { name: 'YouTube', href: 'https://www.youtube.com/@orkaytiles' },
  ],
};

/* Direct Manufacturer Advantage — every line traceable to the approved
   campaign file in the orkay-tiles fact library. No unverified claims. */
export const advantage = [
  { label: 'Own the line', desc: 'Seven production units in Morbi, 16,000 sq.m a day. The tile you order is pressed, fired and packed on equipment we own — not bought in and re-labelled.' },
  { label: 'Own the paperwork', desc: 'A registered Partnership manufacturer holding its own DGFT Importer-Exporter Code, AAAFO3244L. Your order does not route through someone else’s factory or someone else’s licence.' },
  { label: 'Own the standard', desc: 'ISO 9001:2015 certified and CE compliant under EU CPR 305/2011. The same certificates cover the floor you specify and the container it ships in.' },
  { label: 'Own the outcome', desc: 'Five quality gates between raw material and released shipment: pre-production control, in-process inspection, pre-packing checks, packing and pallet verification, pre-shipment release approval.' },
];
