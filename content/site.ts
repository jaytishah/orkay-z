/* CMS SEAM: every headline, caption and number the homepage renders.
   Figures follow the client Change Request Rev 1 (20 Aug 2026): capacity
   60,000 sq m/day, the Section 4 timeline, "Vitrified Porcelain Tiles" as the
   single approved term, Double-Charge and Wooden Plank removed. */

/* Format selector — the buyer chooses a CATEGORY first, then sees every size
   in it (CR S-18). `v`/`h` drive the plan drawing for the hero size. `pending`
   marks a range Orkay has not finalised (CR Q-01 / P-03). */
export const formats = [
  {
    name: 'Vitrified Porcelain Tiles',
    sizes: ['600×600', '600×1200', '1000×1000', '1200×1200', '1200×1800'],
    v: 1200, h: 600,
    desc: 'Dense, low-porosity vitrified porcelain for floors, walls and facades · Glossy / Matt',
    img: '/img/fmt_600x1200.png',
    alt: 'Woman in black crossing a terrace paved in grey stone-look vitrified porcelain tiles, concrete villa behind her at dusk',
  },
  {
    name: 'Porcelain Slab Tiles',
    sizes: ['800×2400', '800×3000', '1200×1800'],
    v: 2400, h: 800,
    desc: 'Panoramic slabs for floors, feature walls and facades — and counter tops cut from the same slab',
    img: '/img/type_slabs.png',
    alt: 'Lit corridor floored in polished large-format marble-look vitrified porcelain slabs',
  },
  {
    name: 'Ceramic Tiles',
    sizes: ['300×450', '300×600'],
    pending: true,
    v: 450, h: 300,
    desc: 'Wall and floor ceramic in glossy, matt and carved finishes · Full range being confirmed',
    img: '/img/fmt_300x450.png',
    alt: 'Stone-look tiled stair treads and risers, a woman stepping up past a glass balustrade',
  },
  {
    name: 'Outdoor Tiles',
    sizes: ['600×600'],
    pending: true,
    v: 600, h: 600,
    desc: 'Matt anti-skid bodies for terraces, platforms and driveways · Full anti-skid range being confirmed',
    img: '/img/cr_outdoor_platform.jpg',
    alt: 'Station platform laid in 600×600 matt anti-skid ORKAY outdoor tiles in a straight grid',
  },
];

/* The four categories we manufacture (CR §6). Counter tops sit inside
   Porcelain Slab Tiles as an application, not a category. */
export const tileTypes = [
  { title: 'Vitrified\nPorcelain Tiles', desc: 'Pressed dense and fired to near-zero porosity. Floors, walls, wet areas — one body that takes traffic, water and cleaning chemicals without changing. 600×600 to 1200×1800.', img: '/img/type_porcelain.png', alt: 'Man leaning on a beige marble-look vitrified porcelain wall beside brown veined slabs' },
  { title: 'Porcelain\nSlab Tiles', desc: 'Large format to 800×3000, for floors, feature walls, facades and counter tops. Fewer joints across a space, and a vein that runs on from one slab to the next.', img: '/img/type_slabs.png', alt: 'Lit corridor floored in polished large-format marble-look vitrified porcelain slabs' },
  { title: 'Ceramic\nTiles', desc: 'Glossy, matt and carved faces for kitchens, bathrooms and backsplashes, in wall and floor bodies. Light, made to be cut and set fast, in shades that match the floor they meet.', img: '/img/type_ceramic.png', alt: 'Hotel lobby walled in stone-look ceramic tile, a guest crossing the polished floor' },
  { title: 'Outdoor\nTiles', desc: 'Anti-skid matt bodies for terraces, driveways, platforms and parking decks. Rated for frost, sun and standing water — the finish stays the same through the seasons.', img: '/img/cr_outdoor_platform.jpg', alt: 'Station platform floored in 600×600 matt anti-skid ORKAY outdoor tiles, a bullet train at the edge at sunrise' },
];

/* Arrow-driven carousel under the infrastructure plate */
export const facilities = [
  {
    title: 'Restaurant\nand bar',
    desc: 'Front-of-house floors take the traffic of a full service every night. Full-body vitrified porcelain keeps its polish where a stone floor would have dulled and been ground back twice.',
    img: '/img/cr_restaurant.jpg', alt: 'Restaurant and bar floored in 600×1200 stone-look ORKAY vitrified porcelain, joints running straight to the bar',
  },
  {
    title: 'Private\ndining',
    desc: 'Warm travertine-look slabs, matt finished so candlelight sits on the surface instead of glaring off it. Same batch from the entrance through to the private room.',
    img: '/img/cr_private_dining.jpg', alt: 'Private dining room floored in matt travertine-look ORKAY vitrified porcelain slabs, candlelit',
  },
  {
    title: 'Hotel\nlobby',
    desc: 'The format that leaves the fewest joints in a space people walk across all day — and a surface that survives trolley wheels, grit and cleaning chemicals.',
    img: '/img/gal_lobby.jpg', alt: 'Hotel lobby clad in ORKAY marble-look slabs',
  },
];

