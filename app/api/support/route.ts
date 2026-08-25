import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { consentText } from '@/content/pages';
import { clientIp, rateLimit } from '@/lib/auth';
import { forwardLead } from '@/lib/ghl';
import { getStore } from '@/lib/store';
import {
  DEALER_CODE, normaliseDealerCode, reference, supportRequestSchema, toSupportSubmission,
} from '@/lib/submissions';

/* Contact form 03 — the dealer support programme.

   This one is for dealers Orkay has already appointed, so the dealer code is
   the credential. It is NOT a login: it opens a support ticket, nothing more,
   and the only thing it unlocks is the firm name on screen so the dealer can
   see they typed their own code. Every field is validated, rate-limited and
   stored server-side regardless.

   The code is resolved through the DEALERCODE reservation — the same item the
   conditional write creates when onboarding completes (hard rule 10) — and
   the application behind it must actually be `active`. A code issued to an
   application that was later closed does not open a ticket. */

async function resolveDealer(rawCode: string) {
  const code = normaliseDealerCode(rawCode);
  if (!DEALER_CODE.test(code)) return null;
  const store = await getStore();
  const applicationId = await store.reservationHolder('DEALERCODE', code);
  if (!applicationId) return null;
  const application = await store.getApplication(applicationId);
  if (!application || application.status !== 'active') return null;
  return { code, application };
}

/** Dealer-code check for the form, so a mistyped code is caught before the rest is filled in. */
export async function GET(request: Request) {
  const rl = rateLimit(`dealercode:${clientIp(request)}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many checks from this connection.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
    );
  }

  const code = new URL(request.url).searchParams.get('code') || '';
  const found = await resolveDealer(code);
  /* Deliberately only the firm name and territory: enough for a dealer to
     recognise their own account, nothing that would make guessing codes
     worth anyone's time. */
  return NextResponse.json(found
    ? {
      ok: true,
      valid: true,
      firmName: found.application.firmName,
      territory: `${found.application.district}, ${found.application.state}`,
    }
    : { ok: true, valid: false });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`support:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, errors: { form: `Too many requests from this connection. Try again in ${Math.ceil(rl.retryAfterS / 60)} min.` } },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }

  const parsed = supportRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.') || 'form'] = issue.message;
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  /* Re-resolved here rather than trusted from the earlier check in the
     browser — the GET above is a convenience, this is the gate (rule 2). */
  const found = await resolveDealer(parsed.data.dealerCode);
  if (!found) {
    return NextResponse.json(
      { ok: false, errors: { dealerCode: 'We cannot find an active dealer account for that code. Check it against your agreement, or email the dealer desk.' } },
      { status: 404 },
    );
  }

  const submission = toSupportSubmission(parsed.data, randomUUID(), found.application.firmName);
  submission.data = {
    ...submission.data,
    territory: `${found.application.district}, ${found.application.state}`,
    applicationId: found.application.id,
    consent: {
      contact: true,
      contactText: consentText.contact,
      at: submission.createdAt,
      ip,
    },
  };

  const store = await getStore();
  await store.createSubmission(submission);

  await forwardLead({
    name: parsed.data.contactName,
    company: found.application.firmName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    country: 'India',
    interest: `Dealer support — ${parsed.data.requestType}`,
    message: `${found.code} · ${parsed.data.showroomName}, ${parsed.data.city} · ${parsed.data.urgency} · ${parsed.data.details}`,
    source: 'orkaytiles.com — dealer support programme',
    submissionId: submission.id,
  });

  return NextResponse.json(
    { ok: true, reference: reference(submission.id), firmName: found.application.firmName },
    { status: 201 },
  );
}
