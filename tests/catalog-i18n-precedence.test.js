import test from 'node:test';
import assert from 'node:assert/strict';
import { localizeCatalog } from '../src/lib/server/catalog-i18n.js';

const adminCatalog = {
  settings: {
    heroTitle: 'Judul admin',
    heroTitleEn: 'Admin hero',
    heroDescription: 'Deskripsi admin',
    heroDescriptionEn: 'Admin description',
    aboutTitle: 'Tentang admin',
    aboutTitleEn: 'Admin about',
    aboutDescription: 'Deskripsi tentang admin',
    aboutDescriptionEn: 'Admin about description',
    whatsapp: '+620000000000'
  },
  packages: [{
    slug: 'admin-package',
    category: 'Kategori admin',
    categoryEn: 'Admin category',
    duration: '3 hari',
    durationEn: '3 days',
    name: 'Nama admin',
    nameEn: 'Admin package',
    route: 'Rute admin',
    routeEn: 'Admin route',
    detail: 'Detail admin',
    detailEn: 'Admin detail',
    price: 'Rp9.999.999',
    unit: 'per grup',
    unitEn: 'per group',
    image: '',
    images: [],
    itinerary: [{ day: 'Hari 1', title: 'Itinerary admin', items: ['Item admin'] }],
    itineraryEn: [{ day: 'Day 1', title: 'Admin itinerary', items: ['Admin item'] }],
    includes: ['Termasuk admin'],
    includesEn: ['Admin inclusion'],
    excludes: ['Tidak termasuk admin'],
    excludesEn: ['Admin exclusion'],
    priceTiers: [{ guests: '1 orang', guestsEn: '1 guest', price: 'Rp9.999.999', note: 'Catatan admin', noteEn: 'Admin note' }]
  }],
  destinations: [{
    name: 'Destinasi admin',
    nameEn: 'Admin destination',
    note: 'Catatan admin',
    noteEn: 'Admin note',
    detail: 'Detail admin',
    detailEn: 'Admin detail'
  }],
  faqs: [{
    question: 'Pertanyaan admin?',
    questionEn: 'Admin question?',
    answer: 'Jawaban admin',
    answerEn: 'Admin answer'
  }],
  rentals: [{
    symbol: 'car',
    name: 'Rental admin',
    nameEn: 'Admin rental',
    detail: 'Detail rental',
    detailEn: 'Admin rental detail',
    price: 'Mulai Rp9.999.999',
    priceEn: 'From IDR 9,999,999'
  }]
};

test('English uses the admin English fields and preserves admin prices', () => {
  const catalog = localizeCatalog(adminCatalog, 'en');

  assert.equal(catalog.packages[0].name, 'Admin package');
  assert.equal(catalog.packages[0].itinerary[0].title, 'Admin itinerary');
  assert.equal(catalog.packages[0].includes[0], 'Admin inclusion');
  assert.equal(catalog.packages[0].priceTiers[0].guests, '1 guest');
  assert.equal(catalog.packages[0].priceTiers[0].price, 'Rp9.999.999');
  assert.equal(catalog.destinations[0].name, 'Admin destination');
  assert.equal(catalog.faqs[0].question, 'Admin question?');
  assert.equal(catalog.rentals[0].name, 'Admin rental');
  assert.equal(catalog.settings.heroTitle, 'Admin hero');
});

test('non-English locales keep the bundled translation without overwriting admin price tiers', () => {
  const catalog = localizeCatalog(adminCatalog, 'nl');
  const tier = catalog.packages[0].priceTiers[0];

  assert.match(catalog.packages[0].name, /Zuid-Lombok/);
  assert.match(catalog.packages[0].itinerary[0].day, /Ochtend/);
  assert.match(catalog.packages[0].includes[0], /Priv/);
  assert.match(tier.guests, /personen/);
  assert.match(tier.note, /totaal/);
  assert.equal(tier.price, 'Rp9.999.999');
  assert.equal(catalog.packages[0].price, 'Rp9.999.999');
  assert.match(catalog.settings.heroTitle, /Lombok/);
  assert.equal(catalog.settings.whatsapp, '+620000000000');
});

test('Chinese keeps its bundled translation and does not restore a hardcoded price', () => {
  const catalog = localizeCatalog(adminCatalog, 'zh-cn');

  assert.notEqual(catalog.packages[0].name, 'Admin package');
  assert.notEqual(catalog.packages[0].name, 'Nama admin');
  assert.equal(catalog.packages[0].priceTiers[0].price, 'Rp9.999.999');
  assert.equal(catalog.packages[0].price, 'Rp9.999.999');
});

test('Indonesian uses admin base content without the bundled fallback', () => {
  const catalog = localizeCatalog(adminCatalog, 'id');

  assert.equal(catalog.packages[0].name, 'Nama admin');
  assert.equal(catalog.packages[0].itinerary[0].title, 'Itinerary admin');
  assert.equal(catalog.packages[0].priceTiers[0].guests, '1 orang');
  assert.equal(catalog.settings.heroTitle, 'Judul admin');
  assert.equal(catalog.rentals[0].price, 'Mulai Rp9.999.999');
});

test('a locale without bundled copy falls back to the admin English field', () => {
  const catalog = localizeCatalog({
    ...adminCatalog,
    packages: [
      ...adminCatalog.packages,
      { slug: 'new-package-1', name: 'Paket baru 1', nameEn: 'New package 1', priceTiers: [] },
      { slug: 'new-package-2', name: 'Paket baru 2', nameEn: 'New package 2', priceTiers: [] },
      { slug: 'new-package', name: 'Paket baru', nameEn: 'New package', priceTiers: [] }
    ]
  }, 'nl');

  assert.equal(catalog.packages[3].name, 'New package');
});
