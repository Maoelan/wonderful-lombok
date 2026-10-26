import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { CATALOG_SCHEMA_VERSION } from '../src/lib/catalog-schema.js';
import { mergeCatalogData } from '../src/lib/server/catalog-merge.js';

test('legacy catalog data is normalized to the current schema version', () => {
  const legacy = structuredClone(defaultCatalog);
  delete legacy.schemaVersion;

  assert.equal(mergeCatalogData(legacy).schemaVersion, CATALOG_SCHEMA_VERSION);
});

test('an unsupported catalog schema version is preserved for save-time rejection', () => {
  const future = { ...structuredClone(defaultCatalog), schemaVersion: CATALOG_SCHEMA_VERSION + 1 };

  assert.equal(mergeCatalogData(future).schemaVersion, CATALOG_SCHEMA_VERSION + 1);
});

test('reordered packages keep their own defaults', () => {
  const [first, second] = defaultCatalog.packages;
  const merged = mergeCatalogData({
    ...defaultCatalog,
    packages: [
      { slug: second.slug, name: second.name, price: second.price },
      { slug: first.slug, name: first.name, price: first.price }
    ]
  });

  assert.equal(merged.packages[0].slug, second.slug);
  assert.equal(merged.packages[0].nameEn, second.nameEn);
  assert.equal(merged.packages[0].routeEn, second.routeEn);
  assert.deepEqual(merged.packages[0].itinerary, second.itinerary);
  assert.equal(merged.packages[1].nameEn, first.nameEn);
  assert.equal(merged.packages[1].routeEn, first.routeEn);
});

test('a new package does not inherit another package defaults', () => {
  const [first] = defaultCatalog.packages;
  const merged = mergeCatalogData({
    ...defaultCatalog,
    packages: [{ slug: 'brand-new-tour', name: 'Brand new tour', price: 'Rp1' }]
  });

  assert.equal(merged.packages[0].slug, 'brand-new-tour');
  assert.equal(merged.packages[0].nameEn, '');
  assert.notEqual(merged.packages[0].nameEn, first.nameEn);
  assert.equal(merged.packages[0].unitEn, '');
});

test('deleting a package does not shift another package defaults', () => {
  const [first, second] = defaultCatalog.packages;
  const merged = mergeCatalogData({
    ...defaultCatalog,
    packages: [{ slug: second.slug, name: second.name, price: second.price }]
  });

  assert.equal(merged.packages.length, 1);
  assert.equal(merged.packages[0].nameEn, second.nameEn);
  assert.notEqual(merged.packages[0].nameEn, first.nameEn);
  assert.deepEqual(merged.packages[0].itinerary, second.itinerary);
});

test('reordered destinations keep their own defaults', () => {
  const [first, second] = defaultCatalog.destinations;
  const merged = mergeCatalogData({
    ...defaultCatalog,
    destinations: [{ name: second.name }, { name: first.name }]
  });

  assert.equal(merged.destinations[0].slug, second.slug || second.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  assert.equal(merged.destinations[0].note, second.note);
  assert.equal(merged.destinations[1].note, first.note);
});

test('reordered rentals and FAQs are matched by their stable content', () => {
  const [firstRental, secondRental] = defaultCatalog.rentals;
  const [firstFaq, secondFaq] = defaultCatalog.faqs;
  const merged = mergeCatalogData({
    ...defaultCatalog,
    rentals: [{ name: secondRental.name, detail: secondRental.detail, price: secondRental.price, symbol: secondRental.symbol }],
    faqs: [{ question: secondFaq.question, answer: secondFaq.answer }]
  });

  assert.equal(merged.rentals[0].nameEn, secondRental.nameEn);
  assert.notEqual(merged.rentals[0].nameEn, firstRental.nameEn);
  assert.equal(merged.faqs[0].questionEn, secondFaq.questionEn);
  assert.notEqual(merged.faqs[0].questionEn, firstFaq.questionEn);
});

test('reordered package price tiers keep their stable keys and defaults', () => {
  const packageItem = structuredClone(defaultCatalog.packages[0]);
  packageItem.priceTiers = [packageItem.priceTiers[1], packageItem.priceTiers[0]];

  const merged = mergeCatalogData({ ...defaultCatalog, packages: [packageItem] });

  assert.deepEqual(merged.packages[0].priceTiers.map((tier) => tier.key), ['6-10-orang', '1-5-orang']);
  assert.equal(merged.packages[0].priceTiers[0].guestsEn, '6-10 people');
  assert.equal(merged.packages[0].priceTiers[1].guestsEn, '1-5 people');
});

test('renamed rentals and FAQs keep their stable slug and bundled defaults', () => {
  const rental = defaultCatalog.rentals[0];
  const faq = defaultCatalog.faqs[0];
  const merged = mergeCatalogData({
    ...defaultCatalog,
    rentals: [{ ...rental, name: 'Nama rental baru' }],
    faqs: [{ ...faq, question: 'Pertanyaan baru?' }]
  });

  assert.equal(merged.rentals[0].slug, rental.slug);
  assert.equal(merged.rentals[0].nameEn, rental.nameEn);
  assert.equal(merged.faqs[0].slug, faq.slug);
  assert.equal(merged.faqs[0].questionEn, faq.questionEn);
});

test('new rentals and FAQs receive stable slugs for later renames', () => {
  const merged = mergeCatalogData({
    ...defaultCatalog,
    rentals: [{ symbol: 'x', name: 'Rental Baru', detail: 'Detail', price: 'Rp1' }],
    faqs: [{ question: 'Pertanyaan baru?', answer: 'Jawaban baru.' }]
  });

  assert.equal(merged.rentals[0].slug, 'rental-baru');
  assert.equal(merged.faqs[0].slug, 'pertanyaan-baru');
});

test('missing catalog data falls back to the bundled catalog', () => {
  const merged = mergeCatalogData(undefined);

  assert.equal(merged.packages.length, defaultCatalog.packages.length);
  assert.equal(merged.packages[0].slug, defaultCatalog.packages[0].slug);
  assert.equal(merged.destinations.length, defaultCatalog.destinations.length);
});
