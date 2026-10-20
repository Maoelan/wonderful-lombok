import test from 'node:test';
import assert from 'node:assert/strict';
import { inferDestinationSlugs, normalizeDestinationSlugs } from '../src/lib/catalog-relations.js';

const destinations = [
  { name: 'Kuta Mandalika' },
  { name: 'Tiga Gili' },
  { name: 'Sembalun' }
];

test('legacy packages infer destination links from their route', () => {
  assert.deepEqual(
    inferDestinationSlugs({ name: 'Tur Selatan', route: 'Desa Sade, Kuta Mandalika' }, destinations),
    ['kuta-mandalika']
  );
});

test('an explicit empty destination selection is preserved', () => {
  assert.deepEqual(normalizeDestinationSlugs({ name: 'Tur Gili', route: 'Tiga Gili', destinationSlugs: [] }, destinations), []);
});
