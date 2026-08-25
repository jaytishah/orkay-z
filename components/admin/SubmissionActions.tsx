'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SUBMISSION_STATUSES, type SubmissionStatus } from '@/lib/submissions';

/* Working an inbox record: move its status, leave a note for whoever picks it
   up next. Which buttons exist is decided here; whether the caller is allowed
   to write is decided server-side on every request (hard rule 2). */

export default function SubmissionActions({
  id, status, adminNote,
}: {
  id: string;
  status: SubmissionStatus;
  adminNote: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState(adminNote);

  async function move(to: SubmissionStatus) {
    setBusy(to);
    setError('');
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to, adminNote: note }),
      });
      const json = await res.json();
      if (json.ok) router.refresh();
      else setError(json.errors?.form || 'Could not update this record.');
    } catch {
      setError('Network error.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="adm-form" style={{ maxWidth: 640 }}>
      <div className="adm-field adm-field--wide">
        <label className="text-small" htmlFor="sub-note">Desk note</label>
        <input
          id="sub-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. quoted 22 Aug, racks despatched via Gati"
        />
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {SUBMISSION_STATUSES.filter((s) => s !== status).map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn--underline${s === 'closed' ? '' : ' btn--red'}`}
            disabled={busy !== null}
            onClick={() => move(s)}
          >
            <span className="btn__mask">
              <span className="btn__text">{busy === s ? 'Saving…' : `Mark ${s}`}</span>
              <span className="btn__text btn__text--clone">{busy === s ? 'Saving…' : `Mark ${s}`}</span>
            </span>
          </button>
        ))}
      </div>

      {error && <p className="adm-err text-small">{error}</p>}
    </div>
  );
}
