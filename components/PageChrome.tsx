'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { nav } from '@/content/pages';

/* Sub-page chrome. Three slots in one fixed row — mark, centre, actions —
   and what fills them swaps once you are past the hero:

     at the top   [mark]              …            [Catalogue] [≡]
     scrolled     …        [◉ About Products … ]              [≡]

   The mark is a flat colour here (the homepage's per-frame ink clipping is
   Motion's job, and Motion does not run on these pages), so over a long page
   that alternates light and dark sections it is wrong about half the time —
   and on a split layout it lands on top of the artwork. Retiring it into a
   dark pill solves both: the pill carries its own ground, so it reads over
   any section, and it puts the nav on screen instead of behind a click.

   `polarity` still describes the section the header sits over, because the
   top state is unchanged and the burger has no ground of its own. */
export default function PageChrome({
  polarity = 'light',
  cta = { label: 'Request Catalogue', href: '/downloads' },
}: {
  polarity?: 'light' | 'dark';
  cta?: { label: string; href: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [past, setPast] = useState(false);
  const sentinel = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

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

  /* "Am I past the hero?" as an observation rather than a scroll handler:
     no listener firing on every frame, nothing to throttle, and it stays
     correct while Lenis owns the scroll. The sentinel sits at the top of the
     document and the root is grown upwards by 68% of the viewport, so it
     stops intersecting at exactly the point the hero has left. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { rootMargin: '68% 0px 0px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* the fullscreen menu already lists every destination — showing the pill
     behind it would be the same links twice, so the top state comes back */
  const showPill = past && !open;
  const dark = polarity === 'dark' || open;

  return (
    <>
      <span ref={sentinel} className="cd-sentinel" aria-hidden="true" />

      <header
        className={`cd-header${dark ? ' cd-header--dark' : ''}${showPill ? ' cd-header--past' : ''}`}
      >
        <Link href="/" className="cd-logo" aria-label="ORKAY — back to homepage">
          {/* the header inverts over dark sections and behind the open menu —
              the mark is artwork now, so swap the colourway instead of color */}
          <Logo variant={dark ? 'white' : 'dark'} />
        </Link>

        {/* The standing menu. Always rendered so the swap is a cross-fade
            rather than a mount, and `inert` while hidden so a keyboard user
            cannot tab into links they cannot see. */}
        <nav className="cd-pill" aria-label="Pages" inert={!showPill}>
          <Link href="/" className="cd-pill__mark" aria-label="ORKAY — back to homepage">
            <Logo variant="white" />
          </Link>
          <span className="cd-pill__rule" aria-hidden="true" />
          {nav.primary
            /* Home is the mark immediately to the left of these — listing it
               again spends pill width on a destination already on screen */
            .filter((l) => l.href !== '/')
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="cd-pill__link text-small"
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
        </nav>

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
