import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { clientIp, rateLimit } from '@/lib/auth';
import { verifyGstin } from '@/lib/digio';
import { forwardLead } from '@/lib/ghl';
import { getStore } from '@/lib/store';
import {
  dealerApplicationSchema, districtKey, publicView, toApplication, STATES,
} from '@/lib/dealers';

/* Module 10, step 01 — "Apply online".

   Public and unauthenticated, so everything that protects it lives here:
   per-IP throttling, Zod before any write (hard rule 3), and a response that
   never echoes back what the applicant sent about somebody else's territory. */

/** Territory availability for the form's district field — One District, One Dealer. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const district = url.searchParams.get('district') || '';
  if (!STATES.includes(state as (typeof STATES)[number]) || district.trim().length < 2) {
    return NextResponse.json({ ok: false, errors: { district: 'Choose a state and district.' } }, { status: 400 });
  }
  const store = await getStore();
  const holder = await store.reservationHolder('DISTRICT', districtKey(state, district));
  /* Advisory only: it tells the applicant not to waste an application. The
     binding check is the conditional write at approval — never this read. */
  return NextResponse.json({ ok: true, available: holder === null });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`dealer:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, errors: { form: `Too many applications from this connection. Try again in ${Math.ceil(rl.retryAfterS / 60)} min.` } },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }

  const parsed = dealerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.') || 'form'] = issue.message;
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const store = await getStore();
  const key = districtKey(parsed.data.state, parsed.data.district);

  /* Turn away an application for a district that is already appointed, so the
     applicant is not left waiting on a decision that cannot go their way. */
  if (await store.reservationHolder('DISTRICT', key)) {
    return NextResponse.json(
      { ok: false, errors: { district: 'This district already has an appointed Orkay dealer. Talk to the dealer desk about neighbouring territory.' } },
      { status: 409 },
    );
  }

  /* GST verification, server-side — the form ran the same lookup while the
     applicant typed, but what gets stored is what OUR server asked the
     registry, never what the browser claims it was told.

     A positive "this GSTIN is invalid or cancelled" blocks the application.
     A lookup we could not make (no Digio credentials yet, registry down)
     does not: it is recorded as mode 'unchecked' and the desk verifies by
     hand at approval. An outage at Digio must not stop every dealer
     application in India. */
  const gstVerification = await verifyGstin(parsed.data.gstin);
  if (!gstVerification.verified && gstVerification.mode === 'live') {
    return NextResponse.json(
      { ok: false, errors: { gstin: gstVerification.reason || 'The GST registry could not confirm this GSTIN.' } },
      { status: 400 },
    );
  }

  /* The audit trail carries the GST verdict, so an approver reading the
     record months later can see whether the registry was ever asked. */
  const gstNote = gstVerification.verified
    ? `verified as ${gstVerification.legalName}`
    : 'NOT CHECKED — verify by hand before approval';

  const app = { ...toApplication(parsed.data, randomUUID()), gstVerification };
  await store.createApplication(app);
  await store.appendEvent(app.id, {
    at: app.createdAt,
    actor: 'applicant',
    action: 'applied',
    note: `${app.firmName} — ${app.district}, ${app.state} · GST ${gstNote}`,
    ip,
  });

  /* Module 6 routes leads into GHL. Best-effort and never fails the request:
     the record above is already durable and is the system of record. */
  await forwardLead({
    name: app.contactName,
    company: app.firmName,
    email: app.email,
    phone: app.signatoryMobile,
    country: 'India',
    interest: 'Dealer application',
    message: `${app.district}, ${app.state} · ${app.monthlyVolume} · ${app.currentBrands || 'no brands listed'}`,
    source: 'orkaytiles.com — dealer onboarding',
    submissionId: app.id,
  });

  return NextResponse.json({ ok: true, application: publicView(app) }, { status: 201 });
}
