import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import { certifications, reviews, testimonialPage } from '@/content/pages';
import { contact, site } from '@/content/site';
import '../pages.css';

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: 'Testimonials & Reviews — ORKAY Tiles',
  description:
    'What importers, distributors and project buyers say about working with ORKAY Tiles, published verbatim with permission.',
  openGraph: {
    title: 'ORKAY — Testimonials & Reviews',
    description: 'What buyers say, in their own words.',
    images: ['/img/global_port.jpg'],
  },
};

export default function TestimonialsPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome />

      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">{testimonialPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            What buyers say,<br />in their own words
          </h1>
          <p className="pg-hero__lede reveal-lines">{testimonialPage.lede}</p>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="reviews">
          {reviews.length > 0 ? (
            <>
              <p className="text-small pg__label">Reviews</p>
              <div className="pg-grid pg-grid--2" style={{ marginTop: '4vh' }}>
                {reviews.map((r) => (
                  <blockquote className="pg-quote" key={`${r.who}-${r.where}`}>
                    {r.stars ? (
                      <p className="text-small pg-quote__stars" aria-label={`${r.stars} out of 5`}>
                        {'★'.repeat(r.stars)}
                      </p>
                    ) : null}
                    <p className="pg-quote__body">{r.body}</p>
                    <footer className="text-small pg-quote__who">
                      {r.who} · {r.where}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </>
          ) : (
            /* No invented reviews. A testimonial is a statement attributed to a real
               buyer; writing one on Orkay's behalf would be a fabricated record, and
               the quotation makes Orkay answerable for every published claim. */
            <>
              <p className="text-small pg__label">Reviews</p>
              <h2 className="h-mid pg__title reveal-lines">
                Nothing here yet —<br />and nothing invented
              </h2>
              <p className="text-small pg__lede">
                We have not published testimonials because Orkay has not supplied them yet.
                A review is a statement made by a named buyer about their own experience, so
                it is not something that can be written on their behalf — every quote on this
                page will arrive from a real customer with their written permission.
                <em className="pg-todo">Awaiting Orkay</em>
              </p>
              <p className="text-small pg__lede" style={{ marginTop: '3vh' }}>
                What can be verified today is published on the certifications and about pages,
                with certificate numbers and validity dates.
              </p>
            </>
          )}
        </section>

        <figure className="pg-band pg-band--short img-reveal">
          <img src="/img/global_port.jpg" alt="Containers at port, bound for ORKAY's export markets" />
        </figure>

        <section className="section pg ui-light" data-polarity="light" id="proof">
          <p className="text-small pg__label">What is verifiable today</p>
          <div className="pg-grid pg-grid--3" style={{ marginTop: '4vh' }}>
            {testimonialPage.proofPoints.map((p) => (
              <div className="pg-item" key={p.title}>
                <p className="h-mid">{p.title}</p>
                <p className="text-small pg-item__desc">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="pg-table text-small" style={{ marginTop: '8vh' }}>
            {certifications.slice(0, 4).map((c) => (
              <div key={c.label}>
                <span>{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="leave">
          <p className="text-small pg__label">Bought from us?</p>
          <h2 className="h-mid pg__title reveal-lines">Tell us how<br />it went</h2>
          <p className="text-small pg__lede">
            Good or otherwise. A review published here is used verbatim, with your firm and
            market named, and only once you have confirmed it in writing.
          </p>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: '5vh' }}>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent('Customer review')}`}
              className="btn btn--underline btn--red"
            >
              <span className="btn__mask">
                <span className="btn__text">Leave a Review</span>
                <span className="btn__text btn__text--clone">Leave a Review</span>
              </span>
            </a>
            <a
              href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                'Hello ORKAY — I would like to share feedback on my order.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--underline"
            >
              <span className="btn__mask">
                <span className="btn__text">Send on WhatsApp</span>
                <span className="btn__text btn__text--clone">Send on WhatsApp</span>
              </span>
            </a>
            <Link href="/about#certifications" className="btn btn--underline">
              <span className="btn__mask">
                <span className="btn__text">See the Certifications</span>
                <span className="btn__text btn__text--clone">See the Certifications</span>
              </span>
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
