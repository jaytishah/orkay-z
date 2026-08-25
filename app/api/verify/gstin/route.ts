import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/auth';
import { gstinChecksumOk } from '@/lib/dealers';
import { verifyGstin } from '@/lib/digio';

/* GSTIN lookup for the dealership form.

   Public and unauthenticated, and it spends a paid Digio call, so:

   - the checksum is verified here BEFORE the registry is asked, which turns
     every typo into a free local rejection;
   - the per-IP throttle is the same one the login and the dealer application
     use — the form only calls this when the GSTIN is new and checksum-valid,
     so 8 lookups per quarter hour is generous for a human and useless for a
     scraper;
   - nothing here decides anything. The application route runs its own
     verification server-side at submit; this endpoint exists so the applicant
     sees the answer while they are still typing. */

export async function POST(request: Request) {
  const rl = rateLimit(`gstin:${clientIp(request)}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many lookups from this connection. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
    );
  }

  let body: { gstin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const gstin = (body.gstin || '').trim().toUpperCase();
  if (!gstinChecksumOk(gstin)) {
    return NextResponse.json({
      ok: true,
      result: {
        verified: false,
        mode: 'live' as const,
        reason: 'That GSTIN fails its own check digit — look for a typo.',
        at: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({ ok: true, result: await verifyGstin(gstin) });
}
