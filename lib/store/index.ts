import type { CatalogStore } from '../catalog';
import type { DealerStore } from '../dealers';
import type { SubmissionStore } from '../submissions';

/* Server-side half of the catalog seam (CLAUDE.md hard rule 8).

   `lib/catalog.ts` holds the shape — schema, types, constants, derivations —
   and is safe to import from a client component. Store selection lives here
   instead, because webpack follows `import('./store/file')` into whatever
   bundle the importer lands in, and the file store reaches for node:fs. */

/* One table, three entity families (§5a): the catalog, Module 10's dealers,
   and the contact page's enquiry / dealer-support submissions. Both stores
   implement all three, so callers get one handle. */
export type Store = CatalogStore & DealerStore & SubmissionStore;

let store: Store | null = null;

/** Env decides the backend: DynamoDB when AWS is configured, file otherwise. */
export async function getStore(): Promise<Store> {
  if (store) return store;
  if (process.env.DYNAMO_TABLE) {
    const { DynamoStore } = await import('./dynamo');
    store = new DynamoStore(process.env.DYNAMO_TABLE);
  } else {
    const { FileStore } = await import('./file');
    store = new FileStore();
  }
  return store;
}
