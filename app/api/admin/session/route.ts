import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStore } from '@/lib/store';
import {
  clearRateLimit, clearSessionCookie, rateLimit, requireSession, setSessionCookie,
  signSession, verifyPassword,
} from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

/* Login. Throttled per IP and per account (hard rule 9); the same generic
   message for a missing user and a wrong password, so the endpoint does not
   confirm which accounts exist. */
export async function POST(request: Request) {
  let parsed;
  try {
    parsed = loginSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: { form: 'Enter a valid email and password.' } }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  for (const key of [`ip:${ip}`, `user:${email}`]) {
    const rl = rateLimit(key);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, errors: { form: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterS / 60)} min.` } },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
      );
    }
  }

  const store = await getStore();
  const user = await store.getUser(email);
  const ok = user && user.active && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    return NextResponse.json({ ok: false, errors: { form: 'Wrong email or password.' } }, { status: 401 });
  }

  clearRateLimit(`user:${email}`);
  await setSessionCookie(await signSession({ email: user.email, name: user.name, role: 'admin' }));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await requireSession();
  return NextResponse.json({ ok: true, session });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
