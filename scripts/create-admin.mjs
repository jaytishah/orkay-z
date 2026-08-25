/* Bootstrap or update an admin login from the terminal — there is no public
   signup page by design (no WordPress patterns, hard rule 5).

   Usage:  node scripts/create-admin.mjs <email> <password> [name]

   Writes to whichever store the env selects (.data/catalog.json locally,
   DynamoDB when DYNAMO_TABLE is set). Passwords are stored as bcrypt hashes
   only — the plaintext is never kept. */
import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(' ') || 'Orkay Admin';

if (!email || !password) {
  console.error('usage: node scripts/create-admin.mjs <email> <password> [name]');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('that does not look like an email address');
  process.exit(1);
}
if (password.length < 10) {
  console.error('use at least 10 characters for the password');
  process.exit(1);
}

const user = {
  email: email.toLowerCase(),
  name,
  passwordHash: await bcrypt.hash(password, 12),
  role: 'admin',
  active: true,
  createdAt: new Date().toISOString(),
};

if (process.env.DYNAMO_TABLE) {
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient(
    process.env.DYNAMO_ENDPOINT ? { endpoint: process.env.DYNAMO_ENDPOINT } : {},
  ));
  await doc.send(new PutCommand({
    TableName: process.env.DYNAMO_TABLE,
    Item: { PK: `USER#${user.email}`, SK: 'META', type: 'user', ...user },
  }));
  console.log(`admin ${user.email} written to DynamoDB table ${process.env.DYNAMO_TABLE}`);
} else {
  const file = path.join(process.cwd(), '.data', 'catalog.json');
  let db = { products: {}, users: {} };
  try {
    db = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {}
  db.users = db.users || {};
  db.users[user.email] = user;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), 'utf8');
  console.log(`admin ${user.email} written to .data/catalog.json (local file store)`);
}
console.log('login at /admin/login');
