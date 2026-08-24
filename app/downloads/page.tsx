import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { catalogPage } from '@/content/pages';
import { packing, packingPending, site } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Catalogue & Downloads — ORKAY Tiles',
  description:
    'Range catalogues, packing and container-load data, and compliance certificates (CE, ISO 9001:2015, DGFT IEC) from ORKAY Tiles, Morbi.',
  openGraph: {
    title: 'ORKAY Catalogue & Downloads',
    description: 'Range catalogues, packing data and compliance certificates.',
    images: ['/img/mfg_container.jpg'],
  },
};

export default function CatalogPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome polarity="dark" />

      <main className="pg-main">
        <section className="section pg-hero ui-dark" data-polarity="dark">
          <p className="text-small pg-hero__kicker">{catalogPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            Everything<br />in print
          </h1>
          <p className="pg-hero__lede reveal-lines">{catalogPage.lede}</p>
        </section>

        <section className="section pg--tight ui-dark" data-polarity="dark" id="downloads">
          <div className="pg-docs">
            {catalogPage.downloads.map((d) => (
              <div className="pg-doc" key={d.title}>
                <div className="pg-doc__label">
                  <p className="text-small">{d.title}</p>
                  <p className="text-small pg-doc__meta">{d.meta}</p>
                </div>
                {d.file ? (
                  <a href={d.file} download className="btn btn--underline">
                    <span className="btn__mask">
                      <span className="btn__text">Download</span>
                      <span className="btn__text btn__text--clone">Download</span>
                    </span>
                  </a>
                ) : (
                  /* No file yet — ask the export desk rather than serve a 404. */
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent(`Request: ${d.title}`)}`}
                    className="btn btn--underline btn--red"
                  >
                    <span className="btn__mask">
                      <span className="btn__text">Request by email</span>
                      <span className="btn__text btn__text--clone">Request by email</span>
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <figure className="pg-band pg-band--short img-reveal">
          <img src="/img/mfg_container.jpg" alt="Pallets loaded into a container at the ORKAY yard" />
        </figure>

        <section className="section pg ui-light" data-polarity="light" id="packing">
          <p className="text-small pg__label">Packing data</p>
          <h2 className="h-mid pg__title reveal-lines">Plan the container<br />off real numbers</h2>
          <p className="text-small pg__lede">
            Box count, coverage, weight and container load by size. Importers plan shipments off
            these figures, so they are published unrounded.
          </p>

          {packing.map((group) => (
            <div key={group.body} style={{ marginTop: '7vh' }}>
              <p className="text-small pg__label" style={{ marginBottom: '2vh' }}>{group.body}</p>
              <div className="pg-table text-small" style={{ maxWidth: '100%' }}>
                <div>
                  <span>Size (mm)</span>
                  <span>Thickness · Pcs/box · Sq.m/box · Kg/box · Sq.m/container</span>
                </div>
                {group.rows.map((r) => (
                  <div key={r.size}>
                    <span>{r.size}</span>
                    <span>
                      {r.thick} mm · {r.box} · {r.sqm} · {r.kg} kg · {r.sqmC}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-small pg__lede" style={{ marginTop: '5vh' }}>
            Packing data for {packingPending.join(', ')} is being published by Orkay.
            <em className="pg-todo">To confirm</em>
          </p>
        </section>

        <section className="section pg-cta ui-light" data-polarity="light">
          <a href={`mailto:${site.email}?subject=Full catalogue request`} className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Request the Full Catalogue</span>
              <span className="btn__text btn__text--clone">Request the Full Catalogue</span>
            </span>
          </a>
          <Link href="/products" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Browse the Ranges</span>
              <span className="btn__text btn__text--clone">Browse the Ranges</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
