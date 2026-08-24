'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Row = { row: number; sku: string; status: 'created' | 'updated' | 'error'; message?: string };
type Result = { summary: { created: number; updated: number; errors: number }; report: Row[] };

export default function ImportForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/admin/import', { method: 'POST', body: new FormData(e.currentTarget) });
      const json = await res.json();
      if (!json.ok) {
        setError(json.errors?.file || json.errors?.form || 'Import failed.');
        return;
      }
      setResult(json);
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-form">
      <form className="adm-bar text-small" onSubmit={onSubmit}>
        <input type="file" name="file" accept=".csv,text/csv" required />
        <select name="mode" defaultValue="create">
          <option value="create">Create only — reject existing SKUs</option>
          <option value="upsert">Upsert — overwrite existing SKUs</option>
        </select>
        <button type="submit" className="btn btn--underline btn--red" disabled={busy}>
          <span className="btn__mask">
            <span className="btn__text">{busy ? 'Importing…' : 'Import'}</span>
            <span className="btn__text btn__text--clone">{busy ? 'Importing…' : 'Import'}</span>
          </span>
        </button>
      </form>

      {error ? <p className="text-small adm-err">{error}</p> : null}

      {result ? (
        <>
          <p className="text-small">
            <span className="adm-ok">{result.summary.created} created</span> ·{' '}
            <span className="adm-ok">{result.summary.updated} updated</span> ·{' '}
            <span className={result.summary.errors ? 'adm-err' : 'adm-muted'}>{result.summary.errors} errors</span>
          </p>
          <div className="adm-report text-small">
            {result.report.map((r) => (
              <div key={r.row}>
                <span className="adm-muted" style={{ minWidth: 64 }}>row {r.row}</span>
                <span style={{ minWidth: 140 }}>{r.sku || '—'}</span>
                <span className={r.status === 'error' ? 'adm-err' : 'adm-ok'}>{r.status}</span>
                {r.message ? <span className="adm-muted">{r.message}</span> : null}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
