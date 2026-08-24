import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

/* ════════════════════════════════════════════════════════════════════
   Media pipeline per INSTRUCTIONS §5b: derivatives are generated AT
   UPLOAD, never at request time — the site serves plain <img>, nothing
   resizes on the fly. Masters are archive-only and never referenced.

     card    600px  WebP   catalog grid
     detail 1200px  WebP   product page main
     zoom   2400px  WebP   lightbox

   Local mode writes under public/uploads/. S3 mode (S3_BUCKET set)
   uploads derivatives under products/ (public read) and the master
   under masters/ (private) — provisioned by scripts/aws/provision.mjs.
   Filenames are content-hashed so they are immutable-cacheable.

   Deviation noted honestly: the quotation's presigned browser→S3 upload
   applies to the 4K-master + Lambda-derivative pipeline on AWS. Admin
   uploads here route through the server because the server must make
   the derivatives anyway; the presigned path arrives with the Lambda.
   ════════════════════════════════════════════════════════════════════ */

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
/* keyed by what sharp reports, not by what the upload claimed */
const FORMAT_EXT = { jpeg: 'jpg', png: 'png', webp: 'webp' } as const;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

const SIZES = [
  { name: 'card', px: 600 },
  { name: 'detail', px: 1200 },
  { name: 'zoom', px: 2400 },
] as const;

export type UploadedImage = { card: string; detail: string; zoom: string; master: string };

type Sink = {
  put(key: string, body: Buffer, contentType: string, isPublic: boolean): Promise<string>;
};

async function localSink(): Promise<Sink> {
  return {
    async put(key, body) {
      const file = path.join(process.cwd(), 'public', 'uploads', key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, body);
      return `/uploads/${key.replace(/\\/g, '/')}`;
    },
  };
}

async function s3Sink(bucket: string): Promise<Sink> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({});
  const publicBase =
    process.env.S3_PUBLIC_BASE ||
    `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com`;
  return {
    async put(key, body, contentType, isPublic) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      return isPublic ? `${publicBase}/${key}` : `s3://${bucket}/${key}`;
    },
  };
}

async function sink(): Promise<Sink> {
  const bucket = process.env.S3_BUCKET;
  return bucket ? s3Sink(bucket) : localSink();
}

export function validateImage(type: string, size: number): string | null {
  if (!IMAGE_TYPES[type]) return 'Only JPEG, PNG or WebP images are accepted';
  if (size > MAX_IMAGE_BYTES) return 'Image is larger than 15 MB';
  return null;
}

export function validatePdf(type: string, size: number): string | null {
  if (type !== 'application/pdf') return 'Only PDF is accepted here';
  if (size > MAX_PDF_BYTES) return 'PDF is larger than 20 MB';
  return null;
}

/* The declared MIME type is a claim the browser makes, so it screens honest
   mistakes and nothing else. These two look at the bytes, which is the check
   hard rule 6 actually asks for. Both run before a single byte is stored —
   a file that fails must not leave a master behind. */
export type ImageFormat = keyof typeof FORMAT_EXT;

export async function sniffImage(buffer: Buffer): Promise<ImageFormat | null> {
  try {
    const { format } = await sharp(buffer).metadata();
    return format && format in FORMAT_EXT ? (format as ImageFormat) : null;
  } catch {
    return null;
  }
}

export function sniffPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

/** Master in, three immutable WebP derivatives out. */
export async function storeImage(sku: string, buffer: Buffer, format: ImageFormat): Promise<UploadedImage> {
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  const folder = sku.toLowerCase();

  /* Every derivative is produced before anything is written, so a buffer
     sharp chokes on halfway through leaves no orphan files behind. */
  const derivatives = [];
  for (const s of SIZES) {
    derivatives.push({
      name: s.name,
      webp: await sharp(buffer)
        .rotate() /* respect EXIF orientation before it is stripped */
        .resize({ width: s.px, height: s.px, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: s.name === 'card' ? 78 : 82 })
        .toBuffer(),
    });
  }

  const out = await sink();
  const result: Partial<UploadedImage> = {
    master: await out.put(`masters/${folder}/${hash}.${FORMAT_EXT[format]}`, buffer, `image/${format}`, false),
  };
  for (const d of derivatives) {
    result[d.name] = await out.put(`products/${folder}/${hash}-${d.name}.webp`, d.webp, 'image/webp', true);
  }
  return result as UploadedImage;
}

export async function storePdf(sku: string, buffer: Buffer): Promise<string> {
  const out = await sink();
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  return out.put(`products/${sku.toLowerCase()}/${hash}-spec.pdf`, buffer, 'application/pdf', true);
}
