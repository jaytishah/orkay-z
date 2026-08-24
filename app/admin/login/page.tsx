import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Admin login — ORKAY Tiles',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  /* already signed in → straight to the panel */
  const session = await requireSession();
  if (session) redirect('/admin');

  return (
    <div className="adm-login">
      <div className="adm-login__box">
        <p className="adm-top__logo">
          <Logo variant="white" />
        </p>
        <p className="text-small adm-muted">Product CMS · authorised staff only</p>
        <LoginForm />
      </div>
    </div>
  );
}
