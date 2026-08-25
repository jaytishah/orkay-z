/* End-to-end check for the catalog pipeline — Modules 2, 3 and 9.

     npm run dev
     BASE=http://localhost:3000 node scripts/catalog-e2e.mjs

   Deliberately store-agnostic: run it against a file-store server and a
   DynamoDB-backed server and the results must be identical. That equivalence
   IS the test of the seam (CLAUDE.md hard rule 8) — if the two disagree,
   swapping .data/catalog.json for DynamoDB has changed behaviour, which is
   exactly what must not happen at deploy time.

   What it proves that unit tests cannot:
   - the §5a access patterns: category partition, sparse active index, facets
     and keyword filtered over the queried set
   - SKU uniqueness as a conditional write, not check-then-write
   - CSV import create / duplicate / upsert per row
   - derivatives generated AT UPLOAD at 600 / 1200 / 2400 (§5b)
   - the byte-sniffing upload guard (hard rule 6)
   - every admin route refusing an unauthenticated caller (hard rule 2)

   Writes real records. Point it at dev, never production. */

import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const BASE = process.env.BASE || 'http://localhost:3000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@orkaytiles.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'orkay-local-2026';

const RUN = Date.now().toString(36).toUpperCase();
const SKU = `E2E-${RUN}`;
const SKU2 = `E2E-${RUN}-B`;

let cookie = '';
let failures = 0;
const created = [];

function check(label, condition, detail) {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.log(`  FAIL ${label}${detail !== undefined ? ` — ${JSON.stringify(detail)}` : ''}`);
  }
}

async function call(p, init = {}) {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${BASE}${p}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { cookie } : {}),
      ...(init.headers || {}),
    },
    redirect: 'manual',
  });
  const sc = res.headers.getSetCookie?.() || [];
  if (sc.length) cookie = sc.map((c) => c.split(';')[0]).join('; ');
  let body = null;
  try { body = JSON.parse(await res.text()); } catch { /* status is the signal */ }
  return { status: res.status, body };
}

const product = (sku, over = {}) => ({
  sku,
  name: `E2E Tile ${sku}`,
  category: 'Porcelain Slab Tiles',
  sizes: ['800x1600'],
  surfaceFinish: 'Matt',
  surfaceApplication: ['Floor'],
  colourFamily: 'Beige',
  description: 'Created by catalog-e2e.',
  images: [],
  specPdf: null,
  tags: ['e2e', 'marble-look'],
  active: true,
  featured: false,
  sortOrder: 10,
  ...over,
});

console.log(`Catalog end-to-end · ${BASE} · run ${RUN}\n`);

console.log('the fence');
const anon = await call('/api/admin/products');
check('an unauthenticated list is refused', anon.status === 401, anon.status);
const anonWrite = await call('/api/admin/products', { method: 'POST', body: JSON.stringify(product(SKU)) });
check('an unauthenticated create is refused', anonWrite.status === 401, anonWrite.status);
const anonUpload = await call('/api/admin/upload', { method: 'POST', body: new FormData() });
check('an unauthenticated upload is refused', anonUpload.status === 401, anonUpload.status);

