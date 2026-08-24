import { DynamoDBClient, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  type AdminUser, type CatalogStore, type ListQuery, type ListResult, type Product,
  applyFacets,
} from '../catalog';

/* ════════════════════════════════════════════════════════════════════
   DynamoDB store — the key design from INSTRUCTIONS §5a, verbatim:

     Base table   PK PRODUCT#<sku>       SK META      point lookup (admin edit)
     GSI1         PK CATEGORY#<category> SK SLUG#<slug>  category listing + detail
     GSI2 sparse  PK ACTIVE              SK SLUG#<slug>  whole-catalog public listing
     Users        PK USER#<email>        SK META

   Facet filters (size / finish / application / colour / keyword) run in
   memory over the queried partition — a few hundred items, per §5a.
   Uniqueness is a conditional write, never check-then-write (hard rule 10).
   Table + GSIs are provisioned by scripts/aws/provision.mjs.
   ════════════════════════════════════════════════════════════════════ */

const GSI_CATEGORY = 'byCategory';
const GSI_STATUS = 'byStatus';

type Item = Record<string, unknown>;

function toItem(p: Product): Item {
  return {
    PK: `PRODUCT#${p.sku}`,
    SK: 'META',
    GSI1PK: `CATEGORY#${p.category}`,
    GSI1SK: `SLUG#${p.slug}`,
    /* sparse: only active products appear in the public whole-catalog index */
    ...(p.active ? { GSI2PK: 'ACTIVE', GSI2SK: `SLUG#${p.slug}` } : {}),
    type: 'product',
    ...p,
  };
}

function fromItem(item: Item): Product {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, type, ...rest } = item;
  void PK; void SK; void GSI1PK; void GSI1SK; void GSI2PK; void GSI2SK; void type;
  return rest as Product;
}

export class DynamoStore implements CatalogStore {
  private doc: DynamoDBDocumentClient;

  constructor(private table: string) {
    this.doc = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  async list(query: ListQuery): Promise<ListResult> {
    let items: Product[] = [];
    if (query.category) {
      const res = await this.doc.send(new QueryCommand({
        TableName: this.table,
        IndexName: GSI_CATEGORY,
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `CATEGORY#${query.category}` },
      }));
      items = (res.Items || []).map(fromItem);
    } else if (query.active === true) {
      const res = await this.doc.send(new QueryCommand({
        TableName: this.table,
        IndexName: GSI_STATUS,
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': 'ACTIVE' },
      }));
      items = (res.Items || []).map(fromItem);
    } else {
      /* admin "everything incl. inactive" view: a scan is fine at catalog
         scale (≤10k small items) on an admin-only path — §5a notes this */
      const res = await this.doc.send(new ScanCommand({
        TableName: this.table,
        FilterExpression: '#t = :t',
        ExpressionAttributeNames: { '#t': 'type' },
        ExpressionAttributeValues: { ':t': 'product' },
      }));
      items = (res.Items || []).map(fromItem);
    }
    items = applyFacets(items, query);
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const total = items.length;
    const start = query.cursor ? Number(query.cursor) || 0 : 0;
    const limit = query.limit ?? 24;
    const page = items.slice(start, start + limit);
    return { items: page, nextCursor: start + limit < total ? String(start + limit) : null, total };
  }

  async get(sku: string): Promise<Product | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.table,
      Key: { PK: `PRODUCT#${sku}`, SK: 'META' },
    }));
    return res.Item ? fromItem(res.Item) : null;
  }

  async getBySlug(category: string, slug: string): Promise<Product | null> {
    const res = await this.doc.send(new QueryCommand({
      TableName: this.table,
      IndexName: GSI_CATEGORY,
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: { ':pk': `CATEGORY#${category}`, ':sk': `SLUG#${slug}` },
      Limit: 1,
    }));
    const item = res.Items?.[0];
    return item ? fromItem(item) : null;
  }

  async create(product: Product): Promise<void> {
    try {
      await this.doc.send(new PutCommand({
        TableName: this.table,
        Item: toItem(product),
        ConditionExpression: 'attribute_not_exists(PK)',
      }));
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw Object.assign(new Error(`SKU ${product.sku} already exists`), { code: 'DUPLICATE' });
      }
      throw err;
    }
  }

  async update(product: Product): Promise<void> {
    await this.doc.send(new PutCommand({ TableName: this.table, Item: toItem(product) }));
  }

  async remove(sku: string): Promise<void> {
    await this.doc.send(new DeleteCommand({
      TableName: this.table,
      Key: { PK: `PRODUCT#${sku}`, SK: 'META' },
    }));
  }

  async getUser(email: string): Promise<AdminUser | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.table,
      Key: { PK: `USER#${email.toLowerCase()}`, SK: 'META' },
    }));
    if (!res.Item) return null;
    const { PK, SK, type, ...rest } = res.Item;
    void PK; void SK; void type;
    return rest as AdminUser;
  }

  async putUser(user: AdminUser): Promise<void> {
    await this.doc.send(new PutCommand({
      TableName: this.table,
      Item: { PK: `USER#${user.email.toLowerCase()}`, SK: 'META', type: 'user', ...user },
    }));
  }

  async countUsers(): Promise<number> {
    const res = await this.doc.send(new ScanCommand({
      TableName: this.table,
      FilterExpression: '#t = :t',
      ExpressionAttributeNames: { '#t': 'type' },
      ExpressionAttributeValues: { ':t': 'user' },
      Select: 'COUNT',
    }));
    return res.Count ?? 0;
  }
}
