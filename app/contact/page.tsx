import type { Metadata } from 'next';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import FormDialog from '@/components/FormDialog';
import InquiryForm from '@/components/InquiryForm';
import DealerApplicationForm from '@/components/DealerApplicationForm';
import SupportRequestForm from '@/components/SupportRequestForm';
import { contactPage, contactChannels } from '@/content/pages';
import { contact } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

/* Three ways in, three forms, one inbox.

   01 general enquiry    → /api/inquiry  → Submission kind 'inquiry'
   02 dealership         → /api/dealers  → Module 10 application (GSTIN
                                            verified, territory reserved,
                                            Aadhaar e-Sign)
   03 dealer support     → /api/support  → Submission kind 'support'

   All three land in the admin panel: /admin/inbox for 01 and 03,
   /admin/dealers for 02, which has its own approval ladder. The words are in
   content/pages.ts; the only thing this file decides is which form belongs to
   which channel. */

const FORMS = {
  inquiry: InquiryForm,
  dealership: DealerApplicationForm,
  support: SupportRequestForm,
} as const;

export const metadata: Metadata = {
  title: 'Contact — ORKAY Tiles',
  description:
    'Contact ORKAY Tiles in Morbi, Gujarat. Send a general enquiry, apply for a district dealership with GSTIN verification and Aadhaar e-Sign, or raise a dealer support request. Answered within one business day.',
  openGraph: {
    title: 'Contact ORKAY Tiles',
    description: 'Enquiry, dealership application, dealer support — three forms, one desk in Morbi.',
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

        {contactChannels.map((c, i) => {
          const Form = FORMS[c.form];
          /* alternate ground and image side, so three long sections do not
             read as one wall — the same rhythm the other pages use */
          const dark = i % 2 === 0;
          return (
            <section
              key={c.n}
              id={c.form}
              className={`section pg ct-channel ${dark ? 'ui-dark' : 'ui-light'}`}
              data-polarity={dark ? 'dark' : 'light'}
            >
              <div className={`pg-split${i % 2 === 1 ? ' pg-split--rev' : ''}`}>
                <div className="pg-split__copy">
                  <p className="text-small ct-channel__n">{c.n}</p>
                  <p className="text-small pg__label" style={{ marginBottom: 0 }}>{c.kicker}</p>
                  <h2 className="h-mid reveal-lines">
                    {c.title.split('\n').map((l, n) => (
                      <span key={n}>
                        {l}
                        {n < c.title.split('\n').length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </h2>
                  <p className="text-small pg__lede">{c.lede}</p>

                  <div>
                    <p className="text-small ct-ready__label">What to have ready</p>
                    <ul className="ct-ready">
                      {c.ready.map((r) => (
                        <li className="text-small" key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <FormDialog
                      cta={c.cta}
                      kicker={c.kicker}
                      title={c.dialogTitle}
                      lede={c.dialogLede}
                    >
                      <Form />
                    </FormDialog>
                  </div>
                </div>

                <figure className="pg-split__media img-reveal img-reveal--r">
                  <img src={c.image} alt={c.alt} />
                </figure>
              </div>
            </section>
          );
        })}

        <section className="section pg--tight ui-light" data-polarity="light">
          <p className="text-small pg__label" style={{ marginBottom: '4vh' }}>Who answers what</p>
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
          <a href={`mailto:${contact.email}`} className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Email the Desk</span>
              <span className="btn__text btn__text--clone">Email the Desk</span>
            </span>
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
