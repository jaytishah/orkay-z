import { z } from 'zod';

/* ════════════════════════════════════════════════════════════════════
   The dealer seam (Module 10) — sibling of lib/catalog.ts.

   Apply online → Verify (KYC + Orkay approval) → e-Sign (Digio Aadhaar
   OTP) → automatic unique dealer code. The key design is INSTRUCTIONS
   §5a "Dealers table", verbatim:

     Application  PK DEALER#<id>        SK META
     Audit trail  PK DEALER#<id>        SK EVENT#<iso>     append-only
     Admin queue  GSI3PK STATUS#<s>     GSI3SK <createdAt>
     Reservation  PK DEALERCODE#<code>  SK RESERVED
                  PK DISTRICT#<key>     SK RESERVED

   Uniqueness — the dealer code AND the One District, One Dealer
   territory — is a conditional write, never check-then-write
   (CLAUDE.md hard rule 10). `DealerStore.reserve` is that one
   primitive; both callers go through it.
   ════════════════════════════════════════════════════════════════════ */

/* States and union territories, so `DISTRICT#<state>#<district>` is a stable
   key. A free-text state would let "Gujarat" and "GUJRAT" both be appointed
   in the same territory — the reservation would not collide, and the promise
   on /dealers quietly breaks. */
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export const ENTITY_TYPES = [
  'Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'HUF', 'Other',
] as const;

export const VOLUME_BANDS = [
  'Under 5,000 sq m', '5,000 – 15,000 sq m', '15,000 – 40,000 sq m', 'Over 40,000 sq m',
] as const;

/* applied → verified → signed → active, with rejected as the dead end.
   The GSI partition is STATUS#<one of these> (§5a). */
export const DEALER_STATUSES = ['applied', 'verified', 'signed', 'active', 'rejected'] as const;
export type DealerStatus = (typeof DEALER_STATUSES)[number];

/* Which moves the admin is allowed to make from where. The API reads this
   table rather than trusting a status posted by the client — a dealer must
   not reach `active` without passing through the signature. */
export const ALLOWED_TRANSITIONS: Record<DealerStatus, DealerStatus[]> = {
  applied: ['verified', 'rejected'],
  verified: ['signed', 'rejected'],
  signed: ['active'],
  active: [],
  rejected: [],
};

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MOBILE = /^[6-9][0-9]{9}$/;

/* GSTIN's 15th character is a mod-36 check digit over the first 14. It costs
   nothing and catches the transposed character the regex cannot see — worth
   having on its own, and worth having anyway because the live GST lookup
   needs Orkay's Digio credentials and may be absent, or down. */
const GST_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function gstinChecksumOk(gstin: string): boolean {
  const g = gstin.trim().toUpperCase();
  if (!GSTIN.test(g)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GST_ALPHABET.indexOf(g[i]);
    if (value < 0) return false;
    /* alternating weights 1, 2 — the product carries into the next decade */
    const product = value * ((i % 2) + 1);
    sum += Math.floor(product / GST_ALPHABET.length) + (product % GST_ALPHABET.length);
  }
  const expected = GST_ALPHABET[(GST_ALPHABET.length - (sum % GST_ALPHABET.length)) % GST_ALPHABET.length];
  return expected === g[14];
}

/* What a GST registry lookup came back with. It lives here rather than in
   lib/digio.ts because the dealer types cross the client boundary and
   digio.ts is server-only — the type travels, the API client does not. */
export type GstinVerification = {
  /** true only when the registry positively confirmed this GSTIN */
  verified: boolean;
  legalName?: string;
  tradeName?: string;
  /** 'Active', 'Cancelled', 'Suspended' … as the registry words it */
  registrationStatus?: string;
  address?: string;
  /** 'live' when the registry answered; 'unchecked' when we could not ask */
  mode: 'live' | 'unchecked';
  /** why it failed, when the registry said it failed */
  reason?: string;
  at: string;
};

/* An HTML checkbox posts "on" or nothing; JSON clients post a real boolean.
   Accept both at the boundary rather than trusting the form to normalise. */
export const optionalCheckbox = z.preprocess((v) => v === 'on' || v === true || v === 'true', z.boolean());
export const consentGiven = z.preprocess(
  (v) => v === 'on' || v === true || v === 'true',
  z.literal(true, 'This consent is required'),
);

/* Module 10's application, field for field. Validated server-side before the
   write (hard rule 3) — the browser form never carries the rules alone. */
