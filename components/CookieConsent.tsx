'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/* Cookie consent (CR L-02). Two categories — necessary and analytics — with
   granular accept / reject and a way back in via the footer's "Cookie settings".
   The choice is stored locally with a timestamp; analytics must read it
   before loading (nothing loads before consent). No third-party CMP. */

const KEY = 'orkay-consent';
type Choice = { analytics: boolean; at: string };

export function readConsent(): Choice | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Choice) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /* consent lives in localStorage, which the server cannot see — so the first
       render is closed everywhere and the banner opens a tick later on the
       client if no choice is stored (no hydration mismatch, no setState-in-effect) */
    const t = setTimeout(() => {
      if (!readConsent()) setOpen(true);
    }, 0);
    /* the footer button is rendered by a server component — it signals by attribute */
    const onClick = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest('[data-consent-open]')) setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const choose = (analytics: boolean) => {
    const choice: Choice = { analytics, at: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(choice));
    } catch {
      /* storage blocked — the banner simply asks again next visit */
    }
    window.dispatchEvent(new CustomEvent('orkay:consent', { detail: choice }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="consent" role="dialog" aria-label="Cookie settings" aria-live="polite">
      <p className="text-small consent__text">
        This site uses one necessary cookie to remember your choice, and analytics cookies only
        if you accept them. Details in the{' '}
        <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>
      <div className="consent__actions">
        <button type="button" className="btn btn--underline btn--red" onClick={() => choose(true)}>
          <span className="btn__mask">
            <span className="btn__text">Accept analytics</span>
            <span className="btn__text btn__text--clone">Accept analytics</span>
          </span>
        </button>
        <button type="button" className="btn btn--underline" onClick={() => choose(false)}>
          <span className="btn__mask">
            <span className="btn__text">Necessary only</span>
            <span className="btn__text btn__text--clone">Necessary only</span>
          </span>
        </button>
      </div>
    </div>
  );
}
