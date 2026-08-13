/* CMS SEAM: every headline, caption and number the homepage renders.
   All figures verified against the Orkay fact library. */

export const formats = [
  { size: '600×1200', v: 1200, h: 600, desc: 'Large-format vitrified slabs · Glossy / Matt · Floors, walls and facades', img: '/img/fmt_largeformat.jpg', alt: '600 by 1200 large-format slabs installed' },
  { size: '600×600', v: 600, h: 600, desc: 'Vitrified double-charge floor tiles · Glossy / Matt · Residential and commercial floors', img: '/img/life_2.jpg', alt: '600 by 600 vitrified floor tiles installed' },
  { size: '300×450', v: 450, h: 300, desc: 'Ceramic wall tiles · Glossy / Carving · Bathrooms and kitchens', img: '/img/fmt_bath.jpg', alt: '300 by 450 ceramic wall tiles installed' },
  { size: '400×400', v: 400, h: 400, desc: 'Heavy-duty parking tiles · Matt anti-skid · Driveways, terraces and outdoors', img: '/img/life_outdoor.jpg', alt: '400 by 400 heavy-duty outdoor tiles installed' },
];

export const journey = [
  { title: 'Raw\nMaterial', desc: 'Selected clays, feldspar and quartz from certified quarries. Every batch is lab-tested before it enters the line — consistency begins before the first press stroke.', img: '/img/mfg_raw.jpg', alt: 'Raw ceramic minerals under warehouse light' },
  { title: 'Pressing\n& Forming', desc: 'High-tonnage hydraulic presses form each slab with millimetre precision. Density is uniform edge to edge — the reason an ORKAY tile sounds solid when you tap it.', img: '/img/mfg_press.jpg', alt: 'Hydraulic press forming a porcelain slab' },
  { title: 'Firing', desc: 'Tunnel kilns hold the body at peak temperature until vitrification is complete. What comes out is dense, inert, and ready for thirty years of traffic.', img: '/img/mfg_kiln.jpg', alt: 'Tunnel kiln glowing during firing' },
  { title: '5-Step\nQuality Control', desc: 'Dimension, flatness, shade, strength, surface. Five gates between the kiln and the crate — a slab that misses one never ships.', img: '/img/mfg_qc.jpg', alt: 'Engineer inspecting a glossy slab' },
  { title: 'Packed\nfor the World', desc: 'Export-grade packing, container loading and documentation handled in-house. From our yard in Morbi to your port — sealed, insured, on schedule.', img: '/img/mfg_container.jpg', alt: 'Container loading at dusk' },
];

export const services = [
  { name: 'Digital Quality Lab', desc: 'Every production run is shade-mapped and dimension-logged digitally. Your reorder next year matches the batch on your floor today.' },
  { name: 'OEM & Private Label', desc: 'Your brand, our line. Full private-label manufacturing with dedicated design development and custom packaging.' },
  { name: 'Export Documentation', desc: 'CE marking, ISO 9001:2015 systems, IEC-registered exports. Compliance paperwork prepared before you ask for it.' },
  { name: 'Dealer Support', desc: 'Display planning, sampling programs and marketing assets for showrooms — a partnership, not a price list.' },
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
  heroVideo: '/video/hero_marble_1080p.mp4' as string | null,
  heroImage: '/img/hero_dusk.jpg',
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
