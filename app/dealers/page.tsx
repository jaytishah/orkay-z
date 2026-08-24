import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { dealerPage } from '@/content/pages';
import { contact, site } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Dealer Support Programme — ORKAY Tiles',
  description:
    'Become an ORKAY dealer or distributor: protected territory, factory pricing, sample boards and display racks, and a named contact in Morbi. Paperless onboarding with Aadhaar e-Sign.',
  openGraph: {
    title: 'ORKAY Dealer Support Programme',
    description: 'Stock a factory, not a middleman.',
    images: ['/img/advantage_yard.jpg'],
  },
};

export default function DealersPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome />

      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">{dealerPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            Stock a factory,<br />not a middleman
          </h1>
          <p className="pg-hero__lede reveal-lines">{dealerPage.lede}</p>
        </section>

        <figure className="pg-band pg-band--short img-reveal">
          <img src="/img/advantage_yard.jpg" alt="Pallets of ORKAY tile stacked in the loading yard" />
        </figure>

        <section className="section pg ui-dark" data-polarity="dark" id="benefits">
          <p className="text-small pg__label">What an appointment carries</p>
          <div className="pg-grid pg-grid--3" style={{ marginTop: '4vh' }}>
            {dealerPage.benefits.map((b) => (
              <div className="pg-item" key={b.title}>
                <p className="text-small">{b.title}</p>
                <p className="text-small pg-item__desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="how">
          <p className="text-small pg__label">How an appointment happens</p>
          <h2 className="h-mid pg__title reveal-lines">Four steps,<br />no paperwork</h2>
          <p className="text-small pg__lede">
            The whole flow runs online. Nothing is printed, couriered or signed in ink.
          </p>
          <div className="pg-steps">
            {dealerPage.steps.map((s) => (
              <article className="pg-step" key={s.n}>
                <p className="text-small pg-step__n">{s.n}</p>
                <h3 className="text-small">{s.title}</h3>
                <p className="text-small pg-step__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="apply">
          <div className="pg-split">
            <div className="pg-split__copy">
              <p className="text-small pg__label" style={{ marginBottom: 0 }}>Apply</p>
              <h2 className="h-mid reveal-lines">Tell us the<br />territory</h2>
              <p className="text-small pg__lede">
                Name the district you intend to serve, the ranges you carry today and your
                expected monthly volume. Under One District, One Dealer the district is checked
                against existing appointments first, so nobody applies into a territory already taken.
              </p>
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <Link href="/dealer-onboarding" className="btn btn--underline btn--red">
                  <span className="btn__mask">
                    <span className="btn__text">Start Onboarding</span>
                    <span className="btn__text btn__text--clone">Start Onboarding</span>
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                    'Hello ORKAY — I would like to apply as a dealer.',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--underline"
                >
                  <span className="btn__mask">
                    <span className="btn__text">Ask on WhatsApp</span>
                    <span className="btn__text btn__text--clone">Ask on WhatsApp</span>
                  </span>
                </a>
              </div>
            </div>
            <figure className="pg-split__media img-reveal img-reveal--r">
              <img src="/img/cr_seven_units.jpg" alt="The seven ORKAY production units in Morbi at dusk" />
            </figure>
          </div>
        </section>

        <section className="section pg-cta ui-dark" data-polarity="dark">
          <a href={`mailto:${site.email}?subject=Dealer application`} className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Email the Dealer Desk</span>
              <span className="btn__text btn__text--clone">Email the Dealer Desk</span>
            </span>
          </a>
          <Link href="/downloads" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Get the Catalogue</span>
              <span className="btn__text btn__text--clone">Get the Catalogue</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