console.log('\nsign in');
const login = await call('/api/admin/session', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
check('admin login succeeds', login.status === 200 && login.body?.ok === true, login.body);
if (login.status !== 200) {
  console.log('\ncannot continue without a session — set ADMIN_PASSWORD');
  process.exit(1);
}

console.log('\nschema at the boundary');
const bad = await call('/api/admin/products', { method: 'POST', body: JSON.stringify(product(`${SKU}-BAD`, { sizes: ['enormous'] })) });
check('an unparseable size is rejected', bad.status === 400 && Boolean(bad.body?.errors), bad.body?.errors);
const badCat = await call('/api/admin/products', { method: 'POST', body: JSON.stringify(product(`${SKU}-BAD`, { category: 'Wooden Plank Tiles' })) });
check('a category outside the four is rejected', badCat.status === 400, badCat.body?.errors);

console.log('\ncreate');
const made = await call('/api/admin/products', { method: 'POST', body: JSON.stringify(product(SKU)) });
check('a valid product is created', made.status === 200 && made.body?.sku === SKU, made.body);
if (made.status === 200) created.push(SKU);

const dupe = await call('/api/admin/products', { method: 'POST', body: JSON.stringify(product(SKU)) });
check('a duplicate SKU is refused (conditional write)', dupe.status === 409, dupe.body);

const got = await call(`/api/admin/products/${SKU}`);
check('the product reads back by SKU', got.body?.product?.sku === SKU, got.body);
check('the size was normalised to 800×1600', got.body?.product?.sizes?.[0] === '800×1600', got.body?.product?.sizes);
check('a slug was derived', /^e2e-tile-e2e-/.test(got.body?.product?.slug || ''), got.body?.product?.slug);
check('searchText was built for keyword matching', (got.body?.product?.searchText || '').includes('marble-look'), got.body?.product?.searchText);

console.log('\n§5a access patterns');
const byCat = await call('/api/admin/products?category=Porcelain%20Slab%20Tiles');
check('the category partition returns it', (byCat.body?.items || []).some((p) => p.sku === SKU), byCat.body?.total);
const wrongCat = await call('/api/admin/products?category=Ceramic%20Tiles');
check('a different category does not', !(wrongCat.body?.items || []).some((p) => p.sku === SKU));
const byActive = await call('/api/admin/products?active=true');
check('the active index returns it', (byActive.body?.items || []).some((p) => p.sku === SKU));
const byFacets = await call('/api/admin/products?category=Porcelain%20Slab%20Tiles&finish=Matt&colour=Beige&size=800%C3%971600');
check('size + finish + colour filter together', (byFacets.body?.items || []).some((p) => p.sku === SKU), byFacets.body?.total);
const missFacet = await call('/api/admin/products?category=Porcelain%20Slab%20Tiles&finish=Glossy');
check('a facet that does not match excludes it', !(missFacet.body?.items || []).some((p) => p.sku === SKU));
const byKeyword = await call(`/api/admin/products?q=${encodeURIComponent(SKU.toLowerCase())}`);
check('keyword search finds it', (byKeyword.body?.items || []).some((p) => p.sku === SKU), byKeyword.body?.total);

console.log('\ndeactivate');
const off = await call(`/api/admin/products/${SKU}`, { method: 'PUT', body: JSON.stringify(product(SKU, { active: false })) });
check('the product updates', off.body?.ok === true, off.body);
const activeAfter = await call('/api/admin/products?active=true');
check('it drops out of the active index', !(activeAfter.body?.items || []).some((p) => p.sku === SKU));
const inactiveAfter = await call('/api/admin/products?active=false');
check('and appears in the inactive view', (inactiveAfter.body?.items || []).some((p) => p.sku === SKU));
await call(`/api/admin/products/${SKU}`, { method: 'PUT', body: JSON.stringify(product(SKU, { active: true })) });

console.log('\nCSV import');
const csv = [
  'sku,name,category,sizes,surfaceFinish,surfaceApplication,colourFamily,description,tags,active,featured,sortOrder',
  `${SKU2},E2E Import Tile,Ceramic Tiles,600x1200;600x600,Glossy,Wall;Floor,White,From the import template,e2e;import,true,false,5`,
  `${SKU2}-BAD,Broken Row,Ceramic Tiles,not-a-size,Glossy,Wall,White,,,true,false,0`,
].join('\n');
const form = new FormData();
form.append('file', new File([csv], 'import.csv', { type: 'text/csv' }));
form.append('mode', 'create');
const imported = await call('/api/admin/import', { method: 'POST', body: form });
check('a good row is created', imported.body?.summary?.created === 1, imported.body?.summary);
check('a bad row is reported, not silently dropped', imported.body?.summary?.errors === 1, imported.body?.report);
check('the error names the offending column', /sizes/.test(imported.body?.report?.find((r) => r.status === 'error')?.message || ''), imported.body?.report);
if (imported.body?.summary?.created === 1) created.push(SKU2);

const form2 = new FormData();
form2.append('file', new File([csv], 'import.csv', { type: 'text/csv' }));
form2.append('mode', 'create');
const reimport = await call('/api/admin/import', { method: 'POST', body: form2 });
check('re-importing in create mode refuses the existing SKU', reimport.body?.summary?.created === 0, reimport.body?.summary);

const form3 = new FormData();
form3.append('file', new File([csv], 'import.csv', { type: 'text/csv' }));
form3.append('mode', 'upsert');
const upsert = await call('/api/admin/import', { method: 'POST', body: form3 });
check('upsert mode updates instead', upsert.body?.summary?.updated === 1, upsert.body?.summary);

const multi = await call(`/api/admin/products/${SKU2}`);
check('semicolon cells became arrays', (multi.body?.product?.sizes || []).length === 2
  && (multi.body?.product?.surfaceApplication || []).length === 2, multi.body?.product);

console.log('\nmedia pipeline (§5b)');
const master = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#b8a68f' } }).png().toBuffer();
const up = new FormData();
up.append('file', new File([master], 'master.png', { type: 'image/png' }));
up.append('sku', SKU);
up.append('kind', 'image');
const uploaded = await call('/api/admin/upload', { method: 'POST', body: up });
check('the upload is accepted', uploaded.body?.ok === true, uploaded.body);

const img = uploaded.body?.image || {};
check('three derivatives plus a master come back', ['card', 'detail', 'zoom', 'master'].every((k) => typeof img[k] === 'string'), img);

if (img.card) {
  const widths = {};
  for (const name of ['card', 'detail', 'zoom']) {
    const rel = String(img[name]).replace(/^\//, '');
    const meta = await sharp(await fs.readFile(path.join(process.cwd(), 'public', rel))).metadata();
    widths[name] = `${meta.width}/${meta.format}`;
  }
  check('derivatives are WebP at 600 / 1200 / 2400', widths.card === '600/webp'
    && widths.detail === '1200/webp' && widths.zoom === '2400/webp', widths);
  check('the master is not served from products/', !String(img.master).includes('/products/'), img.master);
}

const fake = new FormData();
fake.append('file', new File([Buffer.from('MZ this is an executable, not a picture')], 'evil.png', { type: 'image/png' }));
fake.append('sku', SKU);
fake.append('kind', 'image');
const sniffed = await call('/api/admin/upload', { method: 'POST', body: fake });
check('a non-image claiming image/png is refused by the decoder', sniffed.status === 400, sniffed.body);

const fakePdf = new FormData();
fakePdf.append('file', new File([Buffer.from('<html><script>alert(1)</script>')], 'spec.pdf', { type: 'application/pdf' }));
fakePdf.append('sku', SKU);
fakePdf.append('kind', 'pdf');
const sniffedPdf = await call('/api/admin/upload', { method: 'POST', body: fakePdf });
check('a non-PDF claiming application/pdf is refused', sniffedPdf.status === 400, sniffedPdf.body);

console.log('\ndelete');
for (const sku of created) {
  const del = await call(`/api/admin/products/${sku}`, { method: 'DELETE' });
  check(`${sku} is removed`, del.body?.ok === true, del.body);
  const gone = await call(`/api/admin/products/${sku}`);
  check(`${sku} is gone afterwards`, gone.status === 404, gone.status);
}

console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} check(s) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
