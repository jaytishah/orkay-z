/* Run any command against the local DynamoDB instead of the file store.

     node scripts/with-dynamo.mjs npx next dev
     node scripts/with-dynamo.mjs node scripts/aws/provision.mjs

   ponytail: a wrapper, not a `cross-env` dependency — the whole job is four
   environment variables and a spawn, and Windows cannot use VAR=x prefixes.

   The credentials are deliberately fake. DynamoDB Local accepts any signature;
   real credentials must never be needed to run the local checks. */

import { spawn } from 'node:child_process';

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('usage: node scripts/with-dynamo.mjs <command> [args…]');
  process.exit(1);
}

const env = {
  ...process.env,
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'local',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT || `http://localhost:${process.env.DYNAMO_LOCAL_PORT || 8000}`,
  DYNAMO_TABLE: process.env.DYNAMO_TABLE || 'orkay-catalog',
};

/* No shell: pass a real executable (node, java) rather than an npm shim, so
   Windows does not need `shell: true` — which Node deprecates for exactly the
   argument-injection reason it warns about. */
const child = spawn(cmd, args, { stdio: 'inherit', env, shell: false });
child.on('exit', (code, signal) => process.exit(signal ? 1 : code ?? 0));
child.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
