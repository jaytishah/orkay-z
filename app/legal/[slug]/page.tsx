import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import { legalPages } from '@/content/pages';
import { contact } from '@/content/site';
import '../../pages.css';

export function generateStaticParams() {
  return legalPages.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((l) => l.slug === slug);
  if (!page) return { title: 'Legal — ORKAY Tiles' };
  return { title: `${page.title} — ORKAY Tiles`, description: page.summary, robots: { index: true } };
}

/* One template for the four policy pages (CR §7). The copy is a standard
   template flagged as a draft — Orkay's legal review replaces the wording,
   the structure and the footer links stay. */
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages.find((l) => l.slug === slug);
  if (!page) notFound();

  return (
    <>
      <span id="top" />
      <PageChrome />
      <main className="pg-main">
        <section className="section pg-hero ui-light" data-polarity="light">
          <p className="text-small pg-hero__kicker">Legal</p>
          <h1 className="h-display pg-hero__title">{page.title}</h1>
          <p className="pg-hero__lede">{page.summary}</p>
          <p className="text-small pg-item__desc">
            {page.updated}
            <em className="pg-todo">Template — for Orkay&apos;s legal review</em>
          </p>
        </section>

        <section className="section pg ui-light" data-polarity="light">
          <div className="pg-steps" style={{ marginTop: 0 }}>
            {page.sections.map((s, i) => (
              <article className="pg-step" key={s.h}>
                <p className="text-small pg-step__n">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="text-small">{s.h}</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  {s.p.map((para, n) => (
                    <p className="text-small pg-step__desc" key={n}>{para}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="text-small pg__lede" style={{ marginTop: '6vh' }}>
            Questions about this policy: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: '4vh' }}>
            {legalPages.filter((l) => l.slug !== page.slug).map((l) => (
              <Link key={l.slug} href={`/legal/${l.slug}`} className="btn btn--underline">
                <span className="btn__mask">
                  <span className="btn__text">{l.title}</span>
                  <span className="btn__text btn__text--clone">{l.title}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
