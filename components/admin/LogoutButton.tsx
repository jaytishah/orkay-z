'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        await fetch('/api/admin/session', { method: 'DELETE' });
        router.replace('/admin/login');
        router.refresh();
      }}
    >
      <span className="btn__mask">
        <span className="btn__text">Sign out</span>
        <span className="btn__text btn__text--clone">Sign out</span>
      </span>
    </button>
  );
}
