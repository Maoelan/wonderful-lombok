import test from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbSchema, getSeoCopy, jsonLdScript, plainDescription, tourSchema, travelAgencySchema } from '../src/lib/seo.js';

test('every supported locale has unique SEO metadata', () => {
  const locales = ['id', 'en', 'zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms'];
  const descriptions = locales.map((locale) => getSeoCopy(locale).homeDescription);
  assert.equal(new Set(descriptions).size, locales.length);
  for (const locale of locales) {
    const seo = getSeoCopy(locale);
    assert.ok(seo.homeTitle.length > 20);
    const minimumLength = locale.startsWith('zh-') ? 40 : 80;
    assert.ok(seo.homeDescription.length >= minimumLength && seo.homeDescription.length <= 170);
    assert.ok(seo.catalogTitle);
    assert.ok(seo.og);
  }
});

test('SEO helpers produce safe descriptions and structured data', () => {
  assert.equal(plainDescription('<p>Private <strong>Lombok</strong> tour</p>'), 'Private Lombok tour');
  assert.ok(plainDescription('word '.repeat(100)).length <= 160);
  assert.ok(jsonLdScript({ value: '</script><script>alert(1)</script>' }).includes('\\u003c/script>'));

  const breadcrumb = breadcrumbSchema([{ name: 'Home', url: 'https://example.com/' }]);
  assert.equal(breadcrumb.itemListElement[0].position, 1);

  const business = travelAgencySchema({
    homeUrl: 'https://example.com/en', imageUrl: 'https://example.com/logo.png', description: 'Private Lombok tours',
    settings: { whatsapp: '628123456789', email: 'hello@example.com', instagram: '', tiktok: '', facebook: '' }, languages: ['id-ID', 'en']
  });
  assert.equal(business['@graph'][0]['@type'][0], 'TravelAgency');

  const tour = tourSchema({
    item: { name: 'South Lombok', route: 'Kuta and Tanjung Aan', price: 'Rp1.250.000' }, canonicalUrl: 'https://example.com/en/tour',
    imageUrls: ['https://example.com/tour.jpg'], description: 'A private tour', homeUrl: 'https://example.com/en', homeLabel: 'Home', toursUrl: 'https://example.com/en/tours', toursLabel: 'Tours'
  });
  assert.equal(tour['@graph'][1].offers.price, 1250000);
});
