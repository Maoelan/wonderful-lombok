import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { CATALOG_SCHEMA_VERSION } from '../src/lib/catalog-schema.js';
import { isLocalConvexUrl, validateCatalog, validImage, validSlug } from '../src/lib/server/catalog-validation.js';

test('slug validation accepts only nonempty ASCII words separated by single hyphens', () => {
  for (const slug of ['a', 'a1', 'kuta-mandalika', 'a-1-b']) assert.equal(validSlug(slug), true, slug);
  for (const slug of ['', '-a', 'a-', 'a--b', 'A', 'a b', 'a/b', 'a\n', 'a\r', 'a\t', 'á', 123, null, undefined, {}]) assert.equal(validSlug(slug), false, String(slug));
  assert.equal(validSlug('a-'.repeat(10000) + '!'), false);
});

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

test('catalog accepts local Convex storage uploads only when the backend is local', () => {
  const localUrl = 'http://127.0.0.1:3210/api/storage/abc_123-XYZ';
  assert.equal(validImage(localUrl), false);
  assert.equal(validImage(localUrl, { allowLocalConvexStorage: true }), true);
  assert.equal(validImage('http://localhost:3210/api/storage/abc_123-XYZ', { allowLocalConvexStorage: true }), true);
  assert.equal(validImage('http://127.0.0.1:3210/api/storage/../secret', { allowLocalConvexStorage: true }), false);
  assert.equal(validImage('http://127.0.0.1:3210/api/storage/file?download=1', { allowLocalConvexStorage: true }), false);
  assert.equal(validImage('http://127.0.0.1:3210/other/file', { allowLocalConvexStorage: true }), false);
  assert.equal(validImage('http://example.com:3210/api/storage/file', { allowLocalConvexStorage: true }), false);

  const catalog = structuredClone(defaultCatalog);
  catalog.packages[0].image = localUrl;
  assert.equal(validateCatalog(catalog), 'Data Paket Wisata tidak valid.');
  assert.equal(validateCatalog(catalog, { allowLocalConvexStorage: true }), null);

  assert.equal(isLocalConvexUrl('http://127.0.0.1:3210'), true);
  assert.equal(isLocalConvexUrl('http://localhost:3210'), true);
  assert.equal(isLocalConvexUrl('https://127.0.0.1:3210'), false);
  assert.equal(isLocalConvexUrl('http://example.com:3210'), false);
  assert.equal(isLocalConvexUrl('https://example.convex.cloud'), false);
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
