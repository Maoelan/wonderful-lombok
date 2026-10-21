import test from 'node:test';
import assert from 'node:assert/strict';
import { languages } from '../src/lib/i18n.js';
import {
  loadCatalogOrMaintenance,
  maintenanceMessage,
  maintenanceMessages
} from '../src/lib/server/catalog-fallback.js';

test('maintenance copy exists for every supported locale', () => {
  for (const { code } of languages) assert.ok(maintenanceMessages[code], `missing maintenance copy for ${code}`);
});

test('catalog loader returns data when Convex is available', async () => {
  const catalog = { packages: [{ slug: 'demo' }] };
  assert.equal(await loadCatalogOrMaintenance(async () => catalog, 'en'), catalog);
});

test('catalog loader converts a Convex failure into a localized 503', async () => {
  let failure;
  try {
    await loadCatalogOrMaintenance(async () => { throw new Error('Convex unavailable'); }, 'en');
  } catch (error) {
    failure = error;
  }

  assert.equal(failure.status, 503);
  assert.equal(failure.body.message, maintenanceMessage('en'));
});

test('unknown locales fall back to the Indonesian maintenance copy', () => {
  assert.equal(maintenanceMessage('unknown'), maintenanceMessages.id);
});
