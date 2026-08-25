import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { consentText } from '@/content/pages';
import { clientIp, rateLimit } from '@/lib/auth';
import { forwardLead } from '@/lib/ghl';
import { getStore } from '@/lib/store';
import { inquirySchema, reference, toInquirySubmission } from '@/lib/submissions';

/* Contact form 01 — the general enquiry.

   The enquiry is written to our own store first and forwarded to GoHighLevel
   second. That order is the point: before this, an enquiry existed only in
   GHL, so an unset webhook or a CRM outage meant it existed nowhere. The
   admin inbox is now the system of record and GHL is the copy. */

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`inquiry:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, errors: { form: `Too many enquiries from this connection. Try again in ${Math.ceil(rl.retryAfterS / 60)} min.` } },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterS) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.') || 'form'] = issue.message;
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const submission = toInquirySubmission(parsed.data, randomUUID());
  /* CR L-05: the opt-in wording and the moment it was given travel with the
     record, so the consent can be evidenced later from the record alone. */
  submission.data = {
    ...submission.data,
    consent: {
      contact: true,
      contactText: consentText.contact,
      marketing: parsed.data.consentMarketing,
      marketingText: consentText.marketing,
      at: submission.createdAt,
      ip,
    },
  };

  const store = await getStore();
  await store.createSubmission(submission);

  await forwardLead({
    name: parsed.data.name,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone,
    country: parsed.data.country,
    interest: parsed.data.interest,
    message: parsed.data.message,
    source: 'orkaytiles.com — general enquiry',
    submissionId: submission.id,
    consent: submission.data.consent as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, reference: reference(submission.id) }, { status: 201 });
}
