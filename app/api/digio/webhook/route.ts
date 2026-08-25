import { NextResponse } from 'next/server';
import { clientIp } from '@/lib/auth';
import { getStore, type Store } from '@/lib/store';
import { type DealerApplication, makeDealerCode } from '@/lib/dealers';
import { verifyWebhook } from '@/lib/digio';

/* Module 10, step 04 — "Dealer code issued".

   Digio calls this when the Aadhaar OTP signature completes. It is the only
   path to `active`, so it is also the most attacker-interesting route on the
   site: anyone who can forge a call here appoints themselves a dealer. Hence
   the HMAC check on the raw bytes before anything is read out of the body,
   and the reference_id — which Digio echoes from OUR sign request — rather
   than any application id the caller supplies.

   ⚠ The payload shape below follows Digio's published webhook, unverified
   against a live account. Confirm the event name and the signature header
   with a sandbox key; both are read in one place each, on purpose. */

const SIGNATURE_HEADER = 'x-digio-signature';

/* Issue the code and open the account. Separate from the transport so the
   stub path and the live path cannot drift apart. */
async function completeSigning(
  store: Store,
  application: DealerApplication,
  actor: string,
  ip: string,
): Promise<DealerApplication> {
  const now = new Date().toISOString();

  const signed = { ...application, status: 'signed' as const, signedAt: now, updatedAt: now };
  await store.updateApplication(signed);
  await store.appendEvent(application.id, { at: now, actor, action: 'signed', ip });

  /* Uniqueness is the conditional write, not the random draw (hard rule 10).
     Five attempts is generous at 32^6 — if they all lose, something is wrong
     with the table, and a duplicate dealer code is worse than an error. */
  let dealerCode: string | null = null;
  for (let i = 0; i < 5 && !dealerCode; i += 1) {
    const candidate = makeDealerCode();
    if (await store.reserve('DEALERCODE', candidate, application.id)) dealerCode = candidate;
  }
  if (!dealerCode) {
    /* The signature stands — it is legally binding whether or not we managed
       to name the account. Leave it at `signed` for the desk to finish. */
    await store.appendEvent(application.id, {
      at: new Date().toISOString(),
      actor: 'system',
      action: 'code-issue-failed',
      note: 'Could not reserve a unique dealer code after 5 attempts.',
      ip,
    });
    return signed;
  }

  const activeAt = new Date().toISOString();
  const active = { ...signed, status: 'active' as const, dealerCode, updatedAt: activeAt };
  await store.updateApplication(active);
  await store.appendEvent(application.id, {
    at: activeAt,
    actor: 'system',
    action: 'active',
    note: `Dealer code ${dealerCode} issued`,
    ip,
  });
  return active;
}

export async function POST(request: Request) {
  /* Read the bytes once: the HMAC must be checked against exactly what was
     sent, not against a re-serialised object. */
  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers.get(SIGNATURE_HEADER))) {
    console.error('[digio] webhook signature rejected');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = (body.payload ?? body) as Record<string, unknown>;
  const referenceId = String(payload.reference_id ?? body.reference_id ?? '');
  const event = String(body.event ?? body.type ?? '');
  const status = String(payload.agreement_status ?? payload.status ?? '');

  if (!referenceId) return NextResponse.json({ ok: false, error: 'no reference_id' }, { status: 400 });

  const completed = /complet|success|signed/i.test(event) || /complet|success|signed/i.test(status);
  if (!completed) {
    /* Expiries, declines and progress pings all land here. Record them and
       leave the application where it is. */
    const store = await getStore();
    if (await store.getApplication(referenceId)) {
      await store.appendEvent(referenceId, {
        at: new Date().toISOString(),
        actor: 'digio',
        action: 'esign-update',
        note: `${event || 'event'} · ${status || 'no status'}`,
        ip: clientIp(request),
      });
    }
    return NextResponse.json({ ok: true, handled: false });
  }

  const store = await getStore();
  const application = await store.getApplication(referenceId);
  if (!application) return NextResponse.json({ ok: false }, { status: 404 });

  /* Digio retries. A second delivery must not mint a second dealer code. */
  if (application.status === 'signed' || application.status === 'active') {
    return NextResponse.json({ ok: true, alreadyHandled: true, dealerCode: application.dealerCode });
  }
  if (application.status !== 'verified') {
    return NextResponse.json({ ok: false, error: `unexpected status ${application.status}` }, { status: 409 });
  }

  const result = await completeSigning(store, application, 'digio', clientIp(request));
  return NextResponse.json({ ok: true, status: result.status, dealerCode: result.dealerCode });
}

/* Local stand-in for Digio's callback, reached from the stub signing URL.
   Refused in production — see lib/digio.ts for why a convincing fake
   signature is the one thing this module must never ship. */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const id = new URL(request.url).searchParams.get('stub');
  if (!id) return NextResponse.json({ ok: false, error: 'pass ?stub=<applicationId>' }, { status: 400 });

  const store = await getStore();
  const application = await store.getApplication(id);
  if (!application) return NextResponse.json({ ok: false }, { status: 404 });
  if (application.status === 'signed' || application.status === 'active') {
    return NextResponse.json({ ok: true, alreadyHandled: true, dealerCode: application.dealerCode });
  }
  if (application.status !== 'verified') {
    return NextResponse.json({ ok: false, error: `unexpected status ${application.status}` }, { status: 409 });
  }

  const result = await completeSigning(store, application, 'digio-stub', clientIp(request));
  return NextResponse.json({ ok: true, stub: true, status: result.status, dealerCode: result.dealerCode });
}
