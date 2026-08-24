import type { CatalogStore } from '../catalog';

/* Server-side half of the catalog seam (CLAUDE.md hard rule 8).

   `lib/catalog.ts` holds the shape — schema, types, constants, derivations —
   and is safe to import from a client component. Store selection lives here
   instead, because webpack follows `import('./store/file')` into whatever
   bundle the importer lands in, and the file store reaches for node:fs. */

let store: CatalogStore | null = null;

/** Env decides the backend: DynamoDB when AWS is configured, file otherwise. */
export async function getStore(): Promise<CatalogStore> {
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
