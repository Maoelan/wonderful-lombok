import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { validateCatalog, validImage } from '../src/lib/server/catalog-validation.js';

test('default catalog passes server validation', () => {
  assert.equal(validateCatalog(structuredClone(defaultCatalog)), null);
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
