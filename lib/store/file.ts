import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  type AdminUser, type CatalogStore, type ListQuery, type ListResult, type Product,
  applyFacets,
} from '../catalog';
import type {
  DealerApplication, DealerEvent, DealerStatus, DealerStore, ReservationKind,
} from '../dealers';
import type {
  Submission, SubmissionKind, SubmissionStatus, SubmissionStore,
} from '../submissions';

/* Local development store: one JSON file in .data/, written atomically.
   Implements the same access patterns as the Dynamo store so swapping the
   backend never touches a caller. Not for production — Amplify's filesystem
   is ephemeral; production selects DynamoStore via DYNAMO_TABLE. */

type Db = {
  products: Record<string, Product>;
  users: Record<string, AdminUser>;
  /* Module 10. Reservations are keyed `<KIND>#<key>` → applicationId, the flat
     equivalent of Dynamo's DEALERCODE#/DISTRICT# partitions. */
  dealers?: Record<string, DealerApplication>;
  dealerEvents?: Record<string, DealerEvent[]>;
  reservations?: Record<string, string>;
  /* The contact page's enquiry and dealer-support records — one map, the
     `kind` field discriminates, mirroring the SUB#<id> partition in Dynamo. */
  submissions?: Record<string, Submission>;
};

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

export class FileStore implements CatalogStore, DealerStore, SubmissionStore {
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

  /* ── Module 10: dealers ──────────────────────────────────────────── */

  async createApplication(app: DealerApplication): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.dealers = db.dealers || {};
      if (db.dealers[app.id]) {
        throw Object.assign(new Error(`application ${app.id} already exists`), { code: 'DUPLICATE' });
      }
      db.dealers[app.id] = app;
      await save(db);
    });
  }

  async getApplication(id: string): Promise<DealerApplication | null> {
    const db = await load();
    return db.dealers?.[id] ?? null;
  }

  async updateApplication(app: DealerApplication): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.dealers = db.dealers || {};
      db.dealers[app.id] = app;
      await save(db);
    });
  }

  async listApplications(status?: DealerStatus): Promise<DealerApplication[]> {
    const db = await load();
    const all = Object.values(db.dealers || {});
    const items = status ? all.filter((a) => a.status === status) : all;
    /* newest first — the same order the Dynamo queue GSI is read in */
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async appendEvent(id: string, event: DealerEvent): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.dealerEvents = db.dealerEvents || {};
      db.dealerEvents[id] = [...(db.dealerEvents[id] || []), event];
      await save(db);
    });
  }

  async listEvents(id: string): Promise<DealerEvent[]> {
    const db = await load();
    return [...(db.dealerEvents?.[id] || [])].sort((a, b) => a.at.localeCompare(b.at));
  }

  /* The file equivalent of Dynamo's `attribute_not_exists(PK)`: the check and
     the write share one `serialised` turn, so no second caller can slip
     between them. Same contract as the conditional write — hard rule 10. */
  async reserve(kind: ReservationKind, key: string, applicationId: string): Promise<boolean> {
    return serialised(async () => {
      const db = await load();
      db.reservations = db.reservations || {};
      const k = `${kind}#${key}`;
      if (db.reservations[k]) return false;
      db.reservations[k] = applicationId;
      await save(db);
      return true;
    });
  }

  async release(kind: ReservationKind, key: string, applicationId: string): Promise<void> {
    await serialised(async () => {
      const db = await load();
      const k = `${kind}#${key}`;
      if (db.reservations?.[k] !== applicationId) return;
      delete db.reservations[k];
      await save(db);
    });
  }

  async reservationHolder(kind: ReservationKind, key: string): Promise<string | null> {
    const db = await load();
    return db.reservations?.[`${kind}#${key}`] ?? null;
  }

  /* ── Submissions: the contact page's enquiry and support records ──── */

  async createSubmission(s: Submission): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.submissions = db.submissions || {};
      if (db.submissions[s.id]) {
        throw Object.assign(new Error(`submission ${s.id} already exists`), { code: 'DUPLICATE' });
      }
      db.submissions[s.id] = s;
      await save(db);
    });
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const db = await load();
    return db.submissions?.[id] ?? null;
  }

  async updateSubmission(s: Submission): Promise<void> {
    await serialised(async () => {
      const db = await load();
      db.submissions = db.submissions || {};
      db.submissions[s.id] = s;
      await save(db);
    });
  }

  async listSubmissions(kind?: SubmissionKind, status?: SubmissionStatus): Promise<Submission[]> {
    const db = await load();
    let items = Object.values(db.submissions || {});
    if (kind) items = items.filter((s) => s.kind === kind);
    if (status) items = items.filter((s) => s.status === status);
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
