import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { DEALER_STATUSES, type DealerStatus } from '@/lib/dealers';

/* Module 10's approval workload — the admin queue GSI in §5a, on screen. */

type Search = Record<string, string | string[] | undefined>;

const PILL: Record<DealerStatus, string> = {
  applied: 'adm-pill',
  verified: 'adm-pill adm-pill--feat',
  signed: 'adm-pill adm-pill--feat',
  active: 'adm-pill adm-pill--on',
  rejected: 'adm-pill adm-pill--off',
};

export default async function AdminDealers({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = DEALER_STATUSES.find((s) => s === raw);

  const store = await getStore();
  const items = await store.listApplications(status);

  return (
    <main>
      <h1 className="adm-h1">
        Dealers <span className="adm-muted text-small">{items.length} in this view</span>
      </h1>

      <form className="adm-bar text-small" method="get">
        <select name="status" defaultValue={status || ''}>
          <option value="">All applications</option>
          {DEALER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
          No applications {status ? `at "${status}"` : 'yet'}. They arrive from the{' '}
          <Link href="/dealer-onboarding" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
            onboarding page
          </Link>.
        </p>
      ) : (
        <table className="adm-table text-small">
          <thead>
            <tr>
              <th>Firm</th>
              <th>Territory</th>
              <th>Contact</th>
              <th>Volume</th>
              <th>Status</th>
              <th>Dealer code</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/dealers/${a.id}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
                    {a.firmName}
                  </Link>
                  <div className="adm-muted">{a.entityType}</div>
                </td>
                <td>
                  {a.district}
                  <div className="adm-muted">{a.state}</div>
                </td>
                <td>
                  {a.contactName}
                  <div className="adm-muted">{a.email}</div>
                </td>
                <td className="adm-muted">{a.monthlyVolume}</td>
                <td><span className={PILL[a.status]}>{a.status}</span></td>
                <td className="adm-muted">{a.dealerCode || '—'}</td>
                <td className="adm-muted">{a.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
