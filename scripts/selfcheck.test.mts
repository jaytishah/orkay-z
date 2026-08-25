import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { normalizeSize, productSchema } from '../lib/catalog.ts';
import { sniffImage, sniffPdf } from '../lib/media.ts';
import {
  DEALER_CODE, canTransition, dealerApplicationSchema, districtKey, gstinChecksumOk,
  makeDealerCode, normaliseDealerCode,
} from '../lib/dealers.ts';

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

/* ── Module 10 ──────────────────────────────────────────────────────
   The dealer flow's two load-bearing rules: a territory key that cannot be
   spelled two ways, and a status ladder nothing can skip. Both decide who
   ends up holding an exclusive district. */

const APPLICATION = {
  firmName: 'Shakti Ceramics', entityType: 'Partnership',
  pan: 'abcde1234f', gstin: '24abcde1234f1z6',
  contactName: 'A Patel', signatoryMobile: '+91 98765 43210',
  email: 'Desk@Example.COM ', state: 'Gujarat', district: 'Morbi', city: 'Morbi',
  address: '62/63/64, Shakti Chamber-1, 8A National Highway',
  pincode: '363642', monthlyVolume: 'Under 5,000 sq m',
  consentContact: 'on', consentKyc: true,
};

test('one district cannot be spelled into two territories', () => {
  const canonical = districtKey('Gujarat', 'Morbi');
  for (const [state, district] of [
    ['Gujarat', 'morbi'], ['gujarat', 'MORBI'], ['Gujarat', ' Morbi '], ['Gujarat', 'Morbi.'],
  ] as Array<[string, string]>) {
    assert.equal(districtKey(state, district), canonical, `${state}/${district}`);
  }
  assert.notEqual(districtKey('Gujarat', 'Rajkot'), canonical);
  /* a space is part of the name, not noise — North Goa is not Northgoa */
  assert.notEqual(districtKey('Goa', 'North Goa'), districtKey('Goa', 'NorthGoa'));
});

test('the application normalises what a human actually types', () => {
  const r = dealerApplicationSchema.safeParse(APPLICATION);
  assert.ok(r.success, JSON.stringify(r.error?.issues));
  assert.equal(r.data.pan, 'ABCDE1234F');
  assert.equal(r.data.gstin, '24ABCDE1234F1Z6');
  assert.equal(r.data.signatoryMobile, '9876543210', 'the +91 and spaces come off');
  assert.equal(r.data.email, 'desk@example.com');
});

test('KYC identifiers that are not identifiers are rejected', () => {
  for (const bad of [
    { pan: 'NOTAPAN' }, { gstin: '24ABCDE1234F1Z' }, { signatoryMobile: '12345' },
    /* right shape, wrong check digit — the regex passes it, the checksum does not */
    { gstin: '24ABCDE1234F1Z5' },
    { pincode: '0123456' }, { state: 'Gujrat' }, { consentKyc: false },
  ]) {
    const r = dealerApplicationSchema.safeParse({ ...APPLICATION, ...bad });
    assert.equal(r.success, false, JSON.stringify(bad));
  }
});

test('nothing reaches active without passing through the signature', () => {
  assert.equal(canTransition('applied', 'verified'), true);
  assert.equal(canTransition('signed', 'active'), true);
  /* the moves that would hand out a dealer code on an unsigned agreement */
  assert.equal(canTransition('applied', 'active'), false);
  assert.equal(canTransition('verified', 'active'), false);
  assert.equal(canTransition('rejected', 'verified'), false);
  assert.equal(canTransition('active', 'rejected'), false);
});

test('dealer codes avoid the characters that get misheard on a phone', () => {
  for (let i = 0; i < 200; i += 1) {
    assert.match(makeDealerCode(), /^ORK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  }
});

/* The reservation itself (hard rule 10) is exercised end-to-end against the
   running app in scripts/dealer-e2e.mjs — lib/store/file.ts imports
   extensionless, which only the bundler resolves, so it cannot be loaded here. */

/* ── the two identifiers the dealership form now checks locally ──────
   Both are pure arithmetic over a string, both decide whether a real
   applicant gets through, and neither needs a network to be wrong. */

test('a GSTIN check digit is verified, not just its shape', () => {
  /* real registered GSTINs, published in GST documentation */
  assert.equal(gstinChecksumOk('27AAPFU0939F1ZV'), true);
  assert.equal(gstinChecksumOk('29AAGCB7383J1Z4'), true);
  /* lowercase and stray spacing are the applicant's problem, not theirs */
  assert.equal(gstinChecksumOk('  27aapfu0939f1zv '), true);
  /* right shape, wrong check digit — exactly what a typo produces */
  assert.equal(gstinChecksumOk('27AAPFU0939F1ZW'), false);
  /* transposed pair inside the PAN block: the shape survives, the sum does not */
  assert.equal(gstinChecksumOk('27AAPFU0399F1ZV'), false);
  /* not a GSTIN at all */
  for (const bad of ['', 'GSTIN', '27AAPFU0939F1Z', '270AAPFU0939F1ZV']) {
    assert.equal(gstinChecksumOk(bad), false, bad);
  }
});

test('a dealer code survives however a dealer types it back to us', () => {
  for (const raw of ['ORK-4KJ7QP', 'ork 4kj7qp', ' ork4kj7qp ', 'ORK–4KJ7QP', 'o r k - 4 k j 7 q p']) {
    assert.equal(normaliseDealerCode(raw), 'ORK-4KJ7QP', raw);
  }
  /* every code the generator issues must pass the reader — they share an alphabet */
  for (let i = 0; i < 200; i += 1) {
    assert.equal(DEALER_CODE.test(makeDealerCode()), true);
  }
  /* the characters the alphabet deliberately excludes stay excluded */
  for (const bad of ['ORK-4KJ7Q0', 'ORK-4KJ7QI', 'ORK-4KJ7Q', 'ORKAY-4KJ7QP', '']) {
    assert.equal(DEALER_CODE.test(normaliseDealerCode(bad)), false, bad);
  }
});
