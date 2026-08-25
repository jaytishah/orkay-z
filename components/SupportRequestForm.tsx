'use client';

import { useState } from 'react';
import Link from 'next/link';
import { consentText } from '@/content/pages';
import {
  DEALER_CODE, SUPPORT_TYPES, SUPPORT_URGENCY, normaliseDealerCode,
} from '@/lib/submissions';

/* Contact form 03 — dealer support programme.

   Same shape as InquiryForm and DealerApplicationForm so all three behave
   identically; the rules live in lib/submissions.ts and are enforced again
   server-side (hard rule 3). The dealer code check below is advisory — it
   tells a dealer they mistyped before they fill in the rest. The binding
   check is in the route, against the DEALERCODE reservation. */

const TEXT_FIELDS = [
  { name: 'contactName', label: 'Your name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Mobile', type: 'tel', placeholder: '98765 43210' },
  { name: 'showroomName', label: 'Showroom name', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
] as const;

type Account = {
  state: 'unknown' | 'checking' | 'found' | 'missing';
  firmName?: string;
  territory?: string;
};

export default function SupportRequestForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ reference: string; firmName: string } | null>(null);
  const [account, setAccount] = useState<Account>({ state: 'unknown' });
  const [code, setCode] = useState('');

  async function checkCode(raw: string) {
    const next = normaliseDealerCode(raw);
    setCode(next);
    if (!DEALER_CODE.test(next)) {
      setAccount({ state: 'unknown' });
      return;
    }
    setAccount({ state: 'checking' });
    try {
      const res = await fetch(`/api/support?code=${encodeURIComponent(next)}`);
      const json = await res.json();
      setAccount(json.ok && json.valid
        ? { state: 'found', firmName: json.firmName, territory: json.territory }
        : { state: 'missing' });
    } catch {
      /* leave it unknown — the form still submits and the server decides */
      setAccount({ state: 'unknown' });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setDone({ reference: json.reference, firmName: json.firmName });
      else setErrors(json.errors || { form: 'Something went wrong.' });
    } catch {
      setErrors({ form: 'Network error. Please email the dealer desk directly.' });
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="inquiry inquiry--sent">
        <p className="h-mid">Request logged.</p>
        <p className="text-small">
          Your request is with the dealer desk against {done.firmName}. Support requests are
          answered within one business day; anything involving stock or a batch hold is confirmed
          in writing before it is reserved.
        </p>
        <p className="text-small" style={{ marginTop: 16 }}>
          Your reference: <strong>{done.reference}</strong>
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry" onSubmit={onSubmit} noValidate>
      <p className="text-small inquiry__kicker">Dealer support request</p>

      <div className="field field--wide">
        <label className="text-small" htmlFor="s-dealerCode">Your ORKAY dealer code *</label>
        <input
          id="s-dealerCode"
          name="dealerCode"
          type="text"
          autoComplete="off"
          placeholder="ORK-4KJ7QP"
          value={code}
          onChange={(e) => setCode(normaliseDealerCode(e.target.value))}
          onBlur={(e) => checkCode(e.target.value)}
        />
        {errors.dealerCode && <span className="field__error text-small">{errors.dealerCode}</span>}
        {!errors.dealerCode && account.state === 'checking' && (
          <span className="text-small field__note">Checking…</span>
        )}
        {!errors.dealerCode && account.state === 'found' && (
          <span className="text-small field__ok">
            {account.firmName} — {account.territory}
          </span>
        )}
        {!errors.dealerCode && account.state === 'missing' && (
          <span className="field__error text-small">
            No active dealer account for that code. It is printed on your signed agreement — or
            email the dealer desk and we will look it up.
          </span>
        )}
        {account.state !== 'found' && (
          <span className="text-small field__note">
            Not appointed yet?{' '}
            <Link href="/dealer-onboarding" className="field__link">Apply for a dealership</Link> first.
          </span>
        )}
      </div>

      <div className="inquiry__grid">
        {TEXT_FIELDS.map((f) => (
          <div className="field" key={f.name}>
            <label className="text-small" htmlFor={`s-${f.name}`}>{f.label} *</label>
            <input
              id={`s-${f.name}`}
              name={f.name}
              type={f.type}
              autoComplete="off"
              placeholder={'placeholder' in f ? f.placeholder : undefined}
            />
            {errors[f.name] && <span className="field__error text-small">{errors[f.name]}</span>}
          </div>
        ))}

        <div className="field">
          <label className="text-small" htmlFor="s-requestType">What do you need *</label>
          <select id="s-requestType" name="requestType" defaultValue={SUPPORT_TYPES[0]}>
            {SUPPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="text-small" htmlFor="s-quantity">How much / how many</label>
          <input
            id="s-quantity"
            name="quantity"
            type="text"
            autoComplete="off"
            placeholder="2 racks + 1 sample board"
          />
        </div>

        <div className="field">
          <label className="text-small" htmlFor="s-urgency">Timing</label>
          <select id="s-urgency" name="urgency" defaultValue={SUPPORT_URGENCY[0]}>
            {SUPPORT_URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="field field--wide">
        <label className="text-small" htmlFor="s-details">Details *</label>
        <textarea
          id="s-details"
          name="details"
          rows={3}
          placeholder="Ranges to display, project name and quantity, or what went wrong"
        />
        {errors.details && <span className="field__error text-small">{errors.details}</span>}
      </div>

      <div className="field field--wide">
        <label className="text-small" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="checkbox" name="consentContact" required style={{ marginTop: 3 }} />
          <span>{consentText.contact} *</span>
        </label>
        {errors.consentContact && <span className="field__error text-small">{errors.consentContact}</span>}
        <p className="text-small field__note">
          How we use your details: <Link href="/legal/privacy" className="field__link">Privacy Policy</Link>.
        </p>
      </div>

      {errors.form && <p className="field__error text-small">{errors.form}</p>}

      <button type="submit" className="btn btn--underline btn--red" disabled={sending}>
        <span className="btn__mask">
          <span className="btn__text">{sending ? 'Sending…' : 'Submit request'}</span>
          <span className="btn__text btn__text--clone">{sending ? 'Sending…' : 'Submit request'}</span>
        </span>
      </button>
    </form>
  );
}
