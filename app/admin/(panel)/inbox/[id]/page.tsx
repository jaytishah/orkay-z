import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { reference } from '@/lib/submissions';
import SubmissionActions from '@/components/admin/SubmissionActions';

/* One record, every field it arrived with.

   `data` is rendered generically rather than field by field: the two kinds
   carry different payloads, and a hand-written table here would silently drop
   a field the day a form gains one. Nested objects (the consent block) are
   printed as JSON — small, honest, and it makes the stored consent wording
   readable, which is the point of keeping it (CR L-05). */

/* Already on screen above the generic dump: the heading carries the name,
   "Reply to" carries the email, and the dealer code has its own row. Printing
   them a second time from `data` reads as a rendering bug, which it was. */
const SHOWN_ABOVE = new Set(['name', 'contactName', 'email', 'dealerCode']);

function label(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function render(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 1);
  return String(value);
}

export default async function AdminSubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const store = await getStore();
  const s = await store.getSubmission(id);
  if (!s) notFound();

  return (
    <main>
      <p className="text-small">
        <Link href="/admin/inbox" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>← Inbox</Link>
      </p>
      <h1 className="adm-h1">
        {s.name} <span className="adm-muted text-small">{reference(s.id)}</span>
      </h1>
      <p className="text-small adm-muted">{s.summary}</p>

      <table className="adm-table text-small" style={{ maxWidth: 820, marginTop: '3vh' }}>
        <tbody>
          <tr>
            <th style={{ width: '30%', textAlign: 'left' }}>Status</th>
            <td>{s.status}{s.handledBy ? ` · last touched by ${s.handledBy}` : ''}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left' }}>Received</th>
            <td>{s.createdAt.replace('T', ' ').slice(0, 19)}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left' }}>Reply to</th>
            <td>
              <a href={`mailto:${s.email}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>{s.email}</a>
            </td>
          </tr>
          {s.dealerCode ? (
            <tr>
              <th style={{ textAlign: 'left' }}>Dealer code</th>
              <td>{s.dealerCode}</td>
            </tr>
          ) : null}
          {Object.entries(s.data).filter(([k]) => !SHOWN_ABOVE.has(k)).map(([k, v]) => (
            <tr key={k}>
              <th style={{ textAlign: 'left' }}>{label(k)}</th>
              <td style={{ whiteSpace: 'pre-wrap' }}>{render(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="adm-h1" style={{ marginTop: '6vh' }}>Actions</h2>
      <SubmissionActions id={s.id} status={s.status} adminNote={s.adminNote} />
    </main>
  );
}
