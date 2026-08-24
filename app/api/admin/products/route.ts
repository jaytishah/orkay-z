import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStore } from '@/lib/store';
import { productSchema, toProduct, type ListQuery, CATEGORIES, FINISHES, APPLICATIONS, COLOUR_FAMILIES } from '@/lib/catalog';
import { requireSession } from '@/lib/auth';

/* Every handler re-verifies the session before touching the store —
   the protection sits on the data operation, not the screen (hard rule 2). */

function pick<T extends readonly string[]>(list: T, v: string | null): T[number] | undefined {
  return v && (list as readonly string[]).includes(v) ? (v as T[number]) : undefined;
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const url = new URL(request.url);
  const p = url.searchParams;
  const query: ListQuery = {
    category: pick(CATEGORIES, p.get('category')),
    finish: pick(FINISHES, p.get('finish')),
    application: pick(APPLICATIONS, p.get('application')),
    colour: pick(COLOUR_FAMILIES, p.get('colour')),
    size: p.get('size') || undefined,
    q: p.get('q') || undefined,
    active: p.get('active') === 'true' ? true : p.get('active') === 'false' ? false : undefined,
    cursor: p.get('cursor') || undefined,
    limit: Math.min(100, Number(p.get('limit')) || 50),
  };
  const store = await getStore();
  const result = await store.list(query);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

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

  const store = await getStore();
  try {
    await store.create(toProduct(parsed.data));
  } catch (err) {
    if ((err as { code?: string }).code === 'DUPLICATE') {
      return NextResponse.json({ ok: false, errors: { sku: 'This SKU already exists.' } }, { status: 409 });
    }
    throw err;
  }

  /* live publishing: the public pages re-render on next request */
  revalidatePath('/products');
  revalidatePath('/');
  return NextResponse.json({ ok: true, sku: parsed.data.sku });
}
