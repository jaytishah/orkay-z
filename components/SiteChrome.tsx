'use client';

import Link from 'next/link';
import { contact, products, site } from '@/content/site';

/* The fixed brand mark rides above the whole page. Two stacked layers:
   a white base and a black "ink" clone whose clip-path Motion.tsx
   recomputes every frame against the light sections beneath it. */
function LogoLayers() {
  return (
    <>
      <span className="logo__o">
        <span className="logo__dot" />
      </span>
      <span className="logo__rest">RKAY</span>
      <span className="logo__reg">®</span>
      <span className="logo__tag">Tiles &nbsp;·&nbsp; since 1996</span>
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
          <a href="#formats" className="btn btn--nav">
            <span className="btn__mask">
              <span className="btn__text">Request Catalogue</span>
              <span className="btn__text btn__text--clone">Request Catalogue</span>
            </span>
          </a>
          <button className="burger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div className="menu" aria-hidden="true">
        <nav className="menu__nav">
          <a href="#top">Home</a>
          <a href="#about">About Us</a>
          <a href="#ranges">Products</a>
          <a href="#contact">Contact Us</a>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer__logo" src="/img/logo_orkay_white.png" alt="ORKAY Tiles — since 1996" />
          <p className="text-small footer__blurb">
            Ceramic wall tiles, digital porcelain, glazed and double-charged vitrified —
            pressed, fired and packed on seven lines we own in Morbi.
          </p>
          <ul className="footer__socials text-small">
            {contact.socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noreferrer" className="footer__link">{s.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer__col" aria-label="Sections">
          <p className="text-small footer__head">Explore</p>
          <a href="#top" className="text-small footer__link">Home</a>
          <a href="#about" className="text-small footer__link">About Us</a>
          <a href="#ranges" className="text-small footer__link">Our Products</a>
          <a href="#formats" className="text-small footer__link">Formats</a>
          <a href="#services" className="text-small footer__link">Services</a>
        </nav>

        <nav className="footer__col" aria-label="Products">
          <p className="text-small footer__head">Our Products</p>
          {products.map((p) => (
            <a href="#ranges" key={p.name} className="text-small footer__link">{p.name}</a>
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
        </address>
      </div>

      <div className="footer__base">
        <p className="text-small">© 2026 ORKAY Tiles International</p>
        <a href="#top" className="footer__top arrow" aria-label="Back to top">
          ↑
        </a>
        <p className="text-small footer__credit">{site.certs}</p>
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
