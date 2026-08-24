'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Script from 'next/script';

/* Google's website translator does the actual translating — its own <select>
   is parked off-screen and we drive it from this dropdown, so the nav keeps
   the site's type instead of Google's grey gadget.
   ponytail: machine translation, not authored copy. Swap for real locale
   files (next-intl) only if a market justifies hand-written translations. */

/* Google's element codes — zh-CN not zh, and Hebrew is 'iw' there, so it is
   left out rather than shipped broken. Flags are ISO country codes. */
const LANGS = [
  { code: 'en', label: 'English', cc: 'gb' },
  { code: 'ar', label: 'العربية', cc: 'sa' },
  { code: 'fr', label: 'Français', cc: 'fr' },
  { code: 'es', label: 'Español', cc: 'es' },
  { code: 'pt', label: 'Português', cc: 'pt' },
  { code: 'ru', label: 'Русский', cc: 'ru' },
  { code: 'de', label: 'Deutsch', cc: 'de' },
  { code: 'it', label: 'Italiano', cc: 'it' },
  { code: 'tr', label: 'Türkçe', cc: 'tr' },
  { code: 'pl', label: 'Polski', cc: 'pl' },
  { code: 'nl', label: 'Nederlands', cc: 'nl' },
  { code: 'uk', label: 'Українська', cc: 'ua' },
  { code: 'fa', label: 'فارسی', cc: 'ir' },
  { code: 'zh-CN', label: '中文', cc: 'cn' },
  { code: 'ja', label: '日本語', cc: 'jp' },
  { code: 'ko', label: '한국어', cc: 'kr' },
  { code: 'id', label: 'Indonesia', cc: 'id' },
  { code: 'vi', label: 'Tiếng Việt', cc: 'vn' },
  { code: 'th', label: 'ไทย', cc: 'th' },
  { code: 'hi', label: 'हिन्दी', cc: 'in' },
  { code: 'gu', label: 'ગુજરાતી', cc: 'in' },
  { code: 'bn', label: 'বাংলা', cc: 'bd' },
  { code: 'ur', label: 'اردو', cc: 'pk' },
  { code: 'sw', label: 'Kiswahili', cc: 'ke' },
];

/* the widget stores the active pair in a googtrans cookie ("/en/fr") and
   reads it back on every page load — that is what carries the choice across
   the collection pages, so we write it too. */
const readCookie = () =>
  document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/)?.[1] ?? 'en';

/* the cookie is the source of truth, so it is subscribed to rather than
   mirrored into state — that also keeps the server render honest at 'en' */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

function writeCookie(code: string) {
  const value = code === 'en' ? '' : `/en/${code}`;
  const kill = code === 'en' ? ';expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
  const host = location.hostname;
  /* Google writes the cookie on the bare host or the dot-domain depending on
     where it ran — clear/set both or a stale one wins on the next load */
  for (const scope of ['', `;domain=${host}`, `;domain=.${host}`])
    document.cookie = `googtrans=${value};path=/${scope}${kill}`;
}

export default function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const lang = useSyncExternalStore(subscribe, readCookie, () => 'en');
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).googleTranslateElementInit = () => {
      const g = (window as unknown as { google?: { translate?: { TranslateElement?: new (o: object, el: string) => void } } }).google;
      if (g?.translate?.TranslateElement)
        new g.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const choose = (code: string) => {
    setOpen(false);
    if (code === readCookie()) return;
    writeCookie(code);
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    /* Google drops the source language from its own list, so English can only
       be restored by clearing the cookie and reloading. Any other pair swaps
       in place — no reload, the hero animation survives. */
    if (code === 'en' || !select) {
      location.reload();
      return;
    }
    select.value = code;
    /* the assignment is a no-op when Google has no such option — the cookie
       route is the wider net, so hand it over rather than firing a change
       that would reset the page to English */
    if (select.value !== code) {
      location.reload();
      return;
    }
    select.dispatchEvent(new Event('change'));
    listeners.forEach((cb) => cb());
  };

  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="lang notranslate" translate="no" ref={box}>
      <button
        className="lang__btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language — ${active.label}`}
      >
        <Flag cc={active.cc} />
        <span className="lang__code">{active.code.slice(0, 2)}</span>
        <span className="lang__caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="lang__list" role="listbox" data-lenis-prevent>
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                className={`lang__item${l.code === lang ? ' is-active' : ''}`}
                role="option"
                aria-selected={l.code === lang}
                onClick={() => choose(l.code)}
              >
                <Flag cc={l.cc} />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* the widget itself — parked off-screen, never shown */}
      <div id="google_translate_element" />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
    </div>
  );
}

function Flag({ cc }: { cc: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="lang__flag" src={`https://flagcdn.com/w40/${cc}.png`} alt="" width={20} height={14} loading="lazy" />;
}
