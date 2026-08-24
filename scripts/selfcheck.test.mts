import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { normalizeSize, productSchema } from '../lib/catalog.ts';
import { sniffImage, sniffPdf } from '../lib/media.ts';

/* The two places where bad input has actually got through: the size field,
   which arrives spelled three different ways, and the upload type check,
   which must not believe what the browser says. Run: npm run check */

const BASE = {
  sku: 'OKY-T-1', name: 'Test Tile', category: 'Ceramic Tiles',
  surfaceFinish: 'Matt', surfaceApplication: ['Floor'], colourFamily: 'Beige',
};

test('every way a size is written lands on the canonical form', () => {
  for (const raw of ['600x1200', '600X1200', '600×1200', '600*1200', '600 x 1200', '600\uFFFD1200']) {
    assert.equal(normalizeSize(raw), '600×1200', raw);
  }
});

test('sizes that are not two dimensions are still rejected', () => {
  for (const raw of ['large', '60x60', '600', '', '12345x600']) {
    const r = productSchema.safeParse({ ...BASE, sizes: [raw] });
    assert.equal(r.success, false, raw);
  }
});

test('the schema normalises, so the form and the CSV agree', () => {
  const r = productSchema.safeParse({ ...BASE, sizes: ['600x1200', '800X800'] });
  assert.ok(r.success);
  assert.deepEqual(r.data.sizes, ['600×1200', '800×800']);
});

test('the decoder, not the declared type, decides what an image is', async () => {
  const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#000' } }).png().toBuffer();
  assert.equal(await sniffImage(png), 'png');
  assert.equal(await sniffImage(Buffer.from('MZ\x90 not an image')), null);
  assert.equal(await sniffImage(Buffer.alloc(0)), null);
});

test('a PDF has to start like a PDF', () => {
  assert.equal(sniffPdf(Buffer.from('%PDF-1.7\n...')), true);
  assert.equal(sniffPdf(Buffer.from('<html><script>alert(1)</script>')), false);
  assert.equal(sniffPdf(Buffer.alloc(0)), false);
});
