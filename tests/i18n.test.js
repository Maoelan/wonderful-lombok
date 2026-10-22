import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { destinationSlug, getCopy, getFormCopy, localeTag, nominatimLanguage } from '../src/lib/i18n.js';
import { localizeCatalog } from '../src/lib/server/catalog-i18n.js';

test('Chinese package details contain no Indonesian or English fallback content', () => {
  const catalog = localizeCatalog(defaultCatalog, 'zh-cn');
  const tour = catalog.packages[0];

  assert.equal(tour.name, '龙目岛南部与萨萨克文化');
  assert.equal(tour.itinerary[0].day, '上午');
  assert.equal(tour.priceTiers[0].note, '每辆车总价');
  assert.equal(getCopy('zh-cn').priceHeading, '按人数选择价格');
  assert.equal(getFormCopy('zh-cn').bookNow, '立即预订');
});

test('destination URLs remain stable across localized catalog copies', () => {
  const source = { name: 'Kuta Mandalika', slug: 'kuta-mandalika' };
  assert.equal(destinationSlug(source), 'kuta-mandalika');
  assert.equal(destinationSlug({ name: 'Tiga Gili' }), 'tiga-gili');
});

test('each supported interface locale has detail-page copy', () => {
  for (const locale of ['id', 'en', 'zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms']) {
    const copy = getCopy(locale);
    assert.ok(copy.home);
    assert.ok(copy.itineraryHeading);
    assert.ok(copy.priceHeading);
    assert.ok(copy.readyTitle);
    assert.ok(copy.customItinerary);
  }
});

test('map and GPS messages are complete for every supported locale', () => {
  const required = ['mapLoadError', 'selected', 'searchFailed', 'gpsSearching', 'gpsDenied', 'routeNotFound', 'bookingOpened', 'whatsappGreeting', 'interactiveMap'];
  for (const locale of ['id', 'en', 'zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms']) {
    const copy = getFormCopy(locale);
    required.forEach((key) => assert.ok(copy[key], `${locale}.${key}`));
    assert.ok(localeTag(locale));
    assert.ok(nominatimLanguage(locale));
  }
  assert.equal(nominatimLanguage('zh-cn'), 'zh-CN');
  assert.equal(nominatimLanguage('zh-tw'), 'zh-TW');
  assert.notEqual(getFormCopy('en').gpsDenied, getFormCopy('id').gpsDenied);
});

test('every non-English locale localizes dynamic public catalog content', () => {
  const english = localizeCatalog(defaultCatalog, 'en');
  for (const locale of ['zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms']) {
    const catalog = localizeCatalog(defaultCatalog, locale);
    catalog.packages.forEach((item, index) => {
      assert.notEqual(item.name, english.packages[index].name, `${locale} package ${index + 1}`);
      assert.notEqual(item.itinerary[0].day, english.packages[index].itinerary[0].day, `${locale} itinerary ${index + 1}`);
      assert.notEqual(item.includes[0], english.packages[index].includes[0], `${locale} inclusions ${index + 1}`);
    });
    catalog.destinations.forEach((item, index) => assert.notEqual(item.detail, english.destinations[index].detail, `${locale} destination ${index + 1}`));
    catalog.rentals.forEach((item, index) => assert.notEqual(item.name, english.rentals[index].name, `${locale} rental ${index + 1}`));
    catalog.faqs.forEach((item, index) => assert.notEqual(item.question, english.faqs[index].question, `${locale} FAQ ${index + 1}`));
  }
});
