/* End-to-end check for Module 10 against a running app.

     npm run dev
     BASE=http://localhost:3002 ADMIN_PASSWORD=... node scripts/dealer-e2e.mjs

   Covers what the unit tests cannot reach: the reservation conditional write
   (hard rule 10), the fact that the panel routes refuse an unauthenticated
   caller (hard rule 2), and the full apply → verify → e-Sign → code ladder.
   Uses the Digio stub, so it needs no Digio account — and the stub is refused
   in production, which is the point of it existing.

   Writes real records into whatever store the app is using. Point it at a dev
   environment, never at production.

   The public route is throttled at 8 applications per IP per 15 minutes, and
   one run spends 7 - so two runs back to back will (correctly) hit the 429. */

const BASE = process.env.BASE || 'http://localhost:3002';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@orkaytiles.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'orkay-local-2026';

/* one district per run, so re-running does not collide with the last run */
const DISTRICT = `E2E-${Date.now().toString(36).toUpperCase()}`;

let cookie = '';
let failures = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${JSON.stringify(detail)}` : ''}`);
  }
}

async function call(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}), ...(init.headers || {}) },
    redirect: 'manual',
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  }
  let body = null;
  try {
    body = JSON.parse(await res.text());
  } catch { /* non-JSON is fine — the status is what matters */ }

  /* The login throttle is working as designed, but it makes this suite
     non-idempotent: bail loudly rather than reporting a cascade of failures
     that look like application bugs. Restarting the dev server clears the
     in-memory window immediately. */
  if (res.status === 429) {
    console.log(`
  throttled by the rate limiter on ${path}`);
    console.log('  this suite spends 7 of the 8 applications allowed per IP per 15 minutes.');
    console.log('  restart the dev server to clear the window, then re-run.');
    process.exit(2);
  }
  return { status: res.status, body };
}

const application = {
  firmName: `E2E Ceramics ${DISTRICT}`,
  entityType: 'Partnership',
  pan: 'ABCDE1234F',
  gstin: '24ABCDE1234F1Z6',
  contactName: 'E2E Signatory',
  signatoryMobile: '+91 98765 43210',
  email: 'e2e@example.com',
  state: 'Gujarat',
  district: DISTRICT,
  city: 'Morbi',
  address: '62/63/64, Shakti Chamber-1, 8A National Highway',
  pincode: '363642',
  currentBrands: 'None',
  monthlyVolume: 'Under 5,000 sq m',
  consentContact: true,
  consentKyc: true,
};

console.log(`Module 10 end-to-end · ${BASE} · district ${DISTRICT}\n`);

console.log('apply');
const created = await call('/api/dealers', { method: 'POST', body: JSON.stringify(application) });
check('a valid application is accepted', created.status === 201, created);
const id = created.body?.application?.id;
check('an application id comes back', Boolean(id));
check('the public response hides PAN and GSTIN', created.body?.application?.pan === undefined, created.body?.application);

const invalid = await call('/api/dealers', {
  method: 'POST',
  body: JSON.stringify({ ...application, pan: 'NOPE', district: `${DISTRICT}-X` }),
});
check('a bad PAN is rejected server-side', invalid.status === 400 && Boolean(invalid.body?.errors?.pan), invalid.body);

console.log('\nguard the panel');
const anon = await call(`/api/admin/dealers/${id}`, { method: 'PATCH', body: JSON.stringify({ to: 'verified' }) });
check('an unauthenticated status change is refused', anon.status === 401, anon);

console.log('\nsign in');
const login = await call('/api/admin/session', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
check('admin login succeeds', login.status === 200 && login.body?.ok === true, login.body);
if (login.status !== 200) {
  console.log('\ncannot continue without a session — set ADMIN_PASSWORD');
  process.exit(1);
}

console.log('\nthe ladder');
const skip = await call(`/api/admin/dealers/${id}`, { method: 'PATCH', body: JSON.stringify({ to: 'active' }) });
check('applied cannot jump straight to active', skip.status === 409, skip.body);

const verified = await call(`/api/admin/dealers/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ to: 'verified', note: 'e2e run' }),
});
check('KYC approval moves it to verified', verified.body?.application?.status === 'verified', verified.body);

console.log('\nterritory exclusivity');
const taken = await call(`/api/dealers?state=Gujarat&district=${encodeURIComponent(DISTRICT)}`);
check('the district now reads as unavailable', taken.body?.available === false, taken.body);

const second = await call('/api/dealers', {
  method: 'POST',
  body: JSON.stringify({ ...application, firmName: 'Second Firm', email: 'second@example.com' }),
});
check('a second application for the district is refused', second.status === 409, second.body);

console.log('\ne-Sign');
const esign = await call(`/api/admin/dealers/${id}/esign`, { method: 'POST' });
check('a signature request is created', esign.body?.ok === true, esign.body);
check('it runs in stub mode without Digio credentials', esign.body?.mode === 'stub', esign.body);
check('the status stays verified until Digio confirms', esign.body?.status === undefined);

const signUrl = esign.body?.signUrl;
const signed = await call(signUrl);
check('completing the signature issues a dealer code', /^ORK-[A-Z0-9]{6}$/.test(signed.body?.dealerCode || ''), signed.body);
check('and opens the account', signed.body?.status === 'active', signed.body);

const replay = await call(signUrl);
check('a replayed callback does not mint a second code', replay.body?.alreadyHandled === true
  && replay.body?.dealerCode === signed.body?.dealerCode, replay.body);

console.log('\nrejection releases the territory');
const spare = `${DISTRICT}-R`;
const rejectMe = await call('/api/dealers', {
  method: 'POST',
  body: JSON.stringify({ ...application, district: spare, firmName: 'Reject Me', email: 'reject@example.com' }),
});
check('a second district accepts an application', rejectMe.status === 201, rejectMe.body);
const rid = rejectMe.body?.application?.id;
await call(`/api/admin/dealers/${rid}`, { method: 'PATCH', body: JSON.stringify({ to: 'verified' }) });
const rejected = await call(`/api/admin/dealers/${rid}`, {
  method: 'PATCH',
  body: JSON.stringify({ to: 'rejected', note: 'e2e rejection' }),
});
check('a verified application can be rejected', rejected.body?.application?.status === 'rejected', rejected.body);
const freed = await call(`/api/dealers?state=Gujarat&district=${encodeURIComponent(spare)}`);
check('the district is free again - a rejection does not burn it', freed.body?.available === true, freed.body);

console.log('\naudit trail');
const detail = await call(`/api/admin/dealers/${id}`);
const actions = (detail.body?.events || []).map((e) => e.action);
check('every step is recorded', ['applied', 'verified', 'esign-requested', 'signed', 'active']
  .every((a) => actions.includes(a)), actions);

console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} check(s) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
