import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCatalog } from '../src/lib/catalog.js';
import { getCopy, getFormCopy, localizeCatalog } from '../src/lib/i18n.js';

test('Chinese package details contain no Indonesian or English fallback content', () => {
  const catalog = localizeCatalog(defaultCatalog, 'zh-cn');
  const tour = catalog.packages[0];

  assert.equal(tour.name, '龙目岛南部与萨萨克文化');
  assert.equal(tour.itinerary[0].day, '上午');
  assert.equal(tour.priceTiers[0].note, '每辆车总价');
  assert.equal(getCopy('zh-cn').priceHeading, '按人数选择价格');
  assert.equal(getFormCopy('zh-cn').bookNow, '立即预订');
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
