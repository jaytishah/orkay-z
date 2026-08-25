import crypto from 'node:crypto';
import type { DealerApplication, GstinVerification } from './dealers';

/* ════════════════════════════════════════════════════════════════════
   Digio Aadhaar-OTP e-Sign (Module 10), server-to-server only.

   Two modes, chosen by whether credentials are present:

   - live  DIGIO_CLIENT_ID + DIGIO_CLIENT_SECRET set → real sign requests
   - stub  credentials absent AND not production → a local fake so the
           onboarding flow is testable before Orkay's Digio account exists,
           mirroring how lib/../api/inquiry treats GHL_WEBHOOK_URL

   In production the stub is refused outright: a fake signature that looks
   real is worse than a visible outage, because the dealer agreement it
   would "sign" is the legally binding one (IT Act 2000).

   Digio's account and per-signature charges are Orkay's, at actuals
   (quotation Module 10), and the agreement TEXT is supplied by Orkay —
   legal drafting is explicitly out of scope (INSTRUCTIONS §9). We therefore
   never generate the contract: DIGIO_TEMPLATE_ID points at the template
   Orkay has approved inside their own Digio account.

   ⚠ ENDPOINT PATHS AND THE WEBHOOK HEADER ARE UNVERIFIED. They follow
   Digio's published v2 shapes, but nobody here has run them against a live
   key. Confirm both against Digio's current docs when Orkay's credentials
   arrive — that is a 20-minute job with a sandbox key and the only part of
   this module that cannot be tested without one.
   ════════════════════════════════════════════════════════════════════ */

const BASE = process.env.DIGIO_BASE_URL || 'https://api.digio.in';
const CLIENT_ID = process.env.DIGIO_CLIENT_ID;
const CLIENT_SECRET = process.env.DIGIO_CLIENT_SECRET;
const TEMPLATE_ID = process.env.DIGIO_TEMPLATE_ID;
const WEBHOOK_SECRET = process.env.DIGIO_WEBHOOK_SECRET;

export type SignRequest = {
  documentId: string;
  /** where the signatory completes the Aadhaar OTP */
  signUrl: string;
  mode: 'live' | 'stub';
};

export function digioConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && TEMPLATE_ID);
}

/** Thrown when the flow is reachable but Digio is not usable — the route turns this into a 503. */
export class DigioUnavailable extends Error {}

