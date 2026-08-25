import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { SUBMISSION_STATUSES } from '@/lib/submissions';

/* The admin inbox's only write. Re-verifies the session before touching data
   (hard rule 2) — the panel layout check is furniture, not the fence. */

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES),
  adminNote: z.string().trim().max(2000).default(''),
});

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
    return NextResponse.json({ ok: false, errors: { form: 'Unknown status.' } }, { status: 400 });
  }

  const store = await getStore();
  const existing = await store.getSubmission(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  /* No transition table: a support ticket legitimately reopens when the dealer
     replies. Who touched it last is what matters, and that is recorded. */
  const updated = {
    ...existing,
    status: parsed.data.status,
    adminNote: parsed.data.adminNote,
    handledBy: session.email,
    updatedAt: new Date().toISOString(),
  };
  await store.updateSubmission(updated);

  return NextResponse.json({ ok: true, submission: updated });
}
