import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
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
    slug: defaultCatalog.packages[0].slug,
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

test('reordered packages, rentals, and FAQs keep their own translations', () => {
  const [firstPackage, secondPackage] = defaultCatalog.packages;
  const [firstRental, secondRental] = defaultCatalog.rentals;
  const [firstFaq, secondFaq] = defaultCatalog.faqs;
  const catalog = localizeCatalog({
    ...defaultCatalog,
    packages: [secondPackage, firstPackage],
    rentals: [secondRental, firstRental],
    faqs: [secondFaq, firstFaq]
  }, 'nl');

  assert.equal(catalog.packages[0].slug, secondPackage.slug);
  assert.equal(catalog.packages[0].name, 'Snorkeltocht langs de Gili-eilanden');
  assert.equal(catalog.packages[1].name, 'Zuid-Lombok & Sasakcultuur');
  assert.equal(catalog.rentals[0].slug, secondRental.slug);
  assert.equal(catalog.rentals[0].name, 'Scooterverhuur');
  assert.equal(catalog.rentals[1].name, 'Privéauto met chauffeur');
  assert.equal(catalog.faqs[0].slug, secondFaq.slug);
  assert.equal(catalog.faqs[0].question, 'Zijn alle reizen privé?');
  assert.equal(catalog.faqs[1].question, 'Kan ik de route van een pakket aanpassen?');
});

test('reordered package price tiers keep their own translations', () => {
  const packageItem = structuredClone(defaultCatalog.packages[0]);
  packageItem.priceTiers = [packageItem.priceTiers[1], packageItem.priceTiers[0]];

  const catalog = localizeCatalog({ ...defaultCatalog, packages: [packageItem] }, 'nl');

  assert.equal(catalog.packages[0].priceTiers[0].guests, '6-10 personen');
  assert.equal(catalog.packages[0].priceTiers[1].guests, '1-5 personen');
});

test('admin rental prices and FAQ edits are not overwritten by bundled copy', () => {
  const rentals = structuredClone(defaultCatalog.rentals);
  rentals[0].price = 'Mulai Rp999.000 per 10 jam';
  const faqs = structuredClone(defaultCatalog.faqs);
  const travelFaq = faqs.find((item) => item.slug === 'estimasi-paket-travel');
  travelFaq.answer = 'Tarif sekarang Rp12.000 per kilometer.';

  const catalog = localizeCatalog({ ...defaultCatalog, rentals, faqs }, 'nl');
  const english = localizeCatalog({ ...defaultCatalog, rentals, faqs }, 'en');
  const localizedTravelFaq = catalog.faqs.find((item) => item.slug === 'estimasi-paket-travel');
  const englishTravelFaq = english.faqs.find((item) => item.slug === 'estimasi-paket-travel');

  assert.equal(catalog.rentals[0].price, 'Mulai Rp999.000 per 10 jam');
  assert.equal(catalog.rentals[1].price, 'Vanaf IDR 75.000 per 24 uur');
  assert.equal(english.rentals[0].price, 'Mulai Rp999.000 per 10 jam');
  assert.equal(localizedTravelFaq.answer, 'Tarif sekarang Rp12.000 per kilometer.');
  assert.equal(englishTravelFaq.answer, 'Tarif sekarang Rp12.000 per kilometer.');
});

test('the FAQ travel-rate number follows the editable catalog rate', () => {
  const catalog = localizeCatalog({ ...defaultCatalog, travelRate: 12_500 }, 'nl');
  const travelFaq = catalog.faqs.find((item) => item.slug === 'estimasi-paket-travel');

  assert.match(travelFaq.answer, /12\.500/);
  assert.doesNotMatch(travelFaq.answer, /10\.000/);
});

test('Indonesian uses admin base content without the bundled fallback', () => {
  const catalog = localizeCatalog(adminCatalog, 'id');

  assert.equal(catalog.packages[0].name, 'Nama admin');
  assert.equal(catalog.packages[0].itinerary[0].title, 'Itinerary admin');
  assert.equal(catalog.packages[0].priceTiers[0].guests, '1 orang');
  assert.equal(catalog.settings.heroTitle, 'Judul admin');
  assert.equal(catalog.rentals[0].price, 'Mulai Rp9.999.999');
});

test('an admin-only package slug falls back to the admin English field', () => {
  const catalog = localizeCatalog({
    ...adminCatalog,
    packages: [{ ...adminCatalog.packages[0], slug: 'admin-only-package' }]
  }, 'nl');

  assert.equal(catalog.packages[0].name, 'Admin package');
  assert.equal(catalog.packages[0].itinerary[0].title, 'Admin itinerary');
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
