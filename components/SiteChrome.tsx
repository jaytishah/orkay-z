'use client';

import Link from 'next/link';
import { contact, site } from '@/content/site';
import { company, legalPages, nav } from '@/content/pages';

/* The fixed brand mark rides above the whole page. Two stacked layers:
   a white base and a black "ink" clone whose clip-path Motion.tsx
   recomputes every frame against the light sections beneath it.
   Lockup per CR G-02 option B: the tag reads "TILES" only — the year lives
   in the hero wordmark and the footer, so it is not repeated in one view. */
function LogoLayers() {
  return (
    <>
      <span className="logo__o">
        <span className="logo__dot" />
      </span>
      <span className="logo__rest">RKAY</span>
      <span className="logo__reg">™</span>
      <span className="logo__tag">Tiles</span>
    </>
  );
}

export default function SiteChrome() {
  return (
    <>
      <a href="#top" className="logo" aria-label="ORKAY — back to top">
        <span className="logo__layer logo__layer--base">
          <LogoLayers />
        </span>
        <span className="logo__layer logo__layer--ink" aria-hidden="true">
          <LogoLayers />
        </span>
      </a>

      <header className="header">
        <nav className="header__nav">
          <Link href="/downloads" className="btn btn--nav">
            <span className="btn__mask">
              <span className="btn__text">Request Catalogue</span>
              <span className="btn__text btn__text--clone">Request Catalogue</span>
            </span>
          </Link>
          <button className="burger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* every destination comes from content/pages.ts, so a route cannot
          exist without a way to reach it from the menu */}
      <div className="menu" aria-hidden="true">
        <nav className="menu__nav">
          {nav.primary.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="scrollbar">
        <span className="scrollbar__thumb" />
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer ui-dark" id="contact">
      <div className="footer__grid">
        <div className="footer__brand">
          {/* set in type rather than the old PNG so the ™ (CR G-01) is code */}
          <p className="footer__wordmark" aria-label="ORKAY Tiles">
            <span className="logo__o">
              <span className="logo__dot" />
            </span>
            RKAY<span className="logo__reg">™</span>
          </p>
          <p className="text-small footer__since">Tiles · since 1996</p>
          <p className="text-small footer__blurb">
            Ceramic tiles, vitrified porcelain tiles and porcelain slab tiles —
            pressed, fired and packed on seven units we own in Morbi.
          </p>
          <ul className="footer__socials text-small">
            {contact.socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noreferrer" className="footer__link">{s.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer__col" aria-label="Explore">
          <p className="text-small footer__head">Explore</p>
          {nav.explore.map((l) => (
            <Link key={l.href} href={l.href} className="text-small footer__link">
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label="Our Products">
          <p className="text-small footer__head">Our Products</p>
          {nav.ranges.map((l) => (
            <Link key={l.href} href={l.href} className="text-small footer__link">
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label="Trade">
          <p className="text-small footer__head">Trade</p>
          {nav.trade.map((l) => (
            <Link key={l.href} href={l.href} className="text-small footer__link">
              {l.label}
            </Link>
          ))}
        </nav>

        <address className="footer__col">
          <p className="text-small footer__head">Contact</p>
          <p className="text-small footer__addr">{contact.address}</p>
          <a href={`tel:${contact.exportPhone.replace(/\s/g, '')}`} className="text-small footer__link">
            {contact.exportPhone} · Export
          </a>
          <a href={`tel:${contact.domesticPhone.replace(/\s/g, '')}`} className="text-small footer__link">
            {contact.domesticPhone} · Domestic
          </a>
          <a href={`mailto:${contact.email}`} className="text-small footer__link">{contact.email}</a>
          <Link href="/contact" className="text-small footer__link">All contact desks →</Link>
        </address>
      </div>

      <div className="footer__base">
        <p className="text-small">© 2026 {site.name}</p>
        <a href="#top" className="footer__top arrow" aria-label="Back to top">
          ↑
        </a>
        <p className="text-small footer__credit">{site.certs}</p>
      </div>

      {/* the one place the legal entity is named on the site (CR G-06 / L-07) */}
      <div className="footer__legal text-small">
        <span>
          {company.legalName} · {company.entity} · IEC {company.iec} · {company.address} · GST: to be confirmed
        </span>
        {legalPages.map((l) => (
          <Link key={l.slug} href={`/legal/${l.slug}`}>{l.title}</Link>
        ))}
        <button type="button" className="footer__link" data-consent-open>
          Cookie settings
        </button>
      </div>
    </footer>
  );
}

export function BackToCollections() {
  return (
    <Link href="/#collections" className="btn">
      <span className="btn__mask">
        <span className="btn__text">← All Collections</span>
        <span className="btn__text btn__text--clone">← All Collections</span>
      </span>
    </Link>
  );
}
