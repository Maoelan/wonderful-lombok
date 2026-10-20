import test from 'node:test';
import assert from 'node:assert/strict';
import { localizeCatalog } from '../src/lib/i18n.js';
import { publicCatalog } from '../src/lib/server/public-catalog.js';

const catalog = {
  packages: [{ slug: 'three-days' }],
  destinations: [{ name: 'Senggigi' }],
  rentals: [{ name: 'Private Car + Driver' }, { name: 'Motorbike Rental' }],
  faqs: [],
  settings: { colorTheme: 'forest' }
};

test('public catalog hides rentals while the rental feature is disabled', () => {
  const result = publicCatalog(catalog, false);

  assert.equal('rentals' in result, false);
  assert.deepEqual(result.packages, catalog.packages);
  assert.deepEqual(result.destinations, catalog.destinations);
  assert.deepEqual(result.settings, catalog.settings);
});

test('public catalog keeps rentals when the rental feature is enabled', () => {
  const result = publicCatalog(catalog, true);

  assert.deepEqual(result.rentals, catalog.rentals);
});

test('public catalog does not mutate the admin catalog', () => {
  publicCatalog(catalog, false);

  assert.equal(catalog.rentals.length, 2);
});

test('localized public catalog does not re-add hidden rentals', () => {
  const result = localizeCatalog(publicCatalog(catalog, false), 'en');

  assert.equal('rentals' in result, false);
});
