'use client';

import { useState } from 'react';

const INTERESTS = ['Import', 'Distribution', 'OEM & Private Label', 'Project Supply'];

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'country', label: 'Country', type: 'text', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
] as const;

export default function InquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/inquiry', {
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
      <div className="inquiry inquiry--sent">
        <p className="h-mid">Thank you.</p>
        <p className="text-small">
          Your inquiry is with our export team. You will hear from us within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry" onSubmit={onSubmit} noValidate>
      <p className="text-small inquiry__kicker">Export inquiry</p>
      <div className="inquiry__grid">
        {FIELDS.map((f) => (
          <div className="field" key={f.name}>
            <label className="text-small" htmlFor={`f-${f.name}`}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            <input id={`f-${f.name}`} name={f.name} type={f.type} autoComplete="off" />
            {errors[f.name] && <span className="field__error text-small">{errors[f.name]}</span>}
          </div>
        ))}
        <div className="field">
          <label className="text-small" htmlFor="f-interest">
            Interest
          </label>
          <select id="f-interest" name="interest" defaultValue={INTERESTS[0]}>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field field--wide">
        <label className="text-small" htmlFor="f-message">
          Message
        </label>
        <textarea id="f-message" name="message" rows={3} />
      </div>
      {errors.form && <p className="field__error text-small">{errors.form}</p>}
      <button type="submit" className="btn btn--underline btn--red" disabled={sending}>
        <span className="btn__mask">
          <span className="btn__text">{sending ? 'Sending…' : 'Send Inquiry'}</span>
          <span className="btn__text btn__text--clone">{sending ? 'Sending…' : 'Send Inquiry'}</span>
        </span>
      </button>
    </form>
  );
}
