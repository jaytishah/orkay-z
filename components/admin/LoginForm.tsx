'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        const from = params.get('from');
        router.replace(from && from.startsWith('/admin') ? from : '/admin');
        router.refresh();
        return;
      }
      setError(json.errors?.form || 'Login failed.');
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-form" onSubmit={onSubmit}>
      <div className="adm-field">
        <label className="text-small" htmlFor="a-email">Email</label>
        <input id="a-email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="adm-field">
        <label className="text-small" htmlFor="a-password">Password</label>
        <input id="a-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error ? <p className="text-small adm-err">{error}</p> : null}
      <button type="submit" className="btn btn--underline btn--red" disabled={busy}>
        <span className="btn__mask">
          <span className="btn__text">{busy ? 'Signing in…' : 'Sign in'}</span>
          <span className="btn__text btn__text--clone">{busy ? 'Signing in…' : 'Sign in'}</span>
        </span>
      </button>
    </form>
  );
}
