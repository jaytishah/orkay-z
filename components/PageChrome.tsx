'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { nav } from '@/content/pages';

/* Sub-page chrome. Carries the same three elements as the homepage header —
   mark, one text CTA, burger — so moving between pages never changes the
   furniture. The burger opens the same fullscreen menu, which is what makes
   every route reachable from every other route.

   `polarity` must match the polarity of the section the header sits over:
   the mark is a single flat colour here (the homepage's per-frame ink
   clipping is Motion's job, and Motion does not run on these pages), so a
   light mark over a light hero would simply disappear. */
export default function PageChrome({
  polarity = 'light',
  cta = { label: 'Request Catalogue', href: '/downloads' },
}: {
  polarity?: 'light' | 'dark';
  cta?: { label: string; href: string } | null;
}) {
  const [open, setOpen] = useState(false);

  /* a route change unmounts nothing here, so the menu is closed explicitly;
     Escape closes it too, and the body scroll lock is released either way */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`cd-header${polarity === 'dark' || open ? ' cd-header--dark' : ''}`}>
        <Link href="/" className="cd-logo" aria-label="ORKAY — back to homepage">
          <span className="logo__o">
            <span className="logo__dot" />
          </span>
          RKAY<span className="logo__reg">™</span>
        </Link>

        <nav className="cd-nav">
          {cta ? (
            <Link href={cta.href} className="btn btn--nav">
              <span className="btn__mask">
                <span className="btn__text">{cta.label}</span>
                <span className="btn__text btn__text--clone">{cta.label}</span>
              </span>
            </Link>
          ) : null}
          <button
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* the container is the scrim over the left half — a click on it (not on
          the panel or a link) closes the drawer */}
      <div
        className={`menu${open ? ' is-open' : ''}`}
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <nav className="menu__nav">
          {nav.primary.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
