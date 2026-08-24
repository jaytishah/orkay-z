/* ════════════════════════════════════════════════════════════════════
   One-shot AWS provisioning for the Orkay catalog (Modules 4 & 12).
   Run with Orkay-account credentials in the environment:

     AWS_REGION=ap-south-1 AWS_PROFILE=orkay node scripts/aws/provision.mjs

   Creates, idempotently:
   - DynamoDB table  orkay-catalog  (on-demand, PITR on) with the §5a keys:
       PK/SK · GSI byCategory (GSI1PK/GSI1SK) · sparse GSI byStatus (GSI2PK/GSI2SK)
   - S3 bucket       orkay-media    (private; public read on products/* only,
                                     enforced via bucket policy; CORS for the site)
   Then prints the .env values and a least-privilege IAM policy for the app.

   Override names: DYNAMO_TABLE / S3_BUCKET env vars.
   ════════════════════════════════════════════════════════════════════ */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE = process.env.DYNAMO_TABLE || 'orkay-catalog';
const BUCKET = process.env.S3_BUCKET || 'orkay-media';

const {
  DynamoDBClient, CreateTableCommand, DescribeTableCommand, UpdateContinuousBackupsCommand,
  ResourceInUseException, ResourceNotFoundException,
} = require('@aws-sdk/client-dynamodb');
const {
  S3Client, CreateBucketCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand,
  PutBucketCorsCommand, BucketAlreadyOwnedByYou,
} = require('@aws-sdk/client-s3');

const ddb = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

/* ── DynamoDB ── */
try {
  await ddb.send(new CreateTableCommand({
    TableName: TABLE,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'byCategory',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'byStatus',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  }));
  console.log(`created table ${TABLE} (waiting for ACTIVE to enable PITR)...`);
  let status = 'CREATING';
  while (status !== 'ACTIVE') {
    await new Promise((r) => setTimeout(r, 4000));
    const d = await ddb.send(new DescribeTableCommand({ TableName: TABLE }));
    status = d.Table.TableStatus;
  }
} catch (err) {
  if (err instanceof ResourceInUseException) console.log(`table ${TABLE} already exists — leaving it`);
  else throw err;
}
try {
  await ddb.send(new UpdateContinuousBackupsCommand({
    TableName: TABLE,
    PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
  }));
  console.log('point-in-time recovery: ON');
} catch (err) {
  if (!(err instanceof ResourceNotFoundException)) console.warn('PITR:', err.message);
}

/* ── S3 ── */
try {
  await s3.send(new CreateBucketCommand({
    Bucket: BUCKET,
    ...(REGION !== 'us-east-1' ? { CreateBucketConfiguration: { LocationConstraint: REGION } } : {}),
  }));
  console.log(`created bucket ${BUCKET}`);
} catch (err) {
  if (err instanceof BucketAlreadyOwnedByYou || err.name === 'BucketAlreadyOwnedByYou') {
    console.log(`bucket ${BUCKET} already owned — leaving it`);
  } else throw err;
}

/* public read is limited to product derivatives only (hard rule 6);
   masters/ stays private. The block-public-access flags are relaxed only
   for the bucket policy, never for ACLs. */
await s3.send(new PutPublicAccessBlockCommand({
  Bucket: BUCKET,
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: true,
    IgnorePublicAcls: true,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false,
  },
}));
await s3.send(new PutBucketPolicyCommand({
  Bucket: BUCKET,
  Policy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'PublicReadProductImagesOnly',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET}/products/*`,
    }],
  }),
}));
await s3.send(new PutBucketCorsCommand({
  Bucket: BUCKET,
  CORSConfiguration: {
    CORSRules: [{
      AllowedMethods: ['GET'],
      AllowedOrigins: ['https://orkaytiles.com', 'https://www.orkaytiles.com', 'http://localhost:3000'],
      AllowedHeaders: ['*'],
      MaxAgeSeconds: 86400,
    }],
  },
}));
console.log('bucket policy: public read on products/* only; masters/ private; CORS set');

/* ── what the app needs ── */
console.log(`
Add to the Amplify environment (server-side only — hard rule 1):
  AWS_REGION=${REGION}
  DYNAMO_TABLE=${TABLE}
  S3_BUCKET=${BUCKET}
  SESSION_SECRET=<generate: openssl rand -hex 32>
  GHL_WEBHOOK_URL=<from GoHighLevel>

Least-privilege IAM policy for the app role (Module 12):
${JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'Catalog',
      Effect: 'Allow',
      Action: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:DeleteItem', 'dynamodb:Query', 'dynamodb:Scan'],
      Resource: [
        `arn:aws:dynamodb:${REGION}:*:table/${TABLE}`,
        `arn:aws:dynamodb:${REGION}:*:table/${TABLE}/index/*`,
      ],
    },
    {
      Sid: 'Media',
      Effect: 'Allow',
      Action: ['s3:PutObject', 's3:GetObject'],
      Resource: `arn:aws:s3:::${BUCKET}/*`,
    },
  ],
}, null, 2)}
`);
