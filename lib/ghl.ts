/* Module 6 — leads out to GoHighLevel.

   Server-side only, and best-effort by design: every form that calls this has
   already written its own durable record, so a CRM outage must not fail the
   request or lose the enquiry. The record in the admin panel is the system of
   record; GHL is a copy for the sales workflow.

   Unset GHL_WEBHOOK_URL logs instead of posting, so all three forms are
   testable before the client's GHL account exists. */

export type Lead = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  message: string;
  source: string;
  /** our own record id, so a lead in GHL can be traced back to the panel */
  submissionId?: string;
  consent?: Record<string, unknown>;
};

/** @returns true when GHL actually accepted the lead. */
export async function forwardLead(lead: Lead): Promise<boolean> {
  const webhook = process.env.GHL_WEBHOOK_URL;
  if (!webhook) {
    console.log('[ghl] GHL_WEBHOOK_URL not set — lead:', lead);
    return false;
  }
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      /* a hanging CRM must not hold a Lambda open to its timeout */
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('[ghl] webhook responded', res.status);
    return res.ok;
  } catch (err) {
    console.error('[ghl] webhook failed', err);
    return false;
  }
}
