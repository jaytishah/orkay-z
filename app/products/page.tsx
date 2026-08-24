import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { productPage } from '@/content/pages';
import { formats, products, site, tileTypes } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Products — ORKAY Tiles',
  description:
    'Four ranges from ORKAY Tiles: vitrified porcelain tiles, porcelain slab tiles, ceramic tiles and outdoor tiles. Sizes from 300×450 to 800×3000 mm.',
  openGraph: {
    title: 'ORKAY Products — four ranges',
    description: 'Vitrified porcelain tiles, porcelain slab tiles, ceramic tiles and outdoor tiles.',
    images: ['/img/type_slabs.png'],
  },
};

export default function ProductsPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome />

      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">{productPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            Four ranges,<br />one body of work
          </h1>
          <p className="pg-hero__lede reveal-lines">{productPage.lede}</p>
        </section>

        {tileTypes.map((t, i) => (
          <section
            className={`section pg ${i % 2 === 0 ? 'ui-dark' : 'ui-light'}`}
            data-polarity={i % 2 === 0 ? 'dark' : 'light'}
            key={t.title}
            id={t.title.replace(/\s+/g, '-').toLowerCase()}
          >
            <div className={`pg-split${i % 2 === 1 ? ' pg-split--rev' : ''}`}>
              <div className="pg-split__copy">
                <p className="text-small pg__label" style={{ marginBottom: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="h-mid reveal-lines">
                  {t.title.split('\n').map((line, n) => (
                    <span key={n}>
                      {line}
                      {n < t.title.split('\n').length - 1 ? <br /> : null}
                    </span>
                  ))}
                </h2>
                <p className="text-small pg__lede">{t.desc}</p>
                <p className="text-small pg-item__desc">{products[i]?.meta}</p>
              </div>
              <figure className="pg-split__media img-reveal img-reveal--r">
                <img src={t.img} alt={t.alt} />
              </figure>
            </div>
          </section>
        ))}

        <section className="section pg ui-dark" data-polarity="dark" id="formats">
          <p className="text-small pg__label">Formats</p>
          <h2 className="h-mid pg__title reveal-lines">Every size,<br />by category</h2>
          <div className="pg-grid pg-grid--4">
            {formats.map((f) => (
              <div key={f.name}>
                <figure style={{ height: '30vh' }} className="img-reveal">
                  <img src={f.img} alt={f.alt} />
                </figure>
                <div className="pg-item" style={{ marginTop: 18 }}>
                  <p className="text-small">{f.name}</p>
                  <p className="h-mid" style={{ fontSize: 'clamp(18px, 1.6vw, 26px)', marginTop: 8 }}>
                    {f.sizes.join(' · ')} <sup className="text-small">MM</sup>
                  </p>
                  <p className="text-small pg-item__desc">
                    {f.desc}
                    {'pending' in f && f.pending ? <em className="pg-todo">Range to confirm</em> : null}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="technical">
          <p className="text-small pg__label">Technical</p>
          <h2 className="h-mid pg__title reveal-lines">Specify against<br />a datasheet</h2>
          <p className="text-small pg__lede">
            Anything marked below is still to be published from Orkay&apos;s own test reports rather
            than asserted here.
          </p>
          <div className="pg-table text-small">
            {productPage.properties.map((p) => (
              <div key={p.label}>
                <span>{p.label}</span>
                <span>
                  {p.value}
                  {p.todo ? <em className="pg-todo">To confirm</em> : null}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg-cta ui-light" data-polarity="light">
          <Link href="/downloads" className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Download the Catalogue</span>
              <span className="btn__text btn__text--clone">Download the Catalogue</span>
            </span>
          </Link>
          <a href={`mailto:${site.email}?subject=Sample request`} className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Request Samples</span>
              <span className="btn__text btn__text--clone">Request Samples</span>
            </span>
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
