import { z } from 'zod';

/* ════════════════════════════════════════════════════════════════════
   The catalog seam (CLAUDE.md hard rule 8).

   Everything above this module — admin UI, API routes, and later the
   public catalog pages — talks to `CatalogStore`. Two implementations:

   - store/file.ts   JSON file in .data/ — local development, zero setup
   - store/dynamo.ts Amazon DynamoDB    — production, selected by env

   The access patterns mirror INSTRUCTIONS §5a exactly, so swapping the
   file store for Dynamo changes no caller.
   ════════════════════════════════════════════════════════════════════ */

/* The four categories per Change Request Rev 1 §6. */
export const CATEGORIES = [
  'Vitrified Porcelain Tiles',
  'Porcelain Slab Tiles',
  'Ceramic Tiles',
  'Outdoor Tiles',
] as const;

export const FINISHES = ['Glossy', 'Matt', 'Carving', 'Anti-skid', 'Relief'] as const;

export const APPLICATIONS = ['Floor', 'Wall', 'Facade', 'Counter Top', 'Outdoor', 'Wet Area'] as const;

export const COLOUR_FAMILIES = [
  'White', 'Ivory', 'Beige', 'Brown', 'Grey', 'Black', 'Blue', 'Green', 'Red', 'Multicolour',
] as const;

/* Sizes arrive three ways and must land in one shape: the admin types
   600x1200 on a keyboard, the issued CSV carries 600x1200, and Excel saving
   that CSV as ANSI turns a × into a replacement character. Accept any single
   separator between two digit runs and normalise before validating, so the
   rule lives here once instead of in the form and the importer both. */
export function normalizeSize(v: string): string {
  const t = v.replace(/\s+/g, '');
  const m = t.match(/^(\d{3,4})\D{1,3}(\d{3,4})$/);
  return m ? `${m[1]}×${m[2]}` : t;
}

/* Module 3's product form, field for field. Validated server-side before
   every write (hard rule 3) — the client never carries the rules alone. */
export const productSchema = z.object({
  sku: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9-]+$/, 'letters, digits and dashes only'),
  name: z.string().trim().min(2).max(120),
  category: z.enum(CATEGORIES),
  sizes: z.array(
    z.string().transform(normalizeSize)
      .refine((s) => /^\d{3,4}×\d{3,4}$/.test(s), 'use WIDTH×HEIGHT in mm, e.g. 600x1200'),
  ).min(1),
  surfaceFinish: z.enum(FINISHES),
  surfaceApplication: z.array(z.enum(APPLICATIONS)).min(1),
  colourFamily: z.enum(COLOUR_FAMILIES),
  description: z.string().trim().max(2000).default(''),
  images: z.array(z.string().trim()).max(12).default([]),
  specPdf: z.string().trim().nullable().default(null),
  tags: z.array(z.string().trim().max(40)).max(12).default([]),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(99999).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

export type Product = ProductInput & {
  slug: string;
  searchText: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin';
  active: boolean;
  createdAt: string;
};

export type ListQuery = {
  category?: (typeof CATEGORIES)[number];
  /* facet filters run over the category partition (§5a) */
  size?: string;
  finish?: (typeof FINISHES)[number];
  application?: (typeof APPLICATIONS)[number];
  colour?: (typeof COLOUR_FAMILIES)[number];
  q?: string;
  /* admin passes undefined to see inactive SKUs too; public reads pass true */
  active?: boolean;
  limit?: number;
  cursor?: string;
};

export type ListResult = { items: Product[]; nextCursor: string | null; total: number };

export interface CatalogStore {
  list(query: ListQuery): Promise<ListResult>;
  get(sku: string): Promise<Product | null>;
  getBySlug(category: string, slug: string): Promise<Product | null>;
  /** create fails if the SKU exists (conditional write in Dynamo — hard rule 10) */
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  remove(sku: string): Promise<void>;
  getUser(email: string): Promise<AdminUser | null>;
  putUser(user: AdminUser): Promise<void>;
  countUsers(): Promise<number>;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildSearchText(p: ProductInput): string {
  return [p.name, p.sku, p.category, p.colourFamily, p.surfaceFinish, p.sizes.join(' '), p.tags.join(' ')]
    .join(' ')
    .toLowerCase();
}

/** Everything derived lives in one place so both stores stay identical. */
export function toProduct(input: ProductInput, existing?: Product): Product {
  const now = new Date().toISOString();
  return {
    ...input,
    slug: existing?.slug ?? slugify(input.name),
    searchText: buildSearchText(input),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

/** In-memory facet filtering over a category partition — §5a's design. */
export function applyFacets(items: Product[], q: ListQuery): Product[] {
  let out = items;
  if (q.active !== undefined) out = out.filter((p) => p.active === q.active);
  if (q.size) out = out.filter((p) => p.sizes.includes(q.size!));
  if (q.finish) out = out.filter((p) => p.surfaceFinish === q.finish);
  if (q.application) out = out.filter((p) => p.surfaceApplication.includes(q.application!));
  if (q.colour) out = out.filter((p) => p.colourFamily === q.colour);
  if (q.q) {
    const needle = q.q.toLowerCase().trim();
    out = out.filter((p) => p.searchText.includes(needle));
  }
  return out;
}
