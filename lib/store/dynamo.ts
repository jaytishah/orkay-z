import { DynamoDBClient, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand,
} from '@aws-sdk/lib-dynamodb';
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
/* Module 10's admin queue: PK STATUS#<applied|verified|signed|active> · SK createdAt (§5a) */
const GSI_DEALER_STATUS = 'byDealerStatus';

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

export class DynamoStore implements CatalogStore, DealerStore, SubmissionStore {
  private doc: DynamoDBDocumentClient;

  constructor(private table: string) {
    /* DYNAMO_ENDPOINT points this at DynamoDB Local so the real store — these
       keys, these GSIs, these conditional writes — can be exercised before
       anything reaches Orkay's AWS account. Unset in production, where the SDK
       resolves the regional endpoint and the Amplify role supplies credentials. */
    const endpoint = process.env.DYNAMO_ENDPOINT;
    this.doc = DynamoDBDocumentClient.from(
      new DynamoDBClient(endpoint ? { endpoint } : {}),
      { marshallOptions: { removeUndefinedValues: true } },
    );
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

  /* ── Module 10: dealers ──────────────────────────────────────────────
       Application  PK DEALER#<id>  SK META
       Audit trail  PK DEALER#<id>  SK EVENT#<iso>   same partition, so the
                                                     record and its history
                                                     come back in one query
       Queue GSI3   STATUS#<status> · createdAt
       Reservations PK DEALERCODE#<code> | DISTRICT#<key>  SK RESERVED
     ─────────────────────────────────────────────────────────────────── */

  private dealerItem(app: DealerApplication): Item {
    return {
      PK: `DEALER#${app.id}`,
      SK: 'META',
      GSI3PK: `STATUS#${app.status}`,
      GSI3SK: app.createdAt,
      type: 'dealer',
      ...app,
    };
  }

  async createApplication(app: DealerApplication): Promise<void> {
    try {
      await this.doc.send(new PutCommand({
        TableName: this.table,
        Item: this.dealerItem(app),
        ConditionExpression: 'attribute_not_exists(PK)',
      }));
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw Object.assign(new Error(`application ${app.id} already exists`), { code: 'DUPLICATE' });
      }
      throw err;
    }
  }

