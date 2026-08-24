import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStore } from '@/lib/store';
import { productSchema, toProduct } from '@/lib/catalog';
import { requireSession } from '@/lib/auth';

/* ════════════════════════════════════════════════════════════════════
   Bulk CSV import (Module 3 / Module 9). Columns match the template in
   public/orkay-product-import-template.csv:

   sku,name,category,sizes,surfaceFinish,surfaceApplication,colourFamily,
   description,tags,active,featured,sortOrder

   Multi-value cells (sizes, surfaceApplication, tags) are ;-separated.
   Every row passes the same Zod schema as the form — one source of truth.
   mode=create rejects existing SKUs row by row; mode=upsert overwrites.
   The response reports per-row outcomes so a 4,000-row file fails loudly,
   not silently.
   ════════════════════════════════════════════════════════════════════ */

/* Small RFC-4180 parser — quoted fields, escaped quotes, CRLF. A dependency
   would be larger than the problem. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

const COLUMNS = [
  'sku', 'name', 'category', 'sizes', 'surfaceFinish', 'surfaceApplication',
  'colourFamily', 'description', 'tags', 'active', 'featured', 'sortOrder',
] as const;

const semi = (v: string) => v.split(';').map((s) => s.trim()).filter(Boolean);
const bool = (v: string) => ['true', 'yes', '1', 'y'].includes(v.trim().toLowerCase());

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid upload.' } }, { status: 400 });
  }
  const file = form.get('file');
  const mode = String(form.get('mode') || 'create');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, errors: { file: 'No CSV received.' } }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ ok: false, errors: { file: 'CSV larger than 5 MB.' } }, { status: 400 });
  }

  const rows = parseCsv(await file.text());
  if (rows.length < 2) {
    return NextResponse.json({ ok: false, errors: { file: 'The file has no data rows.' } }, { status: 400 });
  }
  const header = rows[0].map((h) => h.trim());
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    return NextResponse.json(
      { ok: false, errors: { file: `Missing columns: ${missing.join(', ')}. Use the issued template.` } },
      { status: 400 },
    );
  }
  const ix = Object.fromEntries(COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<(typeof COLUMNS)[number], number>;

  const store = await getStore();
  const report: Array<{ row: number; sku: string; status: 'created' | 'updated' | 'error'; message?: string }> = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const sku = (cells[ix.sku] || '').trim();
    const raw = {
      sku,
      name: (cells[ix.name] || '').trim(),
      category: (cells[ix.category] || '').trim(),
      sizes: semi(cells[ix.sizes] || ''),
      surfaceFinish: (cells[ix.surfaceFinish] || '').trim(),
      surfaceApplication: semi(cells[ix.surfaceApplication] || ''),
      colourFamily: (cells[ix.colourFamily] || '').trim(),
      description: (cells[ix.description] || '').trim(),
      images: [],
      specPdf: null,
      tags: semi(cells[ix.tags] || ''),
      active: bool(cells[ix.active] || 'true'),
      featured: bool(cells[ix.featured] || 'false'),
      sortOrder: Number(cells[ix.sortOrder]) || 0,
    };
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      report.push({ row: r + 1, sku, status: 'error', message: `${first.path.join('.')}: ${first.message}` });
      continue;
    }
    const existing = await store.get(parsed.data.sku);
    if (existing && mode !== 'upsert') {
      report.push({ row: r + 1, sku, status: 'error', message: 'SKU already exists (use upsert to overwrite)' });
      continue;
    }
    try {
      if (existing) {
        /* keep images/PDF already attached through the form */
        await store.update(toProduct({ ...parsed.data, images: existing.images, specPdf: existing.specPdf }, existing));
        report.push({ row: r + 1, sku, status: 'updated' });
      } else {
        await store.create(toProduct(parsed.data));
        report.push({ row: r + 1, sku, status: 'created' });
      }
    } catch (err) {
      report.push({ row: r + 1, sku, status: 'error', message: (err as Error).message });
    }
  }

  revalidatePath('/products');
  revalidatePath('/');
  const summary = {
    created: report.filter((x) => x.status === 'created').length,
    updated: report.filter((x) => x.status === 'updated').length,
    errors: report.filter((x) => x.status === 'error').length,
  };
  return NextResponse.json({ ok: true, summary, report });
}
