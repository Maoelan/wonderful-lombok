import test from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbSchema, destinationSchema, getDestinationSeo, getSeoCopy, getTravelSeo, jsonLdScript, plainDescription, tourSchema, travelAgencySchema, travelServiceSchema } from '../src/lib/seo.js';

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

test('travel and destination landing metadata is localized for every language', () => {
  const locales = ['id', 'en', 'zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms'];
  for (const locale of locales) {
    const travel = getTravelSeo(locale);
    assert.match(travel.title, /Wonderful Lombok/);
    assert.ok(travel.description.length >= (locale.startsWith('zh-') ? 35 : 80));
    assert.equal(travel.coverage.length, 4);
    const destination = getDestinationSeo(locale, { name: 'Sembalun', detail: 'Mountain views in East Lombok.', note: 'Rinjani landscape' });
    assert.match(destination.title, /Sembalun/);
    assert.ok(destination.description);
  }
  assert.match(getTravelSeo('zh-CN').title, /龙目岛/);
  assert.match(getDestinationSeo('zh-TW', { name: 'Sembalun', detail: '山景', note: '林贾尼' }).title, /龍目島/);
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

  const service = travelServiceSchema({ canonicalUrl: 'https://example.com/en/travel', homeUrl: 'https://example.com/en', homeLabel: 'Home', serviceLabel: 'Lombok transfers', description: 'Private transfers', imageUrl: 'https://example.com/transfer.jpg' });
  assert.equal(service['@graph'][1]['@type'], 'Service');

  const destination = destinationSchema({ item: { name: 'Sembalun' }, canonicalUrl: 'https://example.com/en/destination/sembalun', homeUrl: 'https://example.com/en', homeLabel: 'Home', destinationsLabel: 'Sembalun', imageUrls: ['https://example.com/sembalun.jpg'], description: 'A mountain destination' });
  assert.equal(destination['@graph'][1]['@type'], 'TouristDestination');
});
