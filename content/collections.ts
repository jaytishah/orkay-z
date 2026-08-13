/* CMS SEAM: replace this module's export with a fetch from the CMS.
   Keep the Collection shape and every component keeps working. */

export type Collection = {
  slug: string;
  name: string;
  img: string;
  finish: string;
  look: string;
  sizes: string;
  body: string;
  desc: string;
  /* homepage card meta line */
  meta: string;
};

export const collections: Collection[] = [
  {
    slug: 'vivian',
    name: 'Vivian Statuario',
    img: '/img/slab_vivian.jpg',
    finish: 'Glossy',
    look: 'Marble Look',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'A statuario-inspired surface with soft grey veining on a bright white body — built for lobbies, living floors and bookmatched feature walls.',
    meta: 'Glossy · Marble Look · 600×1200',
  },
  {
    slug: 'armani',
    name: 'Armani Beige',
    img: '/img/slab_armani.jpg',
    finish: 'Glossy',
    look: 'Stone Look',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'Warm beige stone with fine copper veining — a quiet, luxurious floor for hospitality and residential spaces.',
    meta: 'Glossy · Stone Look · 600×1200',
  },
  {
    slug: 'aura',
    name: 'Aura Silver',
    img: '/img/slab_aura.jpg',
    finish: 'Glossy',
    look: 'Marble Look',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'Cool silver-grey marble character with deep translucent movement — pairs with dark stone and brass detailing.',
    meta: 'Glossy · Marble Look · 600×1200',
  },
  {
    slug: 'polar',
    name: 'Polar Blue',
    img: '/img/slab_polar.jpg',
    finish: 'Glossy',
    look: 'Exotic Marble',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'A dramatic blue onyx statement surface — for reception desks, feature walls and spaces that need one unforgettable move.',
    meta: 'Glossy · Exotic Marble · 600×1200',
  },
  {
    slug: 'realistik',
    name: 'Realistik White',
    img: '/img/slab_realistik.jpg',
    finish: 'Matt',
    look: 'Statuario Look',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'A soft-matt white statuario with restrained veining — the calm default for large bright floors.',
    meta: 'Matt · Statuario Look · 600×1200',
  },
  {
    slug: 'travertino',
    name: 'Bone Travertino',
    img: '/img/slab_travertino.jpg',
    finish: 'Matt',
    look: 'Travertine Look',
    sizes: '600×1200 · 800×1600 mm',
    body: 'Vitrified porcelain',
    desc: 'Linear travertine texture in warm bone ivory — facades, terraces and grounded natural interiors.',
    meta: 'Matt · Travertine Look · 600×1200',
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
