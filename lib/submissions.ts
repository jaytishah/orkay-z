import { z } from 'zod';
import { DEALER_CODE, consentGiven, normaliseDealerCode, optionalCheckbox } from './dealers';

/* Re-exported so a client component gets the dealer-code helpers from the
   same module as SUPPORT_TYPES, rather than reaching into lib/dealers. */
export { DEALER_CODE, normaliseDealerCode };

/* ════════════════════════════════════════════════════════════════════
   Submissions — the CMS side of the three contact-page forms.

   Three CTAs on /contact, three destinations:

     inquiry  general enquiry  →  Submission kind 'inquiry'
     dealer   apply online     →  lib/dealers.ts (Module 10, its own record,
                                  because an application has a status ladder,
                                  a territory reservation and an e-signature)
     support  dealer support   →  Submission kind 'support'

   One record type carries both submission kinds rather than two parallel
   families: they differ only in their payload, and the admin inbox reads
   them through the same list, detail and status controls.

     Record   PK SUB#<id>          SK META
     Queue    GSI3PK KIND#<kind>   GSI3SK <createdAt>   (GSI3 = the index
              §5a already provisions for the dealer queue — a new partition
              prefix on the same index, not a new index)

   `name`, `email` and `summary` are denormalised onto the record so the
   admin table never has to know what shape `data` is for a given kind.
   ════════════════════════════════════════════════════════════════════ */

export const SUBMISSION_KINDS = ['inquiry', 'support'] as const;
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number];

/* A support ticket legitimately moves backwards — a dealer replies to a
   closed request and it reopens — so there is deliberately no transition
   table here. Compare ALLOWED_TRANSITIONS in lib/dealers.ts, where the
   ladder is load-bearing because it gates a binding signature. */
export const SUBMISSION_STATUSES = ['new', 'open', 'closed'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/* ─── 01 · general enquiry ─────────────────────────────────────────── */

export const INTERESTS = [
  'Import', 'Distribution', 'OEM & Private Label', 'Project Supply', 'Something else',
] as const;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Tell us who you are').max(120),
  company: z.string().trim().min(2, 'Required').max(160),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  country: z.string().trim().min(2, 'Required').max(80),
  phone: z.string().trim().max(40).default(''),
  interest: z.enum(INTERESTS).default('Import'),
  message: z.string().trim().max(2000).default(''),
  consentContact: consentGiven,
  consentMarketing: optionalCheckbox.default(false),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/* ─── 03 · dealer support programme ────────────────────────────────── */

/* The benefits /dealers actually promises, turned into things a dealer can
   ask for. Keep this list and dealerPage.benefits in step — a request type
   with no matching promise is a request the desk cannot fulfil. */
export const SUPPORT_TYPES = [
  'Display racks & sample boards',
  'Catalogue & marketing assets',
  'Showroom branding & signage',
  'Batch hold for a project',
  'Pricing & stock support',
  'Technical support & datasheets',
  'Quality claim',
  'Something else',
] as const;

export const SUPPORT_URGENCY = ['Routine', 'Within a month', 'Urgent — project deadline'] as const;

export const supportRequestSchema = z.object({
  dealerCode: z.string()
    .transform(normaliseDealerCode)
    .refine((v) => DEALER_CODE.test(v), 'Your dealer code looks like ORK-4KJ7QP'),
  contactName: z.string().trim().min(2, 'Required').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z.string().trim()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+?91)/, ''))
    .refine((v) => /^[6-9][0-9]{9}$/.test(v), 'Enter a 10-digit Indian mobile number'),
  showroomName: z.string().trim().min(2, 'Required').max(160),
  city: z.string().trim().min(2, 'Required').max(80),
  requestType: z.enum(SUPPORT_TYPES),
  /* free text, not a number: "2 racks + 1 board" is a real answer and a
     number input would force the dealer to lose half of it */
  quantity: z.string().trim().max(120).default(''),
  urgency: z.enum(SUPPORT_URGENCY).default('Routine'),
  details: z.string().trim().min(10, 'A line or two about what you need').max(2000),
  consentContact: consentGiven,
});

export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

/* ─── the stored record ────────────────────────────────────────────── */

export type Submission = {
  id: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  /** denormalised for the admin list, so the table never parses `data` */
  name: string;
  email: string;
  summary: string;
  /** set only when the record is tied to an appointed dealer */
  dealerCode: string | null;
  data: Record<string, unknown>;
  /** what the desk wrote when it worked the record */
  adminNote: string;
  handledBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface SubmissionStore {
  createSubmission(s: Submission): Promise<void>;
  getSubmission(id: string): Promise<Submission | null>;
  /** newest first, the order the queue GSI is read in */
  listSubmissions(kind?: SubmissionKind, status?: SubmissionStatus): Promise<Submission[]>;
  updateSubmission(s: Submission): Promise<void>;
}

function base(id: string, kind: SubmissionKind): Pick<Submission, 'id' | 'kind' | 'status' | 'adminNote' | 'handledBy' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString();
  return { id, kind, status: 'new', adminNote: '', handledBy: null, createdAt: now, updatedAt: now };
}

export function toInquirySubmission(input: InquiryInput, id: string): Submission {
  return {
    ...base(id, 'inquiry'),
    name: input.name,
    email: input.email,
    summary: `${input.interest} · ${input.company}, ${input.country}`,
    dealerCode: null,
    data: input,
  };
}

export function toSupportSubmission(
  input: SupportRequestInput,
  id: string,
  firmName: string,
): Submission {
  return {
    ...base(id, 'support'),
    name: input.contactName,
    email: input.email,
    summary: `${input.requestType} · ${firmName || input.showroomName}, ${input.city}`,
    dealerCode: input.dealerCode,
    data: { ...input, firmName },
  };
}

/** The applicant/dealer-facing shape. Never echo the stored record back. */
export function publicSubmissionView(s: Submission) {
  return { id: s.id, kind: s.kind, createdAt: s.createdAt };
}

/** `4KJ7QP` — the short handle a dealer can read down a phone line. */
export function reference(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}
