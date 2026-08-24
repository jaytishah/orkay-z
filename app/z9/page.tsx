import Link from 'next/link';
import SiteChrome from '@/components/SiteChrome';
import Motion from '@/components/Motion';
import { collections } from '@/content/collections';
import { products } from '@/content/site';
import './z9.css';

/* eslint-disable @next/next/no-img-element -- same reason as app/page.tsx:
   every image is object-fit sized inside a fixed-height figure and next/image
   fights the clip-path reveals. */

/* Opening sequence in the zorge9 layout language, ORKAY content.
   Motion.tsx already owns lenis + the .img-reveal / .reveal-lines /
   [data-parallax] triggers — nothing here needs its own script. */

const near = [
  { label: 'Seven production units', val: 'One campus', icon: 'M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6' },
  { label: 'In-house design studio', val: '1,000+ designs', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { label: 'Testing & QC laboratory', val: 'ISO 9001:2015', icon: 'M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3M9 3h6M7 15h10' },
  { label: 'Container loading yard', val: 'On site', icon: 'M3 8h18v9H3zM7 8v9M11 8v9M15 8v9' },
  { label: 'Export documentation desk', val: '40+ countries', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18' },
];

const materials = [
  { img: '/img/slab_travertino.jpg', alt: 'Travertino Ivory slab' },
  { img: '/img/slab_aura.jpg', alt: 'Aura Silver slab' },
  { img: '/img/slab_armani.jpg', alt: 'Armani Beige slab' },
  { img: '/img/slab_polar.jpg', alt: 'Polar Blue slab' },
  { img: '/img/slab_blue.jpg', alt: 'Blue onyx slab' },
  { img: '/img/slab_enrico.jpg', alt: 'Enrico slab' },
  { img: '/img/slab_realistik.jpg', alt: 'Realistik wood-look slab' },
  { img: '/img/slab_vivian.jpg', alt: 'Vivian Statuario slab' },
];

/* road/sea distances from the Morbi campus, rounded to the nearest 5 km */
const places = [
  { name: 'Kandla Port', meta: '230 km', img: '/img/global_port.jpg', alt: 'Container gantries at a deep-water port' },
  { name: 'Mundra Port', meta: '240 km', img: '/img/mfg_container.jpg', alt: 'Containers loading at the dispatch bay' },
  { name: 'NH-27 corridor', meta: 'At the gate', img: '/img/advantage_yard.jpg', alt: 'Trailers waiting in the ORKAY dispatch yard' },
  { name: 'Clay and feldspar belt', meta: 'Within 100 km', img: '/img/mfg_raw.jpg', alt: 'Raw body material before preparation' },
];

const materialsMore = [
  { img: '/img/zdecor_1.webp', alt: 'Decor surface 01' },
  { img: '/img/zdecor_2.webp', alt: 'Decor surface 02' },
  { img: '/img/zdecor_3.webp', alt: 'Decor surface 03' },
];

export default function Z9() {
  return (
    <>
      <span id="top" />
      <SiteChrome />
      <Motion />

      <main>
        {/* the hero pins for one viewport and 01b rides up over it — the wrapper
           is what ends the pin, so `sticky` never leaks into the rest of the page */}
        <div className="z9-open">
        {/* ═══ 01 · HERO — auto-crossfading carousel ═══ */}
        <section className="section z9-hero ui-dark" data-polarity="dark">
          <div className="z9-hero__slides" aria-hidden="true">
            <div className="z9-hero__slide">
              <video src="/video/hero_marble_1080p.mp4" poster="/img/hero_dusk.jpg" autoPlay muted loop playsInline />
            </div>
            <div className="z9-hero__slide">
              <img src="/img/light_interior.jpg" alt="" />
            </div>
            <div className="z9-hero__slide">
              <img src="/img/lobby_dark.jpg" alt="" />
            </div>
          </div>

          <div className="z9-hero__dots" aria-hidden="true">
            <span className="z9-hero__dot" />
            <span className="z9-hero__dot" />
            <span className="z9-hero__dot" />
          </div>

          <p className="z9-hero__scroll text-small">Scroll</p>

          <div className="z9-hero__inner">
            <h1 className="z9-hero__title h-display reveal-lines">
              The Luxury<br />of Surface
            </h1>
            <div className="z9-hero__meta">
              <p className="z9-hero__lede text-small reveal-lines">
                Vitrified and porcelain slabs, fired in Morbi<br />and shipped to 40+ countries since 1996.
              </p>
              <a className="btn btn--underline btn--red" href="#collections">
                <span className="btn__mask">
                  <span className="btn__text">Choose a Collection</span>
                  <span className="btn__text btn__text--clone">Choose a Collection</span>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ═══ 01b · SURFACES ON YOUR OWN TERMS — film curtain over the pinned hero ═══ */}
        <section className="section z9-about ui-dark" id="about" data-polarity="dark">
          <div className="z9-about__media" aria-hidden="true">
            <video src="/video/hero_720p.mp4" poster="/img/hero_interior.jpg" autoPlay muted loop playsInline />
          </div>

          <div className="z9-about__inner" data-parallax="0.5">
            <h2 className="z9-about__title h-display reveal-lines">
              Surfaces on<br />Your Own Terms
            </h2>

            <div className="z9-about__cards">
              <a className="z9-tile z9-tile--dark" href="#z9-film">
                <span className="z9-tile__label text-small">About the factory</span>
                <span className="z9-tile__play" aria-hidden="true">▶</span>
              </a>

              <a className="z9-tile z9-tile--light" href="#built">
                <span className="z9-tile__label text-small">Private label<br />and mixed loads</span>
                <span className="z9-tile__mid h-mid">Custom Runs</span>
                <span className="z9-tile__cta">
                  <span className="z9-tile__word text-small">
                    See the range
                    <i className="z9-tile__rule" aria-hidden="true" />
                  </span>
                </span>
              </a>
            </div>
          </div>
        </section>
        </div>

        {/* ═══ 02 · EVERYTHING UNDER ONE ROOF — sticky headline + cards + amenities ═══ */}
        <section className="section z9-life ui-light" id="life" data-polarity="light">
          <div className="z9-life__grid">
            <div className="z9-life__col z9-life__col--left">
              <p className="z9-life__label text-small">The Factory</p>
              <h2 className="z9-life__title h-mid reveal-lines">
                Everything under<br />one roof
              </h2>
              <p className="z9-life__lede text-small reveal-lines">
                Design, body preparation, pressing, firing, polishing and packing all happen
                inside one campus. No trading desk sits between your drawing and the kiln —
                which is why formats, finishes and private-label runs stay negotiable.
              </p>
            </div>

            <div className="z9-life__col">
              <a className="z9-card img-reveal" href="#z9-film">
                <figure>
                  <img src="/img/campus_aerial.jpg" alt="Aerial view of the ORKAY manufacturing campus" />
                </figure>
                <span className="z9-card__bar text-small">
                  About the factory
                  <span className="z9-card__play" aria-hidden="true">▶</span>
                </span>
              </a>

              <a className="z9-card img-reveal img-reveal--r" href="#packing">
                <figure>
                  <img src="/img/advantage_yard.jpg" alt="Crated ORKAY slabs in the dispatch yard" />
                </figure>
                <span className="z9-card__bar text-small">
                  Private label · Mixed loads · FCL plans
                  <span className="z9-card__play" aria-hidden="true">→</span>
                </span>
              </a>

              <div className="z9-near">
                {near.map((n) => (
                  <div className="z9-near__row text-small" key={n.label}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={n.icon} />
                    </svg>
                    <span>{n.label}</span>
                    <span className="z9-near__val">{n.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 03 · BUILT — architecture block + material gallery ═══ */}
        <section className="section z9-built ui-dark" id="built" data-polarity="dark">
          <p className="z9-built__label text-small">Architecture of the Slab</p>
          <h2 className="z9-built__title h-display reveal-lines">
            Seven units running<br />to a single standard
          </h2>

          <figure className="z9-built__media img-reveal" data-parallax="0.9">
            <img src="/img/light_facade.jpg" alt="Building facade clad in ORKAY large-format slabs" />
          </figure>

          <div className="z9-built__features">
            <article className="z9-built__feature">
              <h3 className="h-mid reveal-lines">Panoramic<br />formats</h3>
              <p className="text-small">
                Slabs up to 1200×2400 mm leave fewer joints across a wall or floor, so the vein
                runs the length of the room instead of restarting every tile.
              </p>
            </article>
            <article className="z9-built__feature">
              <h3 className="h-mid reveal-lines">Premium<br />bodies</h3>
              <p className="text-small">
                Full-body vitrified porcelain, finished matt, glossy,
                carving or anti-skid — rated against AS 4459 and AS/NZS 4586.
              </p>
            </article>
          </div>

          <div className="z9-mat">
            <div className="z9-mat__head">
              <h3 className="h-mid reveal-lines">Materials</h3>
              <p className="z9-mat__count text-small">11 photos</p>
            </div>

            <div className="z9-mat__grid">
              {materials.map((m) => (
                <figure className="img-reveal" key={m.img}>
                  <img src={m.img} alt={m.alt} />
                </figure>
              ))}
            </div>

            <details className="z9-mat__more">
              <summary className="text-small">View all 11 photos</summary>
              <div className="z9-mat__grid">
                {materialsMore.map((m) => (
                  <figure key={m.img}>
                    <img src={m.img} alt={m.alt} />
                  </figure>
                ))}
              </div>
            </details>
          </div>
        </section>


        {/* ═══ 03b · THE RANGE — categories on paper, then the named collections ═══
           Reuses .products__* and .collections__card from globals.css; both were
           left orphaned when the home page dropped these blocks. */}
        <section className="section products ui-light" id="ranges" data-polarity="light">
          <p className="products__label text-small">Our Products</p>
          <h2 className="products__title h-display reveal-lines">
            Six ways<br />to build a surface
          </h2>

          <div className="products__grid">
            {products.map((p) => (
              <article className="products__card" key={p.name}>
                <p className="text-small products__meta">{p.meta}</p>
                <h3 className="h-mid products__name">{p.name}</h3>
                <p className="text-small products__desc">{p.desc}</p>
              </article>
            ))}
          </div>

          <div className="z9-cols" id="collections">
            <div className="z9-cols__head">
              <h3 className="h-mid reveal-lines">Collections</h3>
              <p className="z9-cols__note text-small">
                1,000+ designs in the book — six from the current export range.
              </p>
            </div>

            <div className="z9-cols__grid">
              {collections.map((c) => (
                <Link className="collections__card" href={`/collections/${c.slug}`} key={c.slug}>
                  <figure className="img-reveal img-reveal--r">
                    <img src={c.img} alt={c.name} />
                  </figure>
                  <p className="text-small">{c.name}</p>
                  <p className="text-small collections__meta">{c.meta}</p>
                  <span className="btn btn--underline btn--red collections__view">
                    <span className="btn__mask">
                      <span className="btn__text">View Collection</span>
                      <span className="btn__text btn__text--clone">View Collection</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* ═══ 04 · LOCATION — offset hero, giant word, snapping rail ═══ */}
        <section className="section z9-loc ui-light" id="location" data-polarity="light">
          <div className="z9-loc__top">
            <figure className="z9-loc__hero img-reveal" data-parallax="0.9">
              <img src="/img/global_port.jpg" alt="Gantry cranes loading containers at Kandla Port" />
            </figure>
            <p className="z9-loc__label text-small">Privilege of Location</p>
            <p className="z9-loc__lede h-mid reveal-lines">
              Morbi fires most of India&apos;s tile. Two deep-water ports sit<br />
              within a day of the kiln, so a container leaves our yard<br />
              and reaches the sea without changing hands.
            </p>
          </div>

          <h2 className="z9-loc__word h-display">Location</h2>
          <hr className="z9-loc__rule" />

          {/* native scroll-snap rail — two cards per view, no carousel script */}
          <div className="z9-loc__rail" tabIndex={0} role="group" aria-label="What sits near the Morbi campus">
            {places.map((p) => (
              <figure className="z9-loc__card img-reveal" key={p.name}>
                <img src={p.img} alt={p.alt} />
                <figcaption className="z9-loc__cap">
                  <span className="text-small">{p.meta}</span>
                  <span className="h-mid">{p.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* video modal — CSS :target, no script */}
        <div className="z9-modal" id="z9-film" role="dialog" aria-label="About the factory">
          <a className="z9-modal__close" href="#life" aria-label="Close video" />
          <a className="z9-modal__x text-small" href="#life">Close ×</a>
          <div className="z9-modal__body">
            <video src="/video/exhibition_720p.mp4" poster="/img/exhibition_poster.jpg" controls preload="none" />
            <p className="z9-modal__note text-small">
              Inside the Morbi campus — body preparation, pressing, the kiln line and final sorting.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
