'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DealerStatus } from '@/lib/dealers';

/* The panel's half of Module 10's approval flow. Which buttons exist is
   decided here for the operator's benefit; which moves are *allowed* is
   decided server-side against ALLOWED_TRANSITIONS. A hidden button is not
   access control (hard rule 2). */

export default function DealerActions({ id, status }: { id: string; status: DealerStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [signUrl, setSignUrl] = useState('');
  const [note, setNote] = useState('');

  async function move(to: DealerStatus) {
    if (to === 'rejected' && !confirm('Reject this application? The applicant keeps their record, but the territory is released.')) return;
    setBusy(to);
    setError('');
    try {
      const res = await fetch(`/api/admin/dealers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, note }),
      });
      const json = await res.json();
      if (json.ok) router.refresh();
      else setError(json.errors?.form || 'Could not update this application.');
    } catch {
      setError('Network error.');
    } finally {
      setBusy(null);
    }
  }

  async function sendForSignature() {
    setBusy('esign');
    setError('');
    try {
      const res = await fetch(`/api/admin/dealers/${id}/esign`, { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        /* live: Digio has notified the signatory and the URL is a copy for the
           desk. stub: this link is the only way to complete the flow locally. */
        setSignUrl(json.signUrl || '');
        router.refresh();
      } else {
        setError(json.errors?.form || 'Could not start the signature.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setBusy(null);
    }
  }

  if (status === 'active' || status === 'rejected') {
    return <p className="text-small adm-muted">This application is closed — no further action.</p>;
  }

  return (
    <div className="adm-form" style={{ maxWidth: 640 }}>
      {(status === 'applied' || status === 'verified') && (
        <div className="adm-field adm-field--wide">
          <label className="text-small" htmlFor="dealer-note">Note for the audit trail</label>
          <input
            id="dealer-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. GST and PAN verified against the uploaded documents"
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {status === 'applied' && (
          <button type="button" className="btn btn--underline btn--red" disabled={busy !== null} onClick={() => move('verified')}>
            <span className="btn__mask">
              <span className="btn__text">{busy === 'verified' ? 'Approving…' : 'KYC passed — approve territory'}</span>
              <span className="btn__text btn__text--clone">{busy === 'verified' ? 'Approving…' : 'KYC passed — approve territory'}</span>
            </span>
          </button>
        )}

        {status === 'verified' && (
          <button type="button" className="btn btn--underline btn--red" disabled={busy !== null} onClick={sendForSignature}>
            <span className="btn__mask">
              <span className="btn__text">{busy === 'esign' ? 'Sending…' : 'Send for Aadhaar e-Sign'}</span>
              <span className="btn__text btn__text--clone">{busy === 'esign' ? 'Sending…' : 'Send for Aadhaar e-Sign'}</span>
            </span>
          </button>
        )}

        {status === 'signed' && (
          <p className="text-small adm-muted">
            Signed. The dealer code is issued automatically — if none appears above, the audit trail says why.
          </p>
        )}

        {(status === 'applied' || status === 'verified') && (
          <button type="button" className="btn btn--underline" disabled={busy !== null} onClick={() => move('rejected')}>
            <span className="btn__mask">
              <span className="btn__text">{busy === 'rejected' ? 'Rejecting…' : 'Reject'}</span>
              <span className="btn__text btn__text--clone">{busy === 'rejected' ? 'Rejecting…' : 'Reject'}</span>
            </span>
          </button>
        )}
      </div>

      {signUrl && (
        <p className="adm-ok text-small">
          Signature request created.{' '}
          <a href={signUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Open the signing link
          </a>{' '}
          — the signatory also receives it from Digio.
        </p>
      )}
      {error && <p className="adm-err text-small">{error}</p>}
    </div>
  );
}
