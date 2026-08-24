import type { Metadata } from 'next';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { dealerPage, digioPage } from '@/content/pages';
import { contact } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'digiO — Paperless Dealer Onboarding — ORKAY Tiles',
  description:
    'Apply, verify, sign and receive an ORKAY dealer code without printing a page. Aadhaar OTP e-signature via Digio, legally valid under the IT Act 2000, with a full audit trail.',
  openGraph: {
    title: 'digiO — paperless dealer onboarding',
    description: 'Apply, verify, e-Sign, and get a dealer code. No paper.',
    images: ['/img/design_studio_hall.png'],
  },
};

export default function DealerOnboardingPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome polarity="dark" cta={{ label: 'Dealer Programme', href: '/dealers' }} />

      <main className="pg-main">
        <section className="section pg-hero ui-dark" data-polarity="dark">
          <p className="text-small pg-hero__kicker">{digioPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            Paperless<br />dealer onboarding
          </h1>
          <p className="pg-hero__lede reveal-lines">{digioPage.lede}</p>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="flow">
          <p className="text-small pg__label">The flow</p>
          <div className="pg-steps" style={{ marginTop: '4vh' }}>
            {dealerPage.steps.map((s) => (
              <article className="pg-step" key={s.n}>
                <p className="text-small pg-step__n">{s.n}</p>
                <h3 className="text-small">{s.title}</h3>
                <p className="text-small pg-step__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="needs">
          <p className="text-small pg__label">What to have ready</p>
          <h2 className="h-mid pg__title reveal-lines">Four things<br />before you start</h2>
          <div className="pg-grid pg-grid--4">
            {digioPage.needs.map((n) => (
              <div className="pg-item" key={n.title}>
                <p className="text-small">{n.title}</p>
                <p className="text-small pg-item__desc">{n.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="legal">
          <p className="text-small pg__label">Legal standing</p>
          <h2 className="h-mid pg__title reveal-lines">A signature that<br />holds up</h2>
          <p className="text-small pg__lede">
            An Aadhaar OTP signature is not a scanned image of a signature. It binds the signer&apos;s
            verified identity to the document and records the circumstances of signing, which is why
            it is admissible under the IT Act.
          </p>
          <div className="pg-table text-small">
            {digioPage.legal.map((l) => (
              <div key={l.label}>
                <span>{l.label}</span>
                <span>{l.value}</span>
              </div>
            ))}
          </div>
          <p className="text-small pg-item__desc" style={{ marginTop: '5vh', maxWidth: '62ch' }}>
            The e-Sign, Aadhaar and KYC infrastructure is operated by Digio under its own terms.
            Orkay is the data controller for all dealer and KYC information collected here.
          </p>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="start">
          <div className="pg-split">
            <div className="pg-split__copy">
              <p className="text-small pg__label" style={{ marginBottom: 0 }}>Start</p>
              <h2 className="h-mid reveal-lines">Open an<br />application</h2>
              <p className="text-small pg__lede">
                The application form and the live Digio signing flow are wired up as part of the
                dealer module build. Until that goes live, applications are opened by the dealer
                desk directly.
                <em className="pg-todo">Flow pending build</em>
              </p>
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                    'Hello ORKAY — I would like to begin dealer onboarding.',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--underline btn--red"
                >
                  <span className="btn__mask">
                    <span className="btn__text">Begin on WhatsApp</span>
                    <span className="btn__text btn__text--clone">Begin on WhatsApp</span>
                  </span>
                </a>
                <a href={`mailto:${contact.email}?subject=Dealer onboarding`} className="btn btn--underline">
                  <span className="btn__mask">
                    <span className="btn__text">Email the Dealer Desk</span>
                    <span className="btn__text btn__text--clone">Email the Dealer Desk</span>
                  </span>
                </a>
              </div>
            </div>
            <figure className="pg-split__media img-reveal img-reveal--r">
              <img src="/img/cr_design_studio.jpg" alt="The ORKAY design studio in Morbi" />
            </figure>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
