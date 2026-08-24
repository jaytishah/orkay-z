import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { CATEGORIES, FINISHES, COLOUR_FAMILIES, type ListQuery } from '@/lib/catalog';

/* eslint-disable @next/next/no-img-element -- thumbnails are pre-sized derivatives */

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v || undefined;
}

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const sp = await searchParams;
  const query: ListQuery = {
    category: CATEGORIES.find((c) => c === one(sp.category)),
    finish: FINISHES.find((f) => f === one(sp.finish)),
    colour: COLOUR_FAMILIES.find((c) => c === one(sp.colour)),
    q: one(sp.q),
    active: one(sp.active) === 'true' ? true : one(sp.active) === 'false' ? false : undefined,
    cursor: one(sp.cursor),
    limit: 50,
  };

  const store = await getStore();
  const { items, nextCursor, total } = await store.list(query);

  const nextParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === 'string' && v) nextParams.set(k, v);
  if (nextCursor) nextParams.set('cursor', nextCursor);

  return (
    <main>
      <h1 className="adm-h1">
        Products <span className="adm-muted text-small">{total} in this view</span>
      </h1>

      <form className="adm-bar text-small" method="get">
        <select name="category" defaultValue={query.category || ''}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="finish" defaultValue={query.finish || ''}>
          <option value="">Any finish</option>
          {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select name="colour" defaultValue={query.colour || ''}>
          <option value="">Any colour</option>
          {COLOUR_FAMILIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="active" defaultValue={one(sp.active) || ''}>
          <option value="">Active + inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <input type="search" name="q" placeholder="Search name / SKU…" defaultValue={query.q || ''} />
        <button type="submit" className="btn btn--underline">
          <span className="btn__mask">
            <span className="btn__text">Filter</span>
            <span className="btn__text btn__text--clone">Filter</span>
          </span>
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-small adm-muted">
          Nothing here yet. <Link href="/admin/products/new" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>Add the first product</Link> or
          use <Link href="/admin/import" style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>bulk import</Link>.
        </p>
      ) : (
        <table className="adm-table text-small">
          <thead>
            <tr>
              <th></th>
              <th>Name / SKU</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Finish</th>
              <th>Colour</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.sku}>
                <td>
                  {p.images[0]
                    ? <img className="adm-thumb" src={p.images[0]} alt="" />
                    : <span className="adm-thumb" aria-hidden="true" />}
                </td>
                <td>
                  <Link href={`/admin/products/${p.sku}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
                    {p.name}
                  </Link>
                  <div className="adm-muted">{p.sku}</div>
                </td>
                <td>{p.category}</td>
                <td className="adm-muted">{p.sizes.join(' · ')}</td>
                <td>{p.surfaceFinish}</td>
                <td>{p.colourFamily}</td>
                <td>
                  <span className={`adm-pill ${p.active ? 'adm-pill--on' : 'adm-pill--off'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>{' '}
                  {p.featured ? <span className="adm-pill adm-pill--feat">Featured</span> : null}
                </td>
                <td className="adm-muted">{p.updatedAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {nextCursor ? (
        <p style={{ marginTop: 24 }}>
          <Link className="text-small" href={`/admin?${nextParams.toString()}`} style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Next page →
          </Link>
        </p>
      ) : null}
    </main>
  );
}
