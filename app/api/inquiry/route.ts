import { NextResponse } from 'next/server';

/* B2B inquiry intake. Forwards to a GoHighLevel inbound webhook when
   GHL_WEBHOOK_URL is set; logs locally otherwise so the form is testable
   before the client's GHL account exists. */

type Body = {
  name?: string;
  company?: string;
  email?: string;
  country?: string;
  phone?: string;
  interest?: string;
  message?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.name?.trim()) errors.name = 'Required';
  if (!body.company?.trim()) errors.company = 'Required';
  if (!body.country?.trim()) errors.country = 'Required';
  if (!body.email?.trim()) errors.email = 'Required';
  else if (!EMAIL.test(body.email.trim())) errors.email = 'Enter a valid email';

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const payload = {
    name: body.name!.trim(),
    company: body.company!.trim(),
    email: body.email!.trim(),
    country: body.country!.trim(),
    phone: body.phone?.trim() || '',
    interest: body.interest?.trim() || '',
    message: body.message?.trim() || '',
    source: 'orkaytiles.com — website inquiry',
  };

  const webhook = process.env.GHL_WEBHOOK_URL;
  if (!webhook) {
    console.log('[inquiry] GHL_WEBHOOK_URL not set — payload:', payload);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[inquiry] GHL webhook responded', res.status);
      return NextResponse.json({ ok: false, errors: { form: 'Could not submit. Please email us directly.' } }, { status: 502 });
    }
  } catch (err) {
    console.error('[inquiry] GHL webhook failed', err);
    return NextResponse.json({ ok: false, errors: { form: 'Could not submit. Please email us directly.' } }, { status: 502 });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
