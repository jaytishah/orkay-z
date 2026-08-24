import { useState } from 'react';
import type { FormEvent } from 'react';
import { cx } from './cx';

const INTERESTS = ['Import', 'Distribution', 'OEM & Private Label', 'Project Supply'];

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'country', label: 'Country', type: 'text', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
] as const;

export interface InquiryFormProps {
  /** Endpoint the inquiry is POSTed to as JSON. */
  action?: string;
  /** Render the acknowledgement instead of the form. For previews and tests. */
  initialState?: 'form' | 'sent';
  /** Field-keyed messages to render on load. For previews and tests. */
  initialErrors?: Record<string, string>;
  className?: string;
}

/**
 * The B2B export inquiry form — the only form in the system and the one place
 * `Button`'s underline and red variants appear together.
 *
 * Labels sit above their inputs in the 12px role; inputs are underlined rules
 * with no box, no radius and no fill, matching the button species. The interest
 * select drives CRM routing downstream, so its four values are fixed: each maps
 * to a different follow-up sequence.
 *
 * Validation messages come back from the server per field — the client does not
 * duplicate the rules, so there is exactly one source of truth for what is valid.
 */
export function InquiryForm({
  action = '/api/inquiry',
  initialState = 'form',
  initialErrors = {},
  className,
}: InquiryFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(initialState === 'sent');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) setSent(true);
      else setErrors(json.errors || { form: 'Something went wrong.' });
    } catch {
      setErrors({ form: 'Network error. Please email us directly.' });
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className={cx('inquiry', 'inquiry--sent', className)}>
        <p className="h-mid">Thank you.</p>
        <p className="text-small">
          Your inquiry is with our export team. You will hear from us within one business day.
        </p>
      </div>
    );
  }

  const label = sending ? 'Sending…' : 'Send Inquiry';

  return (
    <form className={cx('inquiry', className)} onSubmit={onSubmit} noValidate>
      <p className="text-small inquiry__kicker">Export inquiry</p>
      <div className="inquiry__grid">
        {FIELDS.map((f) => (
          <div className="field" key={f.name}>
            <label className="text-small" htmlFor={'f-' + f.name}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            <input id={'f-' + f.name} name={f.name} type={f.type} autoComplete="off" />
            {errors[f.name] && <span className="field__error text-small">{errors[f.name]}</span>}
          </div>
        ))}
        <div className="field">
          <label className="text-small" htmlFor="f-interest">Interest</label>
          <select id="f-interest" name="interest" defaultValue={INTERESTS[0]}>
            {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div className="field field--wide">
        <label className="text-small" htmlFor="f-message">Message</label>
        <textarea id="f-message" name="message" rows={3} />
      </div>
      {errors.form && <p className="field__error text-small">{errors.form}</p>}
      <button type="submit" className="btn btn--underline btn--red" disabled={sending}>
        <span className="btn__mask">
          <span className="btn__text">{label}</span>
          <span className="btn__text btn__text--clone">{label}</span>
        </span>
      </button>
    </form>
  );
}
