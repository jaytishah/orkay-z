import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { solutionPage } from '@/content/pages';
import { site } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Orkay Solution — ORKAY Tiles',
  description:
    'OEM and private label, mixed container loads, project supply, reference matching, export documentation and dealer support — direct from a seven-unit manufacturer in Morbi.',
  openGraph: {
    title: 'Orkay Solution',
    description: 'What a factory can do that a trader cannot.',
    images: ['/img/svc_privatelabel.png'],
  },
};

export default function SolutionPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome polarity="dark" />

      <main className="pg-main">
        <section className="section pg-hero ui-dark" data-polarity="dark">
          <p className="text-small pg-hero__kicker">{solutionPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            What a factory<br />can do that a<br />trader cannot
          </h1>
          <p className="pg-hero__lede reveal-lines">{solutionPage.lede}</p>
        </section>

        <section className="section pg--tight ui-dark" data-polarity="dark" id="offerings">
          <div className="pg-grid pg-grid--3" style={{ marginTop: 0 }}>
            {solutionPage.offerings.map((o) => (
              <div className="pg-item" key={o.title}>
                <p className="text-small">{o.title}</p>
                <p className="text-small pg-item__desc">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="private-label">
          <div className="pg-split">
            <div className="pg-split__copy">
              <p className="text-small pg__label" style={{ marginBottom: 0 }}>Private label</p>
              <h2 className="h-mid reveal-lines">Your brand,<br />our kiln</h2>
              <p className="text-small pg__lede">
                Artwork, carton design and shade approval are settled before the run starts. The
                boxes that arrive at your warehouse carry your name, and nothing on the pallet
                identifies the factory unless you want it to.
              </p>
              <p className="text-small pg-item__desc">
                Minimum quantities and lead times are quoted per range — ask the export desk.
              </p>
            </div>
            <figure className="pg-split__media img-reveal img-reveal--r">
              <img src="/img/svc_privatelabel.png" alt="Private label cartons being packed at ORKAY" />
            </figure>
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="applications">
          <p className="text-small pg__label">By application</p>
          <h2 className="h-mid pg__title reveal-lines">Specify by where<br />the tile has to live</h2>
          <div className="pg-grid pg-grid--3">
            {solutionPage.applications.map((a) => (
              <div key={a.title}>
                <figure style={{ height: '32vh' }} className="img-reveal">
                  <img src={a.img} alt={a.alt} />
                </figure>
                <div className="pg-item" style={{ marginTop: 18 }}>
                  <p className="text-small">{a.title}</p>
                  <p className="text-small pg-item__desc">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg-cta ui-dark" data-polarity="dark">
          <a href={`mailto:${site.email}?subject=Private label enquiry`} className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Discuss a Private Label Run</span>
              <span className="btn__text btn__text--clone">Discuss a Private Label Run</span>
            </span>
          </a>
          <Link href="/dealers" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Dealer Programme</span>
              <span className="btn__text btn__text--clone">Dealer Programme</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