function authHeader(): string {
  return `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;
}

async function digioFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
      ...(init.headers || {}),
    },
    /* a signing request that hangs must not hold a Lambda open to its timeout */
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new DigioUnavailable(`Digio ${path} responded ${res.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new DigioUnavailable(`Digio ${path} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

/* The placeholders Orkay's approved template is expected to expose. Anything
   the template does not use is simply ignored by Digio, so adding a field
   here is safe; removing one the template needs is not. */
function templateValues(app: DealerApplication): Record<string, string> {
  return {
    firm_name: app.firmName,
    entity_type: app.entityType,
    pan: app.pan,
    gstin: app.gstin,
    signatory_name: app.contactName,
    address: `${app.address}, ${app.city}, ${app.district}, ${app.state} ${app.pincode}`,
    territory: `${app.district}, ${app.state}`,
    application_id: app.id,
    application_date: app.createdAt.slice(0, 10),
  };
}

export async function createSignRequest(app: DealerApplication): Promise<SignRequest> {
  if (!digioConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new DigioUnavailable('Digio is not configured on this environment.');
    }
    /* Local/preview only. The "signature" is a link back to our own webhook,
       so the rest of the flow — code issue, audit trail, status — is exercised
       end to end without a Digio account. */
    return {
      documentId: `STUB-${app.id}`,
      signUrl: `/api/digio/webhook?stub=${encodeURIComponent(app.id)}`,
      mode: 'stub',
    };
  }

  const body = {
    template_id: TEMPLATE_ID,
    template_values: templateValues(app),
    signers: [{
      identifier: app.email,
      name: app.contactName,
      /* Aadhaar OTP is the quoted signature type — not a drawn or uploaded image */
      sign_type: 'aadhaar',
      reason: 'Orkay Tiles dealer agreement',
    }],
    expire_in_days: 10,
    send_sign_link: true,
    notify_signers: true,
    /* Digio echoes this back on the webhook, so we never trust a document id
       posted by a caller to tell us which application it belongs to */
    reference_id: app.id,
  };

  const res = (await digioFetch('/v2/client/template/multi_templates/create_sign_request', {
    method: 'POST',
    body: JSON.stringify(body),
  })) as { id?: string; sign_url?: string; signing_parties?: Array<{ signature_url?: string }> };

  const documentId = res.id;
  if (!documentId) throw new DigioUnavailable('Digio did not return a document id.');

  return {
    documentId,
    signUrl: res.sign_url || res.signing_parties?.[0]?.signature_url
      || `https://app.digio.in/#/gateway/login/${documentId}`,
    mode: 'live',
  };
}

/** The executed agreement plus who/when/where — retained against the record. */
export async function fetchDocument(documentId: string): Promise<unknown> {
  if (!digioConfigured()) return { stub: true, documentId };
  return digioFetch(`/v2/client/document/${encodeURIComponent(documentId)}`);
}

/* Webhook authenticity. Digio signs the raw body with the webhook secret;
   compare in constant time and against the bytes we actually received, never
   against a re-serialised object. */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    /* No secret configured: acceptable locally, never in production — an
       unauthenticated webhook can mark any application signed. */
    return process.env.NODE_ENV !== 'production';
  }
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature.trim().replace(/^sha256=/, ''), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ════════════════════════════════════════════════════════════════════
   GST verification (the dealership form on /contact).

   Digio's KYC suite includes a GSTIN lookup against the GST registry, and
   it uses the same client id / secret as the e-Sign calls above — nothing
   extra for Orkay to arrange once the account exists.

   The rule this implements: a lookup that comes back "invalid / cancelled"
   BLOCKS the application. A lookup we could not make — no credentials,
   registry down, network error — does NOT block it, and the record is
   stored carrying mode 'unchecked' so the desk knows to check by hand
   before approving. An outage at Digio must not silently stop every dealer
   application in India.

   ⚠ THE ENDPOINT PATH IS UNVERIFIED, like the e-Sign paths above. Override
   it with DIGIO_GST_PATH rather than editing this file if Digio's current
   docs disagree. The response is read defensively across the field names
   Digio and the GST registry both use.
   ════════════════════════════════════════════════════════════════════ */

const GST_PATH = process.env.DIGIO_GST_PATH || '/v3/client/kyc/fetch_gst_details';

export function gstVerificationConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

function pick(o: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/** Cancelled and suspended registrations are not a valid basis for a dealership. */
function statusIsGood(status: string | undefined): boolean {
  if (!status) return true;
  return !/cancel|suspend|inactive|struck/i.test(status);
}

export async function verifyGstin(gstin: string): Promise<GstinVerification> {
  const at = new Date().toISOString();
  if (!gstVerificationConfigured()) {
    return { verified: false, mode: 'unchecked', reason: 'GST lookup is not configured on this environment.', at };
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await digioFetch(GST_PATH, {
      method: 'POST',
      body: JSON.stringify({ gst_id: gstin, gstin }),
    })) as Record<string, unknown>;
  } catch (err) {
    /* An unreachable registry is an outage, not a verdict — never a block. */
    console.error('[digio] GST lookup failed', err);
    return { verified: false, mode: 'unchecked', reason: 'The GST registry did not answer.', at };
  }

  /* Digio wraps the registry payload one level down on some endpoints. */
  const d = (raw.data && typeof raw.data === 'object' ? raw.data : raw) as Record<string, unknown>;

  const legalName = pick(d, 'legal_name', 'lgnm', 'legalName', 'name');
  const registrationStatus = pick(d, 'status', 'sts', 'gst_status', 'registration_status');

  if (!legalName) {
    return { verified: false, mode: 'live', reason: 'The GST registry has no record of this GSTIN.', at };
  }
  if (!statusIsGood(registrationStatus)) {
    return {
      verified: false, mode: 'live', legalName, registrationStatus,
      reason: `This GSTIN is registered, but the registry reports it as "${registrationStatus}".`, at,
    };
  }

  return {
    verified: true,
    mode: 'live',
    legalName,
    tradeName: pick(d, 'trade_name', 'tradeNam', 'tradeName'),
    registrationStatus,
    address: pick(d, 'address', 'principal_address', 'pradr', 'adr'),
    at,
  };
}
