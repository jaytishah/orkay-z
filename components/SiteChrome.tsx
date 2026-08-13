'use client';

import Link from 'next/link';

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
          <a href="#partner" className="btn btn--nav">
            <span className="btn__mask">
              <span className="btn__text">Request Catalogue</span>
              <span className="btn__text btn__text--clone">Request Catalogue</span>
            </span>
          </a>
          <button className="burger" aria-label="Open menu">
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div className="menu" aria-hidden="true">
        <nav className="menu__nav">
          <a href="#about">Manufacturing</a>
          <a href="#advantage">Why ORKAY</a>
          <a href="#products">Products</a>
          <a href="#collections">Collections</a>
          <a href="#gallery">Projects</a>
          <a href="#packing">Packing &amp; Export</a>
          <a href="#global">Global Presence</a>
          <a href="#partner">Partner With Us</a>
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
    <footer className="footer ui-dark">
      <p className="text-small">© 2026 ORKAY Tiles International</p>
      <a href="#top" className="footer__top arrow" aria-label="Back to top">
        ↑
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="footer__logo" src="/img/logo_orkay_white.png" alt="ORKAY Tiles — since 1996" />
      <p className="text-small footer__credit">Morbi · Gujarat · India</p>
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
