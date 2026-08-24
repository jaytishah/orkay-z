'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES, FINISHES, APPLICATIONS, COLOUR_FAMILIES, type Product, type ProductInput,
} from '@/lib/catalog';

/* eslint-disable @next/next/no-img-element -- previews are pre-sized derivatives */

/* The Module 3 form, field for field. The server owns validation (Zod on
   every write); this form just carries values and shows the server's
   per-field messages, so there is exactly one source of truth. */

type Props = { mode: 'create' | 'edit'; initial?: Product };

const EMPTY: ProductInput = {
  sku: '', name: '', category: CATEGORIES[0], sizes: [], surfaceFinish: FINISHES[0],
  surfaceApplication: ['Floor'], colourFamily: COLOUR_FAMILIES[0], description: '',
  images: [], specPdf: null, tags: [], active: true, featured: false, sortOrder: 0,
};

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setSaved(false);
    setP((prev) => ({ ...prev, [k]: v }));
  };

  const toggleApplication = (a: (typeof APPLICATIONS)[number]) => {
    const has = p.surfaceApplication.includes(a);
    set('surfaceApplication', has ? p.surfaceApplication.filter((x) => x !== a) : [...p.surfaceApplication, a]);
  };

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(mode === 'create' ? '/api/admin/products' : `/api/admin/products/${initial!.sku}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.errors || { form: 'Could not save.' });
        return;
      }
      setSaved(true);
      if (mode === 'create') router.push(`/admin/products/${p.sku}`);
      router.refresh();
    } catch {
      setErrors({ form: 'Network error.' });
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct() {
    if (!initial) return;
    if (!window.confirm(`Delete ${initial.sku} permanently? Hiding it (Inactive) is usually enough.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${initial.sku}`, { method: 'DELETE' });
    const json = await res.json();
    setBusy(false);
    if (json.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setErrors({ form: 'Could not delete.' });
    }
  }

  async function uploadFiles(files: FileList | null, kind: 'image' | 'pdf') {
    if (!files?.length) return;
    setUploading(true);
    setErrors({});
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set('file', file);
        form.set('sku', p.sku || 'misc');
        form.set('kind', kind);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
        const json = await res.json();
        if (!json.ok) {
          setErrors({ upload: json.errors?.file || 'Upload failed.' });
          break;
        }
        if (kind === 'pdf') setP((prev) => ({ ...prev, specPdf: json.pdf }));
        else setP((prev) => ({ ...prev, images: [...prev.images, json.image.detail] }));
        setSaved(false);
      }
    } finally {
      setUploading(false);
    }
  }

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...p.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  };

  return (
    <form
      className="adm-form"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="adm-grid">
        <div className="adm-field">
          <label className="text-small" htmlFor="f-sku">SKU *</label>
          <input id="f-sku" value={p.sku} onChange={(e) => set('sku', e.target.value)} disabled={mode === 'edit'} required />
          {errors.sku ? <span className="text-small adm-err">{errors.sku}</span> : null}
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-name">Name *</label>
          <input id="f-name" value={p.name} onChange={(e) => set('name', e.target.value)} required />
          {errors.name ? <span className="text-small adm-err">{errors.name}</span> : null}
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-category">Category *</label>
          <select id="f-category" value={p.category} onChange={(e) => set('category', e.target.value as ProductInput['category'])}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-sizes">Sizes * <span className="adm-muted">(mm, ;-separated — 600x1200;600x600)</span></label>
          <input
            id="f-sizes"
            value={p.sizes.join(';')}
            onChange={(e) => set('sizes', e.target.value.split(';').map((s) => s.trim()).filter(Boolean))}
            placeholder="600x1200;600x600"
          />
          {Object.keys(errors).filter((k) => k.startsWith('sizes')).map((k) => (
            <span key={k} className="text-small adm-err">{errors[k]}</span>
          ))}
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-finish">Surface finish *</label>
          <select id="f-finish" value={p.surfaceFinish} onChange={(e) => set('surfaceFinish', e.target.value as ProductInput['surfaceFinish'])}>
            {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-colour">Colour family *</label>
          <select id="f-colour" value={p.colourFamily} onChange={(e) => set('colourFamily', e.target.value as ProductInput['colourFamily'])}>
            {COLOUR_FAMILIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="adm-field">
        <span className="text-small" style={{ color: 'var(--c-gray-light)' }}>Surface application *</span>
        <div className="adm-checks text-small">
          {APPLICATIONS.map((a) => (
            <label key={a} className={`adm-check${p.surfaceApplication.includes(a) ? ' is-on' : ''}`}>
              <input type="checkbox" checked={p.surfaceApplication.includes(a)} onChange={() => toggleApplication(a)} />
              {a}
            </label>
          ))}
        </div>
        {errors.surfaceApplication ? <span className="text-small adm-err">{errors.surfaceApplication}</span> : null}
      </div>

      <div className="adm-field adm-field--wide">
        <label className="text-small" htmlFor="f-desc">Description</label>
        <textarea id="f-desc" rows={4} value={p.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="adm-field adm-field--wide">
        <span className="text-small" style={{ color: 'var(--c-gray-light)' }}>
          Image gallery <span className="adm-muted">(JPEG/PNG/WebP ≤15 MB — derivatives are generated at upload)</span>
        </span>
        {p.images.length ? (
          <div className="adm-images">
            {p.images.map((src, i) => (
              <figure key={src + i}>
                <img src={src} alt={`Product image ${i + 1}`} />
                <button type="button" onClick={() => set('images', p.images.filter((_, n) => n !== i))}>×</button>
                <button type="button" style={{ right: 'auto', left: 6 }} onClick={() => moveImage(i, -1)} aria-label="Move earlier">←</button>
              </figure>
            ))}
          </div>
        ) : null}
        <label className={`adm-drop text-small${uploading ? ' is-busy' : ''}`}>
          {uploading ? 'Uploading…' : 'Click to add images (the first image is the catalog card)'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void uploadFiles(e.target.files, 'image')} />
        </label>
        {errors.upload ? <span className="text-small adm-err">{errors.upload}</span> : null}
      </div>

      <div className="adm-grid">
        <div className="adm-field">
          <span className="text-small" style={{ color: 'var(--c-gray-light)' }}>Spec PDF</span>
          {p.specPdf ? (
            <span className="text-small">
              <a href={p.specPdf} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>attached ↗</a>
              {' '}
              <button type="button" className="adm-muted" style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => set('specPdf', null)}>
                remove
              </button>
            </span>
          ) : (
            <label className="adm-drop text-small">
              Attach PDF
              <input type="file" accept="application/pdf" hidden onChange={(e) => void uploadFiles(e.target.files, 'pdf')} />
            </label>
          )}
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-tags">Section tags <span className="adm-muted">(;-separated)</span></label>
          <input id="f-tags" value={p.tags.join(';')} onChange={(e) => set('tags', e.target.value.split(';').map((s) => s.trim()).filter(Boolean))} />
        </div>
        <div className="adm-field">
          <label className="text-small" htmlFor="f-sort">Sort order</label>
          <input id="f-sort" type="number" min={0} value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="adm-checks text-small">
        <label className={`adm-check${p.active ? ' is-on' : ''}`}>
          <input type="checkbox" checked={p.active} onChange={() => set('active', !p.active)} />
          Active — visible on the website
        </label>
        <label className={`adm-check${p.featured ? ' is-on' : ''}`}>
          <input type="checkbox" checked={p.featured} onChange={() => set('featured', !p.featured)} />
          Featured / hero design
        </label>
      </div>

      {errors.form ? <p className="text-small adm-err">{errors.form}</p> : null}
      {saved ? <p className="text-small adm-ok">Saved — live on the site.</p> : null}

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn--underline btn--red" disabled={busy || uploading}>
          <span className="btn__mask">
            <span className="btn__text">{busy ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}</span>
            <span className="btn__text btn__text--clone">{busy ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}</span>
          </span>
        </button>
        {mode === 'edit' ? (
          <button type="button" className="btn btn--underline" disabled={busy} onClick={() => void removeProduct()}>
            <span className="btn__mask">
              <span className="btn__text">Delete permanently</span>
              <span className="btn__text btn__text--clone">Delete permanently</span>
            </span>
          </button>
        ) : null}
      </div>
    </form>
  );
}
