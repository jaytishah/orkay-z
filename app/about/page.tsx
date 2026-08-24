import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { about, certifications, corporatePage, qcSteps } from '@/content/pages';
import { contact, site, timeline } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element -- see the note in app/page.tsx */

export const metadata: Metadata = {
  title: 'About — ORKAY Tiles',
  description:
    'ORKAY Tiles: a Morbi manufacturer since 1996. Seven production units, 60,000 sq m a day, exported to 40+ countries. ISO 9001:2015 and CE certified, DGFT IEC AAAFO3244L. Company, plants, timeline, certifications and careers.',
  openGraph: {
    title: 'About ORKAY Tiles',
    description: 'Thirty years of firing tile in Morbi. Seven units, 60,000 sq m a day, 40+ countries.',
    images: ['/img/campus_aerial.jpg'],
  },
};

export default function AboutPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome />

      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">{about.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            {about.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < about.title.split('\n').length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className="pg-hero__lede reveal-lines">{about.lede}</p>
        </section>

        <figure className="pg-band img-reveal">
          <img src="/img/campus_aerial.jpg" alt="Aerial view of the ORKAY manufacturing campus in Morbi" />
        </figure>

        <section className="section pg ui-dark" data-polarity="dark" id="story">
          <p className="text-small pg__label">The manufacturer, not the middleman</p>
          <div className="pg-split">
            <div className="pg-split__copy">
              {about.story.map((p, i) => (
                <p key={i} className={i === 0 ? 'h-mid reveal-lines' : 'text-small pg__lede'}>
                  {p}
                </p>
              ))}
            </div>
            <figure className="pg-split__media img-reveal img-reveal--r">
              <img src="/img/presshall.png" alt="The press hall on one of ORKAY's seven production units" />
            </figure>
          </div>

          <div className="pg-grid pg-grid--4">
            {about.figures.map((f) => (
              <div className="pg-item" key={f.label}>
                <p className="h-mid">{f.value}</p>
                <p className="text-small pg-item__desc">{f.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CR §4 — the authoritative capacity timeline, five fields per
            milestone, read as a vertical rail so it stays legible on a phone */}
        <section className="section pg ui-light" data-polarity="light" id="timeline">
          <p className="text-small pg__label">Capacity timeline</p>
          <h2 className="h-mid pg__title reveal-lines">Five hundred to<br />sixty thousand a day</h2>
          <p className="text-small pg__lede">
            Today&apos;s 60,000 sq m a day is the four active lines together: 15,000 (2016), 21,000
            (2019), 13,000 (2023) and 11,000 (2025).
          </p>
          <div className="pg-steps">
            {timeline.map((t) => (
              <article className="pg-step" key={t.year}>
                <p className="text-small pg-step__n">{t.year}</p>
                <div>
                  <p className="h-mid" style={{ fontSize: 'clamp(20px, 2vw, 30px)' }}>{t.capacity}</p>
                  <p className="text-small" style={{ marginTop: 8 }}>{t.product}</p>
                </div>
                <div>
                  <p className="text-small pg-step__desc">{t.tech}</p>
                  {t.sizes !== '—' ? (
                    <p className="text-small pg-step__desc" style={{ marginTop: 8 }}>Sizes · {t.sizes}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <p className="text-small pg-item__desc" style={{ marginTop: '3vh', maxWidth: '62ch' }}>
            Technology references: EFI Cretaprint printers · SACMI CONTINUA+ — one of only 60–70 units
            in use worldwide.
          </p>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="quality">
          <p className="text-small pg__label">Quality control</p>
          <h2 className="h-mid pg__title reveal-lines">Five checks between<br />the raw body and the pallet</h2>
          <p className="text-small pg__lede">
            Every order passes the same five stages. Nothing ships on a verbal release.
          </p>
          <div className="pg-steps">
            {qcSteps.map((s) => (
              <article className="pg-step" key={s.n}>
                <p className="text-small pg-step__n">{s.n}</p>
                <h3 className="text-small">{s.title}</h3>
                <p className="text-small pg-step__desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section pg--tight ui-dark" data-polarity="dark">
          <div className="pg-grid pg-grid--2" style={{ marginTop: 0 }}>
            <figure style={{ height: '58vh' }} className="img-reveal">
              <img src="/img/mfg_qc.jpg" alt="Quality control inspection on the ORKAY line" />
            </figure>
            <figure style={{ height: '58vh' }} className="img-reveal img-reveal--r">
              <img src="/img/mfg_container.jpg" alt="Container loading at the ORKAY yard" />
            </figure>
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="certifications">
          <p className="text-small pg__label">Certifications</p>
          <h2 className="h-mid pg__title reveal-lines">Audited, not asserted</h2>
          <p className="text-small pg__lede">
            Certificate numbers and validity dates are published here so a buyer can verify them
            with the issuing body rather than take our word for it.
          </p>
          <div className="pg-table text-small">
            {certifications.map((c) => (
              <div key={c.label}>
                <span>{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Corporate folded in (CR A-05): how we work, where people work, careers */}
        <section className="section pg ui-dark" data-polarity="dark" id="how-we-work">
          <p className="text-small pg__label">How we work</p>
          <div className="pg-grid pg-grid--3" style={{ marginTop: '4vh' }}>
            {corporatePage.values.map((v) => (
              <div className="pg-item" key={v.title}>
                <p className="text-small">{v.title}</p>
                <p className="text-small pg-item__desc">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="pg-table text-small" style={{ marginTop: '8vh' }}>
            {corporatePage.functions.map((f) => (
              <div key={f.title}>
                <span>{f.title}</span>
                <span>{f.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-light" data-polarity="light" id="careers">
          <p className="text-small pg__label">Careers</p>
          <h2 className="h-mid pg__title reveal-lines">
            {corporatePage.roles.length > 0 ? 'Open positions' : <>No listed vacancies<br />right now</>}
          </h2>
          {corporatePage.roles.length > 0 ? (
            <div className="pg-table text-small">
              {corporatePage.roles.map((r) => (
                <div key={r.title}>
                  <span>{r.title}</span>
                  <span>{r.desc}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-small pg__lede">
              We have not published a vacancy list yet. Open applications are still read: if you
              have worked a press, a kiln, a QC bench, an export desk or a design studio, send what
              you have done and where you did it.
              <em className="pg-todo">Roles to be supplied</em>
            </p>
          )}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: '5vh' }}>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent('Open application — careers')}`}
              className="btn btn--underline btn--red"
            >
              <span className="btn__mask">
                <span className="btn__text">Send an Open Application</span>
                <span className="btn__text btn__text--clone">Send an Open Application</span>
              </span>
            </a>
            <a href={`tel:${contact.domesticPhone.replace(/\s/g, '')}`} className="btn btn--underline">
              <span className="btn__mask">
                <span className="btn__text">Call the Office</span>
                <span className="btn__text btn__text--clone">Call the Office</span>
              </span>
            </a>
          </div>
        </section>

        <section className="section pg-cta ui-dark" data-polarity="dark">
          <a href={`mailto:${site.email}?subject=Factory visit enquiry`} className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Arrange a Factory Visit</span>
              <span className="btn__text btn__text--clone">Arrange a Factory Visit</span>
            </span>
          </a>
          <a href={`tel:${contact.exportPhone.replace(/\s/g, '')}`} className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Talk to the Export Desk</span>
              <span className="btn__text btn__text--clone">Talk to the Export Desk</span>
            </span>
          </a>
          <Link href="/products" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">See the Ranges</span>
              <span className="btn__text btn__text--clone">See the Ranges</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
