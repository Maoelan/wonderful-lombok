import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogOrMaintenance } from '../src/lib/server/catalog-fallback.js';
import { logServerError } from '../src/lib/server/diagnostics.js';

function captureErrors() {
  const logs = [];
  const original = console.error;
  console.error = (...args) => logs.push(args);
  return { logs, restore: () => { console.error = original; } };
}

test('structured error logs omit messages, secrets, and customer data', () => {
  const capture = captureErrors();
  const secret = 'Siti secret@example.com 628123456789';
  const cause = new TypeError(secret);
  cause.code = 'E_TEST';
  cause.status = 503;

  try {
    logServerError('catalog_load_failed', cause, {
      locale: 'nl',
      operation: 'catalog_read',
      customer: secret
    });
  } finally {
    capture.restore();
  }

  assert.equal(capture.logs.length, 1);
  const record = JSON.parse(capture.logs[0][0]);
  assert.deepEqual(record, {
    level: 'error',
    event: 'catalog_load_failed',
    name: 'TypeError',
    code: 'E_TEST',
    status: 503,
    locale: 'nl',
    operation: 'catalog_read'
  });
  assert.equal(JSON.stringify(capture.logs).includes(secret), false);
});

test('catalog maintenance records a safe trace before returning 503', async () => {
  const capture = captureErrors();
  let failure;
  try {
    await loadCatalogOrMaintenance(async () => {
      throw new Error('database password=secret and customer@example.com');
    }, 'de');
  } catch (cause) {
    failure = cause;
  } finally {
    capture.restore();
  }

  assert.equal(failure.status, 503);
  assert.equal(capture.logs.length, 1);
  const record = JSON.parse(capture.logs[0][0]);
  assert.equal(record.event, 'catalog_load_failed');
  assert.equal(record.locale, 'de');
  assert.equal(JSON.stringify(record).includes('password'), false);
  assert.equal(JSON.stringify(record).includes('customer@example.com'), false);
});
