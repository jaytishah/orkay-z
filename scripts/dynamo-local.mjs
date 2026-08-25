/* Start DynamoDB Local so the real DynamoDB store can be exercised before
   anything touches Orkay's AWS account.

     npm run dynamo:local          # terminal 1 — downloads on first run
     npm run dynamo:provision      # terminal 2 — same provision.mjs AWS uses
     npm run dev:dynamo            # terminal 2 — dev server on the local table

   Why this exists: with DYNAMO_TABLE unset the app runs FileStore, so every
   check passes without lib/store/dynamo.ts ever executing. That leaves the
   key design, the GSIs and the conditional writes unverified until deploy day,
   which is the worst possible time to find out. Pointing the same code at a
   local table closes that gap.

   Needs Java (any recent JDK/JRE). Data lives under .data/ (gitignored), so
   local records survive a restart. */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const HOME = path.join(process.cwd(), '.data', 'dynamodb-local');
const JAR = path.join(HOME, 'DynamoDBLocal.jar');
const DATA = path.join(HOME, 'data');
const PORT = process.env.DYNAMO_LOCAL_PORT || '8000';
const URL = 'https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz';

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

if (!existsSync(JAR)) {
  console.log('DynamoDB Local not present — downloading (~60 MB, once)…');
  mkdirSync(HOME, { recursive: true });
  const res = await fetch(URL);
  if (!res.ok) {
    console.error(`download failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const archive = 'dynamodb_local_latest.tar.gz';
  await writeFile(path.join(HOME, archive), Buffer.from(await res.arrayBuffer()));
  /* tar ships with Windows 10+, macOS and Linux — no extra dependency. Extract
     from inside HOME with a relative name: GNU tar (which Git Bash puts on PATH
     ahead of Windows' bsdtar) reads `C:\...` as a host:path remote spec and
     tries to open an SSH connection to a machine called C. */
  await run('tar', ['xzf', archive], { cwd: HOME });
  console.log('extracted to .data/dynamodb-local');
}

mkdirSync(DATA, { recursive: true });
console.log(`DynamoDB Local on http://localhost:${PORT} (data in .data/dynamodb-local/data)\n`);

await run('java', [
  `-Djava.library.path=${path.join(HOME, 'DynamoDBLocal_lib')}`,
  '-jar', JAR,
  '-port', PORT,
  '-dbPath', DATA,
  /* one shared database rather than one per access key, so the provisioning
     script and the dev server see the same table */
  '-sharedDb',
], { cwd: HOME });
