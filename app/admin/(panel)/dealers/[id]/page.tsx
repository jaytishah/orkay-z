import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import DealerActions from '@/components/admin/DealerActions';

/* One application, its KYC detail, and the append-only audit trail that makes
   the e-signature defensible (§5a: EVENT# items under the same partition). */

export default async function AdminDealerDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const store = await getStore();
  const app = await store.getApplication(id);
  if (!app) notFound();
  const events = await store.listEvents(id);

  const rows: Array<[string, string]> = [
    ['Status', app.status],
    ['Dealer code', app.dealerCode || 'not issued'],
    ['Entity', app.entityType],
    ['PAN', app.pan],
    ['GSTIN', app.gstin],
    /* what OUR server was told by the registry when the application was made,
       so an approver can see whether the GSTIN was ever actually checked */
    ['GST check', app.gstVerification
      ? (app.gstVerification.verified
        ? `verified — ${app.gstVerification.legalName}${app.gstVerification.registrationStatus ? ` (${app.gstVerification.registrationStatus})` : ''}`
        : `NOT VERIFIED — ${app.gstVerification.reason || 'no reason given'}`)
      : 'not checked — this application predates GST verification'],
    ['Signatory', `${app.contactName} · +91 ${app.signatoryMobile}`],
    ['Email', app.email],
    ['Territory', `${app.district}, ${app.state}`],
    ['Address', `${app.address}, ${app.city} ${app.pincode}`],
    ['Brands carried', app.currentBrands || '—'],
    ['Monthly volume', app.monthlyVolume],
    ['Credit requested', app.creditRequested ? `Yes — ${app.bankReference || 'no bank reference given'}` : 'No'],
    ['Notes', app.notes || '—'],
    ['Digio document', app.digioDocumentId || 'not created'],
    ['Signed at', app.signedAt ? app.signedAt.replace('T', ' ').slice(0, 19) : '—'],
    ['Applied', app.createdAt.replace('T', ' ').slice(0, 19)],
  ];

  return (
    <main>
      <p className="text-small">
        <Link href="/admin/dealers" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>← All dealers</Link>
      </p>
      <h1 className="adm-h1">{app.firmName}</h1>

      <table className="adm-table text-small" style={{ maxWidth: 780 }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th style={{ width: '30%', textAlign: 'left' }}>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="adm-h1" style={{ marginTop: '6vh' }}>Actions</h2>
      <DealerActions id={app.id} status={app.status} />

      <h2 className="adm-h1" style={{ marginTop: '6vh' }}>
        Audit trail <span className="adm-muted text-small">{events.length} events</span>
      </h2>
      <table className="adm-table text-small" style={{ maxWidth: 900 }}>
        <thead>
          <tr>
            <th>When</th>
            <th>Who</th>
            <th>What</th>
            <th>Note</th>
            <th>From</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={`${e.at}-${e.action}`}>
              <td className="adm-muted">{e.at.replace('T', ' ').slice(0, 19)}</td>
              <td>{e.actor}</td>
              <td>{e.action}</td>
              <td className="adm-muted">{e.note || '—'}</td>
              <td className="adm-muted">{e.ip || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
