import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const publicI18nUrl = new URL('../src/lib/i18n.js', import.meta.url);
const serverCatalogI18nUrl = new URL('../src/lib/server/catalog-i18n.js', import.meta.url);

test('public i18n module does not carry catalog payloads', async () => {
  const source = await readFile(publicI18nUrl, 'utf8');
  for (const marker of ['catalogTranslations', 'packageDetailTranslations', 'rentals:', 'IDR 450,000', 'IDR 75,000', '私人汽车与司机']) {
    assert.equal(source.includes(marker), false, `public i18n still contains ${marker}`);
  }
});

test('server catalog localization keeps rental translations when rentals are present', async () => {
  const { localizeCatalog } = await import(serverCatalogI18nUrl.href);
  const catalog = {
    settings: {},
    packages: [],
    destinations: [],
    faqs: [],
    rentals: [
      { name: 'Private Car', detail: 'Car detail', price: 'Mulai Rp450.000' },
      { name: 'Rental Motor', detail: 'Detail rental', price: 'Mulai Rp75.000' }
    ]
  };
  const localized = localizeCatalog(catalog, 'zh-cn');
  assert.equal(localized.rentals[0].name, '私人汽车与司机');
  assert.equal(localized.rentals[1].name, '摩托车租赁');
  assert.equal(localized.rentals[1].price, '24小时起价 IDR 75,000');
});
