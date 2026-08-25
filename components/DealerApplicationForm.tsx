'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { consentText } from '@/content/pages';
import {
  ENTITY_TYPES, STATES, VOLUME_BANDS, gstinChecksumOk, type GstinVerification,
} from '@/lib/dealers';

/* Module 10, step 01 on screen. Mirrors InquiryForm's shape so the public
   forms behave identically; the rules themselves live in lib/dealers.ts and
   are enforced again server-side (hard rule 3) — this is only the first pass. */

const TEXT_FIELDS = [
  { name: 'firmName', label: 'Firm name', type: 'text', span: true },
  { name: 'pan', label: 'PAN', type: 'text', placeholder: 'ABCDE1234F' },
  /* checksum-valid dummy, so a curious applicant pasting the placeholder gets
     as far as the registry rather than a confusing local rejection */
  { name: 'gstin', label: 'GSTIN', type: 'text', placeholder: '24ABCDE1234F1Z6' },
  { name: 'contactName', label: 'Signatory name', type: 'text' },
  { name: 'signatoryMobile', label: 'Aadhaar-linked mobile', type: 'tel', placeholder: '98765 43210' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'PIN code', type: 'text' },
] as const;

export default function DealerApplicationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ id: string; firmName: string } | null>(null);
  const [territory, setTerritory] = useState<{ state: string; district: string }>({ state: '', district: '' });
  const [availability, setAvailability] = useState<'unknown' | 'free' | 'taken'>('unknown');
  const [gst, setGst] = useState<GstinVerification | null>(null);
  const [gstChecking, setGstChecking] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  /* the last GSTIN we actually spent a lookup on — every lookup is a paid
     Digio call and a slot against the per-IP throttle, so re-blurring an
     unchanged field must not spend another one */
  const lastGstin = useRef('');

  /* One District, One Dealer: tell the applicant before they fill in KYC
     detail for a territory that is already appointed. Advisory — the binding
     check is the conditional write when Orkay approves. */
  async function checkTerritory(next: { state: string; district: string }) {
    setTerritory(next);
    setAvailability('unknown');
    if (!next.state || next.district.trim().length < 2) return;
    try {
      const res = await fetch(`/api/dealers?state=${encodeURIComponent(next.state)}&district=${encodeURIComponent(next.district)}`);
      const json = await res.json();
      if (json.ok) setAvailability(json.available ? 'free' : 'taken');
    } catch {
      /* leave it unknown — the form still submits, the server decides */
    }
  }

  /* GST verification. The check digit is verified in the browser first, so a
     typo never reaches the registry; only a well-formed GSTIN is looked up.
     The answer here is for the applicant's benefit — the route runs the same
     lookup server-side at submit, and that is the one that is stored. */
  async function checkGstin(raw: string) {
    const gstin = raw.trim().toUpperCase();
    if (gstin === lastGstin.current) return;
    if (!gstinChecksumOk(gstin)) {
      lastGstin.current = gstin;
      /* A complete-but-wrong GSTIN gets the same wording the server would
         send back, immediately, without spending a lookup on it. Anything
         shorter is still being typed, so say nothing yet. */
      setGst(gstin.length === 15
        ? {
          verified: false,
          mode: 'live',
          reason: 'That GSTIN fails its own check digit — look for a typo.',
          at: new Date().toISOString(),
        }
        : null);
      return;
    }
    lastGstin.current = gstin;
    setGstChecking(true);
    try {
      const res = await fetch('/api/verify/gstin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin }),
      });
      const json = await res.json();
      /* The applicant may have corrected the field while this was in flight.
         A verdict for a GSTIN that is no longer in the box is worse than no
         verdict at all — it would block a submission over a stale answer. */
      if (lastGstin.current !== gstin) return;
      const result: GstinVerification | null = json.ok ? json.result : null;
      setGst(result);
      /* Fill the firm name from the registry only when the applicant has not
         written one — their own wording should never be overwritten. */
      const firm = formRef.current?.elements.namedItem('firmName');
      if (result?.verified && result.legalName && firm instanceof HTMLInputElement && !firm.value.trim()) {
        firm.value = result.legalName;
      }
    } catch {
      /* an unreachable check is not a verdict — leave the field alone */
      if (lastGstin.current === gstin) setGst(null);
    } finally {
      if (lastGstin.current === gstin) setGstChecking(false);
    }
  }

  /* Only a positive "the registry says no" stops the form. A lookup we could
     not make leaves the applicant free to submit; the desk verifies by hand. */
  const gstBlocks = gst !== null && !gst.verified && gst.mode === 'live';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    try {
      const res = await fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setDone({ id: json.application.id, firmName: json.application.firmName });
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
        <p className="h-mid">Application received.</p>
        <p className="text-small">
          {done.firmName} is in the queue for KYC and territory approval. Our dealer desk will be in
          touch, and once approved you will receive the agreement for Aadhaar OTP signature — no
          paper, no courier.
        </p>
        <p className="text-small" style={{ marginTop: 16 }}>
          Your reference: <strong>{done.id.slice(0, 8).toUpperCase()}</strong>
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry" ref={formRef} onSubmit={onSubmit} noValidate>
      <p className="text-small inquiry__kicker">Dealer application</p>

      <div className="inquiry__grid">
        {TEXT_FIELDS.map((f) => (
          <div className={`field${'span' in f && f.span ? ' field--wide' : ''}`} key={f.name}>
            <label className="text-small" htmlFor={`d-${f.name}`}>{f.label} *</label>
            <input
              id={`d-${f.name}`}
              name={f.name}
              type={f.type}
              autoComplete="off"
              placeholder={'placeholder' in f ? f.placeholder : undefined}
              onBlur={f.name === 'gstin' ? (e) => checkGstin(e.target.value) : undefined}
            />
            {errors[f.name] && <span className="field__error text-small">{errors[f.name]}</span>}

            {f.name === 'gstin' && !errors.gstin && gstChecking && (
              <span className="text-small field__note">Checking with the GST registry…</span>
            )}
            {f.name === 'gstin' && !errors.gstin && !gstChecking && gst?.verified && (
              <span className="text-small field__ok">
                {gst.legalName}
                {gst.registrationStatus ? ` — ${gst.registrationStatus}` : ''}
              </span>
            )}
            {f.name === 'gstin' && !errors.gstin && !gstChecking && gst && !gst.verified && gst.mode === 'live' && (
              <span className="field__error text-small">{gst.reason}</span>
            )}
            {f.name === 'gstin' && !errors.gstin && !gstChecking && gst?.mode === 'unchecked' && (
              <span className="text-small field__note">
                Format accepted. We will verify this GSTIN against the registry during KYC.
              </span>
            )}
          </div>
        ))}

        <div className="field">
          <label className="text-small" htmlFor="d-entityType">Entity type *</label>
          <select id="d-entityType" name="entityType" defaultValue={ENTITY_TYPES[0]}>
            {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="text-small" htmlFor="d-state">State *</label>
          <select
            id="d-state"
            name="state"
            defaultValue=""
            onChange={(e) => checkTerritory({ ...territory, state: e.target.value })}
          >
            <option value="" disabled>Choose a state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <span className="field__error text-small">{errors.state}</span>}
        </div>

        <div className="field">
          <label className="text-small" htmlFor="d-district">District *</label>
          <input
            id="d-district"
            name="district"
            type="text"
            autoComplete="off"
            onBlur={(e) => checkTerritory({ ...territory, district: e.target.value })}
          />
          {errors.district && <span className="field__error text-small">{errors.district}</span>}
          {!errors.district && availability === 'free' && (
            <span className="text-small field__note">
              This district has no appointed dealer.
            </span>
          )}
          {!errors.district && availability === 'taken' && (
            <span className="field__error text-small">
              This district already has an appointed Orkay dealer.
            </span>
          )}
        </div>

        <div className="field">
          <label className="text-small" htmlFor="d-monthlyVolume">Expected monthly volume *</label>
          <select id="d-monthlyVolume" name="monthlyVolume" defaultValue={VOLUME_BANDS[0]}>
            {VOLUME_BANDS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="field field--wide">
        <label className="text-small" htmlFor="d-address">Registered address *</label>
        <textarea id="d-address" name="address" rows={2} />
        {errors.address && <span className="field__error text-small">{errors.address}</span>}
      </div>

      <div className="field field--wide">
        <label className="text-small" htmlFor="d-currentBrands">Ranges you currently carry</label>
        <input id="d-currentBrands" name="currentBrands" type="text" autoComplete="off" />
      </div>

      <div className="field field--wide">
        <label className="text-small" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="checkbox" name="creditRequested" style={{ marginTop: 3 }} />
          <span>We would like to discuss credit terms at onboarding</span>
        </label>
      </div>

      <div className="field field--wide">
        <label className="text-small" htmlFor="d-bankReference">Bank reference (only if requesting credit)</label>
        <input id="d-bankReference" name="bankReference" type="text" autoComplete="off" />
      </div>

      <div className="field field--wide">
        <label className="text-small" htmlFor="d-notes">Anything else we should know</label>
        <textarea id="d-notes" name="notes" rows={3} />
      </div>

      <div className="field field--wide">
        <label className="text-small" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="checkbox" name="consentContact" required style={{ marginTop: 3 }} />
          <span>{consentText.contact} *</span>
        </label>
        {errors.consentContact && <span className="field__error text-small">{errors.consentContact}</span>}
      </div>

      <div className="field field--wide">
        <label className="text-small" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="checkbox" name="consentKyc" required style={{ marginTop: 3 }} />
          <span>
            I consent to Orkay Tiles verifying the firm details above — including a GSTIN check
            against the GST registry — and to signing the dealer agreement using an Aadhaar OTP
            e-signature through Digio. *
          </span>
        </label>
        {errors.consentKyc && <span className="field__error text-small">{errors.consentKyc}</span>}
        <p className="text-small field__note">
          How we use your details:{' '}
          <Link href="/legal/privacy" className="field__link">Privacy Policy</Link>.
        </p>
      </div>

      {errors.form && <p className="field__error text-small">{errors.form}</p>}

      <button type="submit" className="btn btn--underline btn--red" disabled={sending || gstBlocks}>
        <span className="btn__mask">
          <span className="btn__text">{sending ? 'Submitting…' : 'Submit application'}</span>
          <span className="btn__text btn__text--clone">{sending ? 'Submitting…' : 'Submit application'}</span>
        </span>
      </button>
      {gstBlocks && (
        <p className="field__error text-small">
          Correct the GSTIN to continue. If you believe it is right, email the dealer desk and we
          will check it by hand.
        </p>
      )}
    </form>
  );
}
