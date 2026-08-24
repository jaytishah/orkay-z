import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  type AdminUser, type CatalogStore, type ListQuery, type ListResult, type Product,
  applyFacets,
} from '../catalog';

/* Local development store: one JSON file in .data/, written atomically.
   Implements the same access patterns as the Dynamo store so swapping the
   backend never touches a caller. Not for production — Amplify's filesystem
   is ephemeral; production selects DynamoStore via DYNAMO_TABLE. */

type Db = { products: Record<string, Product>; users: Record<string, AdminUser> };

const FILE = path.join(process.cwd(), '.data', 'catalog.json');

async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as Db;
  } catch {
    return { products: {}, users: {} };
  }
}

async function save(db: Db): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

/* serialise writes so concurrent API calls cannot interleave read-modify-write */
let queue: Promise<unknown> = Promise.resolve();
function serialised<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

export class FileStore implements CatalogStore {
  async list(query: ListQuery): Promise<ListResult> {
    const db = await load();
    let items = Object.values(db.products);
    if (query.category) items = items.filter((p) => p.category === query.category);
    items = applyFacets(items, query);
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const total = items.length;
    const start = query.cursor ? Number(query.cursor) || 0 : 0;
    const limit = query.limit ?? 24;
    const page = items.slice(start, start + limit);
    const nextCursor = start + limit < total ? String(start + limit) : null;
    return { items: page, nextCursor, total };
  }

  async get(sku: string): Promise<Product | null> {
    const db = await load();
    return db.products[sku] ?? null;
  }

  async getBySlug(category: string, slug: string): Promise<Product | null> {
    const db = await load();
    return Object.values(db.products).find((p) => p.category === category && p.slug === slug) ?? null;
  }

  async create(product: Product): Promise<void> {
    await serialised(async () => {
      const db = await load();
      if (db.products[product.sku]) {
        throw Object.assign(new Error(`SKU ${product.sku} already exists`), { code: 'DUPLICATE' });
      }
      db.products[product.sku] = product;
      await save(db);
    });
  }

  async update(product: Product): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.products[product.sku] = product;
      await save(db);
    });
  }

  async remove(sku: string): Promise<void> {
    await serialised(async () => {
      const db = await load();
      delete db.products[sku];
      await save(db);
    });
  }

  async getUser(email: string): Promise<AdminUser | null> {
    const db = await load();
    return db.users[email.toLowerCase()] ?? null;
  }

  async putUser(user: AdminUser): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.users[user.email.toLowerCase()] = user;
      await save(db);
    });
  }

  async countUsers(): Promise<number> {
    const db = await load();
    return Object.keys(db.users).length;
  }
}
