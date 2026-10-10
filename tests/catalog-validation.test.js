import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { validateCatalog, validImage } from '../src/lib/server/catalog-validation.js';

test('default catalog passes server validation', () => {
  assert.equal(validateCatalog(structuredClone(defaultCatalog)), null);
});

test('catalog rejects unsafe and malformed image URLs', () => {
  assert.equal(validImage('/uploads/photo-1.webp'), true);
  assert.equal(validImage('https://images.example/photo.jpg'), true);
  assert.equal(validImage('javascript:alert(1)'), false);
  assert.equal(validImage("https://images.example/x');color:red"), false);
});

test('catalog rejects oversized editable content', () => {
  const catalog = structuredClone(defaultCatalog);
  catalog.settings.heroTitle = 'x'.repeat(1001);
  assert.equal(validateCatalog(catalog), 'Informasi website tidak valid.');
});
