import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { collections, getCollection } from '@/content/collections';
import { site } from '@/content/site';
import { Footer } from '@/components/SiteChrome';
import CollectionReveal from '@/components/CollectionReveal';
import LangSwitcher from '@/components/LangSwitcher';

/* eslint-disable @next/next/no-img-element */

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: 'Collection — ORKAY Tiles' };
  return {
    title: `${c.name} — ORKAY Tiles`,
    description: `${c.desc} ${c.finish} finish, ${c.sizes}. ${c.body}. CE certified, ISO 9001:2015.`,
    openGraph: { title: `${c.name} — ORKAY Tiles`, description: c.desc, images: [c.img] },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();

  const specs: Array<[string, string]> = [
    ['Finish', c.finish],
    ['Style', c.look],
    ['Sizes', c.sizes],
    ['Body', c.body],
    ['Certification', 'CE · ISO 9001:2015'],
  ];

  return (
    <>
      <span id="top" />
      <CollectionReveal />

      <header className="cd-header">
        <Link href="/" className="cd-logo" aria-label="ORKAY — back to homepage">
          <Logo />
        </Link>
        <nav>
          <LangSwitcher />
          <Link href="/#collections" className="btn">
            <span className="btn__mask">
              <span className="btn__text">← All Collections</span>
              <span className="btn__text btn__text--clone">← All Collections</span>
            </span>
          </Link>
        </nav>
      </header>

      <main>
        <section className="cd-hero">
          <figure className="cd-hero__media img-reveal img-reveal--r">
            <img src={c.img} alt={`${c.name} slab surface`} />
          </figure>
          <div className="cd-hero__panel">
            <p className="text-small cd-kicker">Collection</p>
            <h1 className="h-display">{c.name}</h1>
            <p className="text-small cd-desc">{c.desc}</p>
            <div className="cd-specs text-small">
              {specs.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cd-apps">
          <h2 className="h-mid">Seen in place</h2>
          <div className="cd-apps__grid">
            <figure className="img-reveal">
              <img src="/img/app_interior_light.jpg" alt={`${c.name} installed — interior application`} />
            </figure>
            <figure className="img-reveal img-reveal--r">
              <img src="/img/app_interior_warm.jpg" alt={`${c.name} installed — living space`} />
            </figure>
          </div>
        </section>

        <section className="cd-cta">
          <a href={`mailto:${site.email}?subject=Sample request — ${c.name}`} className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Request Sample</span>
              <span className="btn__text btn__text--clone">Request Sample</span>
            </span>
          </a>
          <a href={`mailto:${site.email}`} className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">Talk to Export Team</span>
              <span className="btn__text btn__text--clone">Talk to Export Team</span>
            </span>
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