  async getApplication(id: string): Promise<DealerApplication | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.table,
      Key: { PK: `DEALER#${id}`, SK: 'META' },
    }));
    if (!res.Item) return null;
    const { PK, SK, GSI3PK, GSI3SK, type, ...rest } = res.Item;
    void PK; void SK; void GSI3PK; void GSI3SK; void type;
    return rest as DealerApplication;
  }

  async updateApplication(app: DealerApplication): Promise<void> {
    await this.doc.send(new PutCommand({ TableName: this.table, Item: this.dealerItem(app) }));
  }

  async listApplications(status?: DealerStatus): Promise<DealerApplication[]> {
    const strip = (item: Item) => {
      const { PK, SK, GSI3PK, GSI3SK, type, ...rest } = item;
      void PK; void SK; void GSI3PK; void GSI3SK; void type;
      return rest as DealerApplication;
    };
    if (status) {
      const res = await this.doc.send(new QueryCommand({
        TableName: this.table,
        IndexName: GSI_DEALER_STATUS,
        KeyConditionExpression: 'GSI3PK = :pk',
        ExpressionAttributeValues: { ':pk': `STATUS#${status}` },
        /* newest first */
        ScanIndexForward: false,
      }));
      return (res.Items || []).map(strip);
    }
    /* "everything" is an admin-only view over a table that holds hundreds of
       dealers, not millions of SKUs — the same reasoning §5a applies to the
       inactive-products scan. */
    const res = await this.doc.send(new ScanCommand({
      TableName: this.table,
      FilterExpression: '#t = :t',
      ExpressionAttributeNames: { '#t': 'type' },
      ExpressionAttributeValues: { ':t': 'dealer' },
    }));
    return (res.Items || []).map(strip).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async appendEvent(id: string, event: DealerEvent): Promise<void> {
    /* Append-only: a second event in the same millisecond must not overwrite
       the first, so the sort key carries a disambiguating suffix and the
       write refuses to replace an existing item. */
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = attempt === 0 ? '' : `#${attempt}`;
      try {
        await this.doc.send(new PutCommand({
          TableName: this.table,
          Item: { PK: `DEALER#${id}`, SK: `EVENT#${event.at}${suffix}`, type: 'dealerEvent', ...event },
          ConditionExpression: 'attribute_not_exists(SK)',
        }));
        return;
      } catch (err) {
        if (!(err instanceof ConditionalCheckFailedException)) throw err;
      }
    }
    throw new Error(`could not append audit event for dealer ${id}`);
  }

  async listEvents(id: string): Promise<DealerEvent[]> {
    const res = await this.doc.send(new QueryCommand({
      TableName: this.table,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `DEALER#${id}`, ':sk': 'EVENT#' },
    }));
    return (res.Items || []).map((item) => {
      const { PK, SK, type, ...rest } = item;
      void PK; void SK; void type;
      return rest as DealerEvent;
    });
  }

  /* THE uniqueness constraint (hard rule 10). Dynamo has no UNIQUE, so the
     conditional write is the constraint — there is deliberately no read here
     to "check first", because a check-then-write races. */
  async reserve(kind: ReservationKind, key: string, applicationId: string): Promise<boolean> {
    try {
      await this.doc.send(new PutCommand({
        TableName: this.table,
        Item: {
          PK: `${kind}#${key}`,
          SK: 'RESERVED',
          type: 'reservation',
          applicationId,
          reservedAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }));
      return true;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) return false;
      throw err;
    }
  }

  /* Conditional delete: the holder is proved in the condition, so a stale
     caller cannot release a territory that has since been re-appointed. */
  async release(kind: ReservationKind, key: string, applicationId: string): Promise<void> {
    try {
      await this.doc.send(new DeleteCommand({
        TableName: this.table,
        Key: { PK: `${kind}#${key}`, SK: 'RESERVED' },
        ConditionExpression: 'applicationId = :id',
        ExpressionAttributeValues: { ':id': applicationId },
      }));
    } catch (err) {
      if (!(err instanceof ConditionalCheckFailedException)) throw err;
    }
  }

  async reservationHolder(kind: ReservationKind, key: string): Promise<string | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.table,
      Key: { PK: `${kind}#${key}`, SK: 'RESERVED' },
    }));
    return (res.Item?.applicationId as string | undefined) ?? null;
  }

  /* ── Submissions ──────────────────────────────────────────────────────
       Record   PK SUB#<id>         SK META
       Queue    GSI3PK KIND#<kind>  GSI3SK <createdAt>

     GSI3 is the index the dealer queue already uses (§5a). A different
     partition prefix on the same index is exactly what single-table design
     is for — no new GSI, so provision.mjs does not change.
     ─────────────────────────────────────────────────────────────────── */

  private submissionItem(s: Submission): Item {
    return {
      PK: `SUB#${s.id}`,
      SK: 'META',
      GSI3PK: `KIND#${s.kind}`,
      GSI3SK: s.createdAt,
      type: 'submission',
      ...s,
    };
  }

  private static stripSubmission(item: Item): Submission {
    const { PK, SK, GSI3PK, GSI3SK, type, ...rest } = item;
    void PK; void SK; void GSI3PK; void GSI3SK; void type;
    return rest as Submission;
  }

  async createSubmission(s: Submission): Promise<void> {
    try {
      await this.doc.send(new PutCommand({
        TableName: this.table,
        Item: this.submissionItem(s),
        ConditionExpression: 'attribute_not_exists(PK)',
      }));
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw Object.assign(new Error(`submission ${s.id} already exists`), { code: 'DUPLICATE' });
      }
      throw err;
    }
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const res = await this.doc.send(new GetCommand({
      TableName: this.table,
      Key: { PK: `SUB#${id}`, SK: 'META' },
    }));
    return res.Item ? DynamoStore.stripSubmission(res.Item) : null;
  }

  async updateSubmission(s: Submission): Promise<void> {
    await this.doc.send(new PutCommand({ TableName: this.table, Item: this.submissionItem(s) }));
  }

  async listSubmissions(kind?: SubmissionKind, status?: SubmissionStatus): Promise<Submission[]> {
    let items: Submission[];
    if (kind) {
      const res = await this.doc.send(new QueryCommand({
        TableName: this.table,
        IndexName: GSI_DEALER_STATUS,
        KeyConditionExpression: 'GSI3PK = :pk',
        ExpressionAttributeValues: { ':pk': `KIND#${kind}` },
        /* newest first */
        ScanIndexForward: false,
      }));
      items = (res.Items || []).map(DynamoStore.stripSubmission);
    } else {
      /* Admin-only view over an inbox, not a catalog — the same reasoning
         §5a applies to the inactive-products scan. */
      const res = await this.doc.send(new ScanCommand({
        TableName: this.table,
        FilterExpression: '#t = :t',
        ExpressionAttributeNames: { '#t': 'type' },
        ExpressionAttributeValues: { ':t': 'submission' },
      }));
      items = (res.Items || []).map(DynamoStore.stripSubmission)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    /* Status is a handful of values over a queue that is already narrowed by
       kind — filtering here costs less than a second sparse index. */
    return status ? items.filter((s) => s.status === status) : items;
  }
}