export const dealerApplicationSchema = z.object({
  firmName: z.string().trim().min(2).max(160),
  entityType: z.enum(ENTITY_TYPES),
  /* uppercased before the regex so a dealer typing lowercase is not rejected
     for a formatting reason they cannot see */
  pan: z.string().trim().toUpperCase().regex(PAN, 'PAN looks like ABCDE1234F'),
  gstin: z.string().trim().toUpperCase()
    .regex(GSTIN, 'Enter a valid 15-character GSTIN')
    .refine(gstinChecksumOk, 'That GSTIN fails its own check digit — look for a typo'),
  contactName: z.string().trim().min(2).max(120),
  /* the person who will receive the Aadhaar OTP — Digio signs against this number */
  /* +91, spaces and dashes are how people actually type a mobile number;
     strip them before validating so the form does not fail on punctuation */
  signatoryMobile: z.string().trim()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+?91)/, ''))
    .refine((v) => MOBILE.test(v), 'Enter a 10-digit Indian mobile number'),
  email: z.string().trim().toLowerCase().email(),
  state: z.enum(STATES),
  district: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(10).max(400),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Enter a 6-digit PIN code'),
  currentBrands: z.string().trim().max(400).default(''),
  monthlyVolume: z.enum(VOLUME_BANDS),
  creditRequested: optionalCheckbox.default(false),
  bankReference: z.string().trim().max(200).default(''),
  notes: z.string().trim().max(2000).default(''),
  /* CR L-05: the opt-in wording and the moment it was given travel with the record */
  consentContact: consentGiven,
  consentKyc: consentGiven,
});

export type DealerApplicationInput = z.infer<typeof dealerApplicationSchema>;

export type DealerApplication = DealerApplicationInput & {
  id: string;
  status: DealerStatus;
  districtKey: string;
  dealerCode: string | null;
  /* Digio's handle on the agreement, kept so the audit trail can be re-fetched */
  digioDocumentId: string | null;
  /* Server-side result of the GST lookup at the moment of application. Never
     taken from the browser: the form shows the same answer, but what is
     stored is what our own server asked the registry. */
  gstVerification: GstinVerification | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DealerEvent = {
  at: string;
  /* 'applicant' for the public form, an admin email for panel actions,
     'digio' for webhook callbacks — every state change names its actor */
  actor: string;
  action: string;
  note?: string;
  ip?: string;
};

export type ReservationKind = 'DEALERCODE' | 'DISTRICT';

export interface DealerStore {
  createApplication(app: DealerApplication): Promise<void>;
  getApplication(id: string): Promise<DealerApplication | null>;
  updateApplication(app: DealerApplication): Promise<void>;
  listApplications(status?: DealerStatus): Promise<DealerApplication[]>;
  appendEvent(id: string, event: DealerEvent): Promise<void>;
  listEvents(id: string): Promise<DealerEvent[]>;
  /** Conditional write. `false` means the key was already taken — hard rule 10. */
  reserve(kind: ReservationKind, key: string, applicationId: string): Promise<boolean>;
  /** Give a reservation back — only the application that holds it may. Rejecting
      a verified dealer must not burn their district forever. */
  release(kind: ReservationKind, key: string, applicationId: string): Promise<void>;
  /** Who holds this key, if anyone. Advisory only — never gate a write on it. */
  reservationHolder(kind: ReservationKind, key: string): Promise<string | null>;
}

/** `gujarat#morbi` — the shape both the availability check and the reservation use. */
export function districtKey(state: string, district: string): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${norm(state)}#${norm(district)}`;
}

/* Crockford-ish alphabet: no O/0/I/1, because these codes get read down a
   phone line to the Morbi desk. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/* ponytail: random + conditional-write retry, not a sequence counter. A counter
   would need its own atomic item and gains nothing — 32^6 is ~1e9 codes, and
   the reservation is what actually guarantees uniqueness either way. */
export function makeDealerCode(random: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < 6; i += 1) out += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return `ORK-${out}`;
}

/* The same alphabet read the other way, for the dealer support form —
   built from CODE_ALPHABET rather than spelled out again, so widening the
   alphabet cannot leave the reader rejecting codes the generator issues. */
export const DEALER_CODE = new RegExp(`^ORK-[${CODE_ALPHABET}]{6}$`);

/** Uppercase, drop punctuation and spacing, and put the one dash back. */
export function normaliseDealerCode(raw: string): string {
  const flat = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return flat.startsWith('ORK') ? `ORK-${flat.slice(3)}` : flat;
}

/** Everything derived lives here so both stores stay identical. */
export function toApplication(input: DealerApplicationInput, id: string): DealerApplication {
  const now = new Date().toISOString();
  return {
    ...input,
    id,
    status: 'applied',
    districtKey: districtKey(input.state, input.district),
    dealerCode: null,
    digioDocumentId: null,
    gstVerification: null,
    signedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function canTransition(from: DealerStatus, to: DealerStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/* The application carries PAN, GSTIN and a mobile number. Nothing outside the
   admin panel needs them, so the public confirmation gets this shape instead. */
export function publicView(app: DealerApplication) {
  return {
    id: app.id,
    firmName: app.firmName,
    status: app.status,
    dealerCode: app.dealerCode,
    createdAt: app.createdAt,
  };
}
