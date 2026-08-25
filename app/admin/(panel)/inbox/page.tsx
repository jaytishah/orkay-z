import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import {
  SUBMISSION_KINDS, SUBMISSION_STATUSES, reference,
  type SubmissionKind, type SubmissionStatus,
} from '@/lib/submissions';

/* The inbox: everything the contact page collects that is not a dealer
   application. Dealer applications keep their own queue at /admin/dealers,
   because they carry a status ladder, a territory reservation and a
   signature — this list is for records that only need reading and closing. */

type Search = Record<string, string | string[] | undefined>;

const LABEL: Record<SubmissionKind, string> = {
  inquiry: 'General enquiry',
  support: 'Dealer support',
};

const PILL: Record<SubmissionStatus, string> = {
  new: 'adm-pill adm-pill--feat',
  open: 'adm-pill',
  closed: 'adm-pill adm-pill--off',
};

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v || undefined;
}

export default async function AdminInbox({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const sp = await searchParams;
  const kind = SUBMISSION_KINDS.find((k) => k === one(sp.kind));
  const status = SUBMISSION_STATUSES.find((s) => s === one(sp.status));

  const store = await getStore();
  const items = await store.listSubmissions(kind, status);
  const unread = items.filter((s) => s.status === 'new').length;

  return (
    <main>
      <h1 className="adm-h1">
        Inbox{' '}
        <span className="adm-muted text-small">
          {items.length} in this view{unread ? ` · ${unread} new` : ''}
        </span>
      </h1>

      <form className="adm-bar text-small" method="get">
        <select name="kind" defaultValue={kind || ''}>
          <option value="">Enquiries + support</option>
          {SUBMISSION_KINDS.map((k) => <option key={k} value={k}>{LABEL[k]}</option>)}
        </select>
        <select name="status" defaultValue={status || ''}>
          <option value="">Any status</option>
          {SUBMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn btn--underline">
          <span className="btn__mask">
            <span className="btn__text">Filter</span>
            <span className="btn__text btn__text--clone">Filter</span>
          </span>
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-small adm-muted">
          Nothing here {status ? `at "${status}"` : 'yet'}. Records arrive from the{' '}
          <Link href="/contact" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
            contact page
          </Link>.
        </p>
      ) : (
        <table className="adm-table text-small">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Kind</th>
              <th>From</th>
              <th>About</th>
              <th>Dealer code</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/inbox/${s.id}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
                    {reference(s.id)}
                  </Link>
                </td>
                <td className="adm-muted">{LABEL[s.kind]}</td>
                <td>
                  {s.name}
                  <div className="adm-muted">{s.email}</div>
                </td>
                <td className="adm-muted">{s.summary}</td>
                <td className="adm-muted">{s.dealerCode || '—'}</td>
                <td><span className={PILL[s.status]}>{s.status}</span></td>
                <td className="adm-muted">{s.createdAt.replace('T', ' ').slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
