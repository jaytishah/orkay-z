'use client';

import { useRef } from 'react';

/* One CTA, one modal, one form.

   Built on the native <dialog> element rather than a portal + overlay +
   focus-trap of our own: showModal() already gives us the top layer, the
   backdrop, Escape-to-close, inert background content and the focus trap.
   Page-behind scroll locking is CSS (`html:has(dialog[open])` in
   pages.css), so there is no scroll-position bookkeeping to get wrong
   either — which matters here, because Lenis owns the page scroll. */

export default function FormDialog({
  cta, kicker, title, lede, children,
}: {
  cta: string;
  kicker: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      {/* A circle and a label rather than the site's underline button: these
          three open a form in place instead of going somewhere, and the
          round mark is what separates them from every other CTA on the page. */}
      <button type="button" className="btn-round" onClick={() => ref.current?.showModal()}>
        <span className="btn-round__circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 16 16 8" />
            <path d="M9.5 8H16v6.5" />
          </svg>
        </span>
        <span className="btn-round__label text-small">{cta}</span>
      </button>

      <dialog
        ref={ref}
        className="fd"
        aria-label={title}
        /* a click that lands on the dialog element itself is a click on the
           backdrop — the panel below stops anything inside it */
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      >
        <div className="fd__panel">
          <button
            type="button"
            className="fd__x text-small"
            onClick={() => ref.current?.close()}
          >
            Close ×
          </button>
          <p className="text-small fd__kicker">{kicker}</p>
          <h2 className="h-mid fd__title">{title}</h2>
          <p className="text-small fd__lede">{lede}</p>
          {children}
        </div>
      </dialog>
    </>
  );
}
