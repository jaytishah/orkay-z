import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import LogoutButton from '@/components/admin/LogoutButton';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Admin — ORKAY Tiles',
  robots: { index: false, follow: false },
};

/* The shell for every panel page. The session is verified server-side here
   AND in each page — and every API route re-verifies before touching data
   (hard rule 2): this layout is furniture, not the fence. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="adm">
      <header className="adm-top text-small">
        <div className="adm-top__brand">
          <Link href="/admin" className="adm-top__logo" aria-label="ORKAY admin home">
            <Logo variant="white" />
          </Link>
          <span className="adm-top__tag">Product CMS</span>
        </div>
        <nav className="adm-top__nav">
          <Link href="/admin">Products</Link>
          <Link href="/admin/products/new">Add product</Link>
          <Link href="/admin/import">Import</Link>
          <Link href="/admin/dealers">Dealers</Link>
          <Link href="/admin/inbox">Inbox</Link>
          <Link href="/products" target="_blank" rel="noreferrer">View site ↗</Link>
          <span className="adm-muted">{session.email}</span>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
