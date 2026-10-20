import test from 'node:test';
import assert from 'node:assert/strict';
import { tooManyRequests } from '../src/lib/server/http.js';

test('rate-limited responses include a retry hint', async () => {
  const response = tooManyRequests('Terlalu banyak permintaan.', { retryAfterSeconds: 42 });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '42');
  assert.deepEqual(await response.json(), { error: 'Terlalu banyak permintaan.' });
});

test('rate-limited responses never emit a non-positive retry hint', () => {
  assert.equal(tooManyRequests('Tunggu.', { retryAfterSeconds: 0 }).headers.get('retry-after'), '1');
  assert.equal(tooManyRequests('Tunggu.', {}).headers.get('retry-after'), '1');
});
