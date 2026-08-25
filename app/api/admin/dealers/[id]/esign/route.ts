import { NextResponse } from 'next/server';
import { clientIp, requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { DigioUnavailable, createSignRequest } from '@/lib/digio';

/* Module 10, step 03 — "Digital signature".

   Orkay starts this from the panel once KYC has passed; Digio then notifies
   the signatory and collects the Aadhaar OTP. Nothing here is public: the
   dealer never needs a login, and we never mint a signing URL for an
   application that has not been verified. */

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  const store = await getStore();
  const application = await store.getApplication(id);
  if (!application) return NextResponse.json({ ok: false }, { status: 404 });

  if (application.status !== 'verified') {
    return NextResponse.json(
      { ok: false, errors: { form: `Only a verified application can be sent for signature — this one is "${application.status}".` } },
      { status: 409 },
    );
  }

  let signRequest;
  try {
    signRequest = await createSignRequest(application);
  } catch (err) {
    if (err instanceof DigioUnavailable) {
      console.error('[esign]', err.message);
      return NextResponse.json(
        { ok: false, errors: { form: 'The e-Sign service is not reachable. Nothing has been sent — try again, or check the Digio credentials.' } },
        { status: 503 },
      );
    }
    throw err;
  }

  const now = new Date().toISOString();
  await store.updateApplication({ ...application, digioDocumentId: signRequest.documentId, updatedAt: now });
  await store.appendEvent(id, {
    at: now,
    actor: session.email,
    action: 'esign-requested',
    note: `Digio ${signRequest.mode} · document ${signRequest.documentId}`,
    ip: clientIp(request),
  });

  /* The status stays `verified` until Digio confirms the signature on its
     webhook — an issued link is not a signed agreement. */
  return NextResponse.json({ ok: true, ...signRequest });
}
