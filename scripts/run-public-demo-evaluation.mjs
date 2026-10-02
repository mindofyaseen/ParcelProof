import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { env, stdout } from 'node:process';

const apiUrl = (env.PARCELPROOF_API_URL ?? 'https://ebuk0g78lb.execute-api.us-east-1.amazonaws.com').replace(/\/$/, '');
const fixtures = [
  { id: 'wrong-parcel', file: 'wrong-parcel.webp', expectedStatus: 'BLOCK' },
  { id: 'corrected-parcel', file: 'corrected-parcel.webp', expectedStatus: 'PASS' },
  { id: 'unclear-parcel', file: 'unclear-parcel.webp', expectedStatus: 'REVIEW' }
];
const selectedFixtures = env.PARCELPROOF_FIXTURE
  ? fixtures.filter((fixture) => fixture.id === env.PARCELPROOF_FIXTURE)
  : fixtures;
if (selectedFixtures.length === 0) throw new Error(`Unknown fixture: ${env.PARCELPROOF_FIXTURE}`);
const requirements = [
  { item: 'mug', quantity: 1, variant: 'blue' },
  { item: 'chocolate bar', quantity: 1 },
  { item: 'greeting card', quantity: 1, personalization: 'Happy Birthday Ayesha' }
];

async function request(path, init) {
  const response = await globalThis.fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers }
  });
  const value = await response.json();
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${value.message ?? response.status}`);
  return value;
}

const order = await request('/orders', {
  method: 'POST',
  body: JSON.stringify({ customerAlias: 'Public demo evaluation', requirements })
});

const results = [];
for (const fixture of selectedFixtures) {
  const bytes = await readFile(resolve('apps/web/public/demo-data', fixture.file));
  const upload = await request(`/orders/${order.orderId}/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ contentType: 'image/webp', size: bytes.length })
  });
  const uploaded = await globalThis.fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': 'image/webp' },
    body: bytes
  });
  if (!uploaded.ok) throw new Error(`Upload failed for ${fixture.file}: ${uploaded.status}`);
  const inspection = await request(`/orders/${order.orderId}/inspections`, {
    method: 'POST',
    body: JSON.stringify({ objectKey: upload.objectKey })
  });
  results.push({
    id: fixture.id,
    expectedStatus: fixture.expectedStatus,
    actualStatus: inspection.status,
    matchedExpectation: inspection.status === fixture.expectedStatus,
    latencyMs: inspection.latencyMs,
    reasons: inspection.comparison.reasons,
    checks: inspection.comparison.checks.map((check) => ({
      kind: check.kind,
      requirement: check.requirement,
      expected: check.expected,
      observed: check.observed,
      result: check.result,
      confidence: check.confidence
    }))
  });
}

stdout.write(`${JSON.stringify({ verifiedAt: new Date().toISOString(), caseCount: results.length, results }, null, 2)}\n`);
