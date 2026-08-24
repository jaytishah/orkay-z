import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { sniffImage, sniffPdf, storeImage, storePdf, validateImage, validatePdf } from '@/lib/media';

/* Image / spec-PDF intake: server-side type and size checks first
   (hard rule 6), then derivatives generated at upload time (§5b).
   multipart fields: file, sku, kind = image | pdf */
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
  const sku = String(form.get('sku') || 'misc').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) || 'misc';
  const kind = String(form.get('kind') || 'image');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, errors: { file: 'No file received.' } }, { status: 400 });
  }

  const err = kind === 'pdf' ? validatePdf(file.type, file.size) : validateImage(file.type, file.size);
  if (err) return NextResponse.json({ ok: false, errors: { file: err } }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  if (kind === 'pdf') {
    if (!sniffPdf(buffer)) {
      return NextResponse.json({ ok: false, errors: { file: 'That file is not a PDF.' } }, { status: 400 });
    }
    const url = await storePdf(sku, buffer);
    return NextResponse.json({ ok: true, pdf: url });
  }

  /* The declared type got us this far; the decoder decides (hard rule 6). */
  const format = await sniffImage(buffer);
  if (!format) {
    return NextResponse.json(
      { ok: false, errors: { file: 'That file is not a readable JPEG, PNG or WebP image.' } },
      { status: 400 },
    );
  }

  const image = await storeImage(sku, buffer, format);
  return NextResponse.json({ ok: true, image });
}
