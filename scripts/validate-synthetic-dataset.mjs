import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stdout } from 'node:process';

const root = resolve('test-fixtures/synthetic');
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));

if (manifest.synthetic !== true || manifest.containsCustomerData !== false) {
  throw new Error('Dataset provenance flags must identify synthetic, non-customer data.');
}
if (manifest.cases.length < 12 || manifest.cases.length > 20) {
  throw new Error(`Expected 12–20 cases, received ${manifest.cases.length}.`);
}

const ids = new Set();
const files = new Set();
const statuses = new Set(['PASS', 'BLOCK', 'REVIEW']);
for (const entry of manifest.cases) {
  if (ids.has(entry.id) || files.has(entry.file)) throw new Error(`Duplicate dataset entry: ${entry.id}`);
  if (!statuses.has(entry.expectedStatus)) throw new Error(`Invalid expected status: ${entry.expectedStatus}`);
  ids.add(entry.id);
  files.add(entry.file);
  await access(resolve(root, entry.file));
}

const counts = Object.fromEntries([...statuses].map((status) => [status, manifest.cases.filter((entry) => entry.expectedStatus === status).length]));
stdout.write(`Validated ${manifest.cases.length} synthetic cases ${JSON.stringify(counts)}\n`);
