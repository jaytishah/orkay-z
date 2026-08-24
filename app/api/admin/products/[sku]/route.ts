import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStore } from '@/lib/store';
import { productSchema, toProduct } from '@/lib/catalog';
import { requireSession } from '@/lib/auth';

type Ctx = { params: Promise<{ sku: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { sku } = await ctx.params;
  const store = await getStore();
  const product = await store.get(sku);
  if (!product) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, product });
}

/* Full update. The SKU in the path is authoritative — a changed SKU in the
   body is rejected rather than silently creating a second record. */
export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { sku } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join('.') || 'form'] = issue.message;
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }
  if (parsed.data.sku !== sku) {
    return NextResponse.json({ ok: false, errors: { sku: 'The SKU cannot be changed. Create a new product instead.' } }, { status: 400 });
  }

  const store = await getStore();
  const existing = await store.get(sku);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  await store.update(toProduct(parsed.data, existing));
  revalidatePath('/products');
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { sku } = await ctx.params;
  const store = await getStore();
  const existing = await store.get(sku);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
  await store.remove(sku);
  revalidatePath('/products');
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
