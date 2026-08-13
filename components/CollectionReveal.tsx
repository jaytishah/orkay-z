'use client';

import { useEffect } from 'react';

/* Position-based, not IntersectionObserver: Chrome reports zero intersection
   for elements hidden by their own clip-path, so IO never fires the reveal. */
export default function CollectionReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.img-reveal, .reveal-lines'));
    const check = () => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * 0.88 && r.bottom > 0) el.classList.add('is-inview');
      });
    };
    check();
    addEventListener('scroll', check, { passive: true });
    return () => removeEventListener('scroll', check);
  }, []);

  return null;
}