/* Scroll-driven carousel of finished spaces — one photo per step.
   Lobby carries the reception / bathroom pair that used to be its own
   section (CR S-09a merge). */
export const spaces = [
  {
    name: 'Lobby',
    desc: 'Luxury is carried by the finishing material: printed into the vein of vitrified porcelain, held in a polish that survives thirty years of traffic, and repeated across every slab of the same batch — lobby wall to bathroom floor. Double-height entrances take the largest formats we run.',
    img: '/img/cr_lobby.jpg', alt: 'Double-height hotel lobby floored in 1200×1800 charcoal marble-look ORKAY vitrified porcelain, the same slab running up the feature wall',
    extra: [
      { img: '/img/lobby_dark.jpg', alt: 'Hotel reception clad in dark ORKAY marble-look slabs' },
      { img: '/img/bath_dark.jpg', alt: 'Bathroom in dark stone-look vitrified porcelain' },
    ],
  },
  {
    name: 'Living',
    desc: 'A book-matched fireplace wall in marble-look vitrified porcelain: the pattern is printed to the slab, so it never fades, never needs sealing, and repeats exactly on the reorder.',
    img: '/img/cr_living_bookmatch.jpg', alt: 'Living room with a book-matched marble-look ORKAY vitrified porcelain fireplace wall and a polished 1200×1200 floor',
  },
  {
    name: 'Kitchen',
    desc: 'Dark full-body vitrified porcelain for the island and the splashback. Heat, oil and acid do nothing to a fired surface — the counter looks the same after ten years of cooking.',
    img: '/img/life_kitchen.jpg', alt: 'Dark kitchen with a black marble-look vitrified porcelain slab island and splashback, grey stone-look floor',
  },
  {
    name: 'Bath',
    desc: 'Matt and anti-skid finishes rated to AS/NZS 4586, so the floor stays safe wet. The same body, same batch, same shade as the wall it meets.',
    img: '/img/gal_bath.jpg', alt: 'Bathroom in stone-look vitrified porcelain',
  },
];

/* What sits inside the Morbi campus — the LOCATION strip under the hero */
export const nearby = [
  { title: 'Showroom', meta: 'On campus', img: '/img/cr_showroom.jpg', alt: 'Full-size vitrified porcelain slabs on racks in the ORKAY campus showroom' },
  { title: 'Seven units', meta: 'One standard', img: '/img/cr_seven_units.jpg', alt: 'The seven ORKAY production units at dusk, a vitrified-porcelain-paved approach in front' },
  { title: 'Design studio', meta: '4,000+ designs', img: '/img/cr_design_studio.jpg', alt: 'The ORKAY design studio — surface designs on screen, full-size slab samples on racks' },
  { title: 'Loading yard', meta: 'FCL on site', img: '/img/advantage_yard.jpg', alt: 'Crated slabs in the dispatch yard' },
  { title: 'Mundra port', meta: '3 hours away', img: '/img/cr_mundra_port.jpg', alt: 'Crated ORKAY tile on pallets at Mundra port at sunrise, a container ship loading behind them' },
];

/* Manufacturing capacity timeline — the authoritative dataset from CR §4.
   Five fields per milestone; every figure is Orkay's own. Capacity today is
   the four active lines: 15,000 + 21,000 + 13,000 + 11,000 = 60,000 sq m/day. */
export const timeline = [
  { year: '1996', capacity: '500 sq m/day', product: 'Cement Mosaic Tiles', sizes: '—', tech: 'Company founded. First production line.', img: '/img/milestone_1996_store.png', alt: 'Lit ORKAY Tiles showroom facade at night, gold-lettered sign above glass-block windows' },
  { year: '2008', capacity: '6,000 sq m/day', product: 'Ceramic Tiles', sizes: '200×300 mm', tech: 'First ceramic tile plant.', img: '/img/milestone_2008.png', alt: 'Woman in gold crossing a lobby walled and floored in beige stone-look ORKAY tile' },
  { year: '2013', capacity: '12,000 sq m/day', product: 'Ceramic Floor Tiles', sizes: '250×375 mm', tech: 'Digital printing machinery introduced.', img: '/img/milestone_2013.png', alt: 'Living room floored in polished grey marble-look ORKAY tile, a lit fireplace along the far wall' },
  { year: '2016', capacity: '15,000 sq m/day', product: 'Ceramic Tiles', sizes: '300×450 mm, 300×600 mm (250×375 discontinued)', tech: 'Plant upgraded — Cretaprint Hybrid Printers (EFI) replace digital printing. Size change made on an identified future trend.', img: '/img/milestone_2016.png', alt: 'White statuario-look ORKAY slab stood on red velvet beneath a crystal chandelier' },
  { year: '2019', capacity: '21,000 sq m/day', product: 'Vitrified Porcelain Tiles', sizes: '600×600 mm, 600×1200 mm', tech: 'SACMI line + EFI Cretaprint technology.', img: '/img/milestone_2019.png', alt: 'Barefoot woman in black crossing a candlelit hall floored in polished marble-look ORKAY vitrified porcelain' },
  { year: '2023', capacity: '13,000 sq m/day', product: 'Vitrified Porcelain Tiles', sizes: '1000×1000 mm, 1200×1200 mm, 1200×1800 mm', tech: 'SACMI line + System digital printing machine.', img: '/img/cr_milestone_2023.jpg', alt: 'SACMI line producing 1200×1800 ORKAY vitrified porcelain slabs' },
  { year: '2024', capacity: 'Golden Carving Series', product: 'Golden Carving Series', sizes: '—', tech: 'First manufacturer in India to introduce this series. Solar-powered plant commissioned for green energy supply.', img: '/img/cr_milestone_2024.jpg', alt: 'Golden Carving series tile — raised carved pattern finished in gold lustre' },
  { year: '2025', capacity: '11,000 sq m/day', product: 'Porcelain Slab Tiles', sizes: '800×2400 mm, 800×3000 mm (counter tops); 1200×1800 mm (slab)', tech: 'CONTINUA+ system by SACMI — only 60–70 units in use worldwide.', img: '/img/cr_milestone_2025.jpg', alt: 'SACMI CONTINUA+ line producing 800×3000 ORKAY porcelain slab tiles' },
];

