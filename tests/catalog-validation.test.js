import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { CATALOG_SCHEMA_VERSION } from '../src/lib/catalog-schema.js';
import { validateCatalog, validImage } from '../src/lib/server/catalog-validation.js';

test('default catalog passes server validation', () => {
  assert.equal(validateCatalog(structuredClone(defaultCatalog)), null);
});

test('catalog requires the current schema version', () => {
  const missing = structuredClone(defaultCatalog);
  delete missing.schemaVersion;
  assert.equal(validateCatalog(missing), 'Versi skema katalog tidak didukung.');

  const future = structuredClone(defaultCatalog);
  future.schemaVersion = CATALOG_SCHEMA_VERSION + 1;
  assert.equal(validateCatalog(future), 'Versi skema katalog tidak didukung.');

  const stringVersion = structuredClone(defaultCatalog);
  stringVersion.schemaVersion = String(CATALOG_SCHEMA_VERSION);
  assert.equal(validateCatalog(stringVersion), 'Versi skema katalog tidak didukung.');
});

test('catalog rejects unsafe and malformed image URLs', () => {
  assert.equal(validImage('/uploads/photo-1.webp'), true);
  assert.equal(validImage('https://upload.wikimedia.org/photo.jpg'), true);
  assert.equal(validImage('https://example.convex.cloud/api/storage/file'), true);
  assert.equal(validImage('https://images.example/photo.jpg'), false);
  assert.equal(validImage('javascript:alert(1)'), false);
  assert.equal(validImage("https://images.example/x');color:red"), false);
});

test('catalog rejects unsafe public background images', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.settings.heroImage = 'javascript:alert(1)';
  assert.equal(validateCatalog(catalog), 'Gambar latar website tidak valid.');
});

test('catalog accepts only the available public color themes', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.settings.colorTheme = 'unknown-theme';
  assert.equal(validateCatalog(catalog), 'Pilihan warna website tidak valid.');
});

test('catalog rejects oversized editable content', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.settings.heroTitle = 'x'.repeat(1001);
  assert.equal(validateCatalog(catalog), 'Informasi website tidak valid.');
});

test('catalog rejects duplicate destination URLs', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.destinations[0].slug = 'same-destination';
  catalog.destinations[1].slug = 'same-destination';
  assert.equal(validateCatalog(catalog), 'Data destinasi tidak valid.');
});

test('catalog rejects package links to missing destinations', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.packages[0].destinationSlugs = ['tidak-ada'];
  assert.equal(validateCatalog(catalog), 'Data Paket Wisata tidak valid.');
});

test('catalog allows a package without a related destination', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.packages[0].destinationSlugs = [];
  assert.equal(validateCatalog(catalog), null);
});
