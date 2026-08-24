import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import InquiryForm from '@/components/InquiryForm';
import { contactPage } from '@/content/pages';
import { contact } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Contact — ORKAY Tiles',
  description:
    'Contact ORKAY Tiles in Morbi, Gujarat. Export and domestic desks, OEM and private label, dealer applications. Enquiries answered within one business day.',
  openGraph: {
    title: 'Contact ORKAY Tiles',
    description: 'One gate in Morbi. Export, domestic, private label and dealer enquiries.',
    images: ['/img/mundra_port.png'],
  },
};

export default function ContactPage() {
  const lines = contact.address.split('\n');

  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome />

      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">{contactPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            One gate<br />in Morbi
          </h1>
          <p className="pg-hero__lede reveal-lines">{contactPage.lede}</p>
        </section>

        <section className="section pg--tight ui-light" data-polarity="light">
          <div className="pg-grid pg-grid--4" style={{ marginTop: 0 }}>
            {contactPage.desks.map((d) => (
              <div className="pg-item" key={d.title}>
                <p className="text-small">{d.title}</p>
                <p className="text-small pg-item__desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="reach">
          <p className="text-small pg__label">Direct lines</p>
          <div className="pg-grid pg-grid--3" style={{ marginTop: '4vh' }}>
            <div className="pg-item">
              <p className="text-small pg-item__desc">Export</p>
              <p className="h-mid">
                <a href={`tel:${contact.exportPhone.replace(/\s/g, '')}`}>{contact.exportPhone}</a>
              </p>
            </div>
            <div className="pg-item">
              <p className="text-small pg-item__desc">Domestic</p>
              <p className="h-mid">
                <a href={`tel:${contact.domesticPhone.replace(/\s/g, '')}`}>{contact.domesticPhone}</a>
              </p>
            </div>
            <div className="pg-item">
              <p className="text-small pg-item__desc">Email</p>
              <p className="h-mid">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            </div>
          </div>

          <div className="pg-grid pg-grid--2">
            <div>
              <p className="text-small pg__label" style={{ marginBottom: '3vh' }}>Registered office</p>
              <address className="h-mid" style={{ fontStyle: 'normal', maxWidth: '20ch' }}>
                {lines.map((l, i) => (
                  <span key={i}>
                    {l}
                    {i < lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </address>
              <div className="pg-table text-small">
                {contactPage.visiting.map((v) => (
                  <div key={v.label}>
                    <span>{v.label}</span>
                    <span>{v.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <figure style={{ height: '64vh' }} className="img-reveal img-reveal--r">
              <img src="/img/cr_mundra_port.jpg" alt="Container yard at Mundra port, the nearest gateway to Morbi" />
            </figure>
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="enquiry">
          <p className="text-small pg__label">Send an enquiry</p>
          <h2 className="h-mid pg__title reveal-lines">Tell us the market<br />and the volume</h2>
          <p className="text-small pg__lede">
            The more specific the brief — sizes, finishes, monthly quantity, destination port — the
            faster the quote comes back.
          </p>
          <InquiryForm />
        </section>

        <section className="section pg-cta ui-dark" data-polarity="dark">
          <a
            href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
              'Hello ORKAY — I would like the export catalogue and pricing.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--underline btn--red"
          >
            <span className="btn__mask">
              <span className="btn__text">Message on WhatsApp</span>
              <span className="btn__text btn__text--clone">Message on WhatsApp</span>
            </span>
          </a>
          <Link href="/dealers" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Become a Dealer</span>
              <span className="btn__text btn__text--clone">Become a Dealer</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