export const stats = [
  { value: 1996, display: '1996', label: 'Manufacturing since' },
  { value: 60000, display: '60,000', label: 'sq m produced daily' },
  { value: 40, display: '40+', label: 'Export countries' },
  { value: 4000, display: '4,000+', label: 'Designs in range' },
];

/* One surface, four lights. `label` is what makes the clock legible (CR S-10b). */
export const dayCycle = [
  { time: '07:00', label: 'Morning', img: '/img/day_0700.jpg' },
  { time: '13:00', label: 'Afternoon', img: '/img/day_1300.jpg' },
  { time: '19:00', label: 'Evening', img: '/img/day_1900.jpg' },
  { time: '23:00', label: 'Night', img: '/img/day_2300.jpg' },
];

export const site = {
  name: 'ORKAY Tiles',
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

/* The four product categories (CR §6). */
export const products = [
  { name: 'Vitrified Porcelain Tiles', meta: '600×600 · 600×1200 · 1000×1000 · 1200×1200 · 1200×1800', desc: 'Dense, low-porosity vitrified porcelain for floors, walls and facades that take traffic.' },
  { name: 'Porcelain Slab Tiles', meta: '800×2400 · 800×3000 · 1200×1800 · counter tops from the same slab', desc: 'Panoramic slabs for floors, walls, facades and book-matched features. The fewest joints a surface can have.' },
  { name: 'Ceramic Tiles', meta: 'Wall and floor · range being confirmed', desc: 'Ceramic wall and floor tiles in glossy, matt and carved finishes. Built for bathrooms, kitchens and feature walls.' },
  { name: 'Outdoor Tiles', meta: '600×600 · matt anti-skid', desc: 'Heavy-duty parking, driveway and terrace tiles. Anti-skid rated, frost stable, and unchanged by weather.' },
];

/* Container-load data published on orkaytiles.com/packing-details, trimmed
   to the confirmed ranges (CR §6). Importers plan shipments off these
   numbers — do not round them. Sizes added in the CR (1000×1000, 1200×1800,
   800×2400, 800×3000) have no published packing data yet. */
export const packing = [
  {
    body: 'Ceramic Tiles',
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
    body: 'Vitrified Porcelain Tiles',
    rows: [
      { size: '600×600', thick: '9', box: '4', sqm: '1.44', kg: '28', sqmC: '1,382.40' },
      { size: '600×1200', thick: '9', box: '2', sqm: '1.44', kg: '31', sqmC: '1,267.20' },
      { size: '1200×1200', thick: '9', box: '2', sqm: '2.88', kg: '61', sqmC: '1,140.48' },
    ],
  },
];
/* Packing rows Orkay still has to publish for the confirmed range. */
export const packingPending = ['1000×1000', '1200×1800', '800×2400', '800×3000'];

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

/* Direct Manufacturer Advantage — figures per CR Rev 1; certificates per the
   orkay-tiles fact library. */
export const advantage = [
  { label: 'Own the line', desc: 'Seven production units in Morbi, 60,000 sq m a day. The tile you order is pressed, fired and packed on equipment we own — not bought in and re-labelled.' },
  { label: 'Own the paperwork', desc: 'A manufacturer holding its own DGFT Importer-Exporter Code, AAAFO3244L. Your order does not route through someone else’s factory or someone else’s licence.' },
  { label: 'Own the standard', desc: 'ISO 9001:2015 certified and CE compliant under EU CPR 305/2011. The same certificates cover the floor you specify and the container it ships in.' },
  { label: 'Own the outcome', desc: 'Five quality gates between raw material and released shipment: pre-production control, in-process inspection, pre-packing checks, packing and pallet verification, pre-shipment release approval.' },
];
