import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

/* ════════════════════════════════════════════════════════════════════
   Admin sessions — quotation p.14: bcrypt one-way hashes, a signed JWT
   in an httpOnly cookie, and login throttling. The cookie is invisible
   to browser JavaScript; every write re-verifies it server-side
   (hard rule 2 — the protection is on the data operation).
   ════════════════════════════════════════════════════════════════════ */

const COOKIE = 'orkay-admin';
/* Readable companion to COOKIE, carrying no secret and granting nothing —
   it only tells the public footer whether to show the CMS link, so a visitor
   never sees it. Every authorization decision still reads COOKIE server-side.
   ponytail: a cookie the browser already sends, not a session fetch per pageview. */
const UI_HINT_COOKIE = 'orkay-admin-ui';
const SESSION_HOURS = 12;

/* SESSION_SECRET must be set in production (server-side env only — hard
   rule 1). In dev a random secret is generated once into .data/ so
   sessions survive restarts without anyone committing a secret. */
function secret(): Uint8Array {
  const env = process.env.SESSION_SECRET;
  if (env && env.length >= 32) return new TextEncoder().encode(env);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET (>=32 chars) is required in production');
  }
  const p = path.join(process.cwd(), '.data', 'dev-session-secret');
  if (!existsSync(p)) {
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, randomBytes(48).toString('hex'), { encoding: 'utf8' });
  }
  return new TextEncoder().encode(readFileSync(p, 'utf8'));
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type Session = { email: string; name: string; role: 'admin' };

export async function signSession(s: Session): Promise<string> {
  return new SignJWT(s)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.email !== 'string' || payload.role !== 'admin') return null;
    return { email: payload.email, name: String(payload.name || ''), role: 'admin' };
  } catch {
    return null;
  }
}

/** The one call every admin page and every admin API route makes. */
export async function requireSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
  jar.set(UI_HINT_COOKIE, '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  jar.set(UI_HINT_COOKIE, '', { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 0 });
}

export const SESSION_COOKIE_NAME = COOKIE;
export const UI_HINT_COOKIE_NAME = UI_HINT_COOKIE;

/* ── login throttling (hard rule 9) ──────────────────────────────────
   Sliding window per key (IP and account). In-memory: per-instance on
   Lambda, which is acceptable alongside the Cloudflare edge rules the
   quotation puts in front of the origin; a shared store can replace
   this map without touching callers. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function rateLimit(key: string): { allowed: boolean; retryAfterS: number } {
  const now = Date.now();
  const hits = (attempts.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_ATTEMPTS) {
    const retry = Math.ceil((WINDOW_MS - (now - hits[0])) / 1000);
    return { allowed: false, retryAfterS: retry };
  }
  hits.push(now);
  attempts.set(key, hits);
  return { allowed: true, retryAfterS: 0 };
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

/** Caller IP for throttling and the dealer audit trail. Behind Cloudflare and
    Amplify the origin only ever sees the forwarded chain; the first hop is the
    client. Spoofable in principle — good enough for a rate-limit key and an
    audit note, never used to authorize anything. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')
    || 'local';
}
