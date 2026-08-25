import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clientIp, requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { DEALER_STATUSES, canTransition, type DealerStatus } from '@/lib/dealers';

/* Module 10, step 02 — "Verification": KYC and document check, then internal
   approval of the territory.

   Every handler re-verifies the session before touching data (hard rule 2) —
   the panel layout's own check is furniture, not the fence. */

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;
  const store = await getStore();
  const application = await store.getApplication(id);
  if (!application) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, application, events: await store.listEvents(id) });
}

const patchSchema = z.object({
  to: z.enum(DEALER_STATUSES),
  note: z.string().trim().max(500).default(''),
});

/* The only way an application changes state by hand. The move is checked
   against ALLOWED_TRANSITIONS rather than trusted from the body, so no
   request can jump an application straight to `active` and skip the
   signature that makes the agreement binding. */
export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: { form: 'Unknown status change.' } }, { status: 400 });
  }
  const to: DealerStatus = parsed.data.to;

  const store = await getStore();
  const application = await store.getApplication(id);
  if (!application) return NextResponse.json({ ok: false }, { status: 404 });

  if (!canTransition(application.status, to)) {
    return NextResponse.json(
      { ok: false, errors: { form: `An application that is "${application.status}" cannot move to "${to}".` } },
      { status: 409 },
    );
  }

  /* Approval is the moment Orkay commits the territory, so this is where the
     district is actually claimed. The conditional write IS the constraint —
     the availability check on the public form is only advice (hard rule 10). */
  if (to === 'verified') {
    const won = await store.reserve('DISTRICT', application.districtKey, application.id);
    if (!won) {
      const holder = await store.reservationHolder('DISTRICT', application.districtKey);
      return NextResponse.json(
        {
          ok: false,
          errors: {
            form: holder === application.id
              ? 'This territory is already reserved for this application.'
              : `${application.district}, ${application.state} was appointed to another dealer while this application was open.`,
          },
        },
        { status: 409 },
      );
    }
  }

  /* Rejecting an application that had already claimed its territory gives the
     district back, so the next applicant from that catchment is not blocked by
     a decision that went against someone else. */
  if (to === 'rejected' && application.status === 'verified') {
    await store.release('DISTRICT', application.districtKey, application.id);
  }

  const updated = { ...application, status: to, updatedAt: new Date().toISOString() };
  await store.updateApplication(updated);
  await store.appendEvent(id, {
    at: updated.updatedAt,
    actor: session.email,
    action: to,
    note: parsed.data.note || undefined,
    ip: clientIp(request),
  });

  return NextResponse.json({ ok: true, application: updated });
}
