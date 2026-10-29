import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {packageBooking} from '../src/lib/booking-context.js';
import {defaultCatalog} from '../src/lib/catalog.js';
import {getFormCopy, languages} from '../src/lib/i18n.js';
import {heroCopy, refreshLegacyHeroSettings} from '../src/lib/hero-copy.js';
import {mergeCatalogData} from '../src/lib/server/catalog-merge.js';
import {localizeCatalog} from '../src/lib/server/catalog-i18n.js';

const legacy = {
  heroTitle: 'Lombok, dirancang sesuai caramu bepergian.',
  heroTitleEn: 'Lombok, planned around the way you travel.',
  heroDescription: 'Pilih tur privat, antar-jemput antarlokasi, atau kendaraan dengan driver. Kami membantu merangkai rute yang masuk akal untuk waktu liburanmu.',
  heroDescriptionEn: 'Choose a private tour, point-to-point transfer, or a vehicle with a driver. We help shape a route that fits the time you have.'
};

test('unchanged legacy CMS hero defaults upgrade without mutating stored data', () => {
  const source = structuredClone(defaultCatalog);
  Object.assign(source.settings, legacy);
  const before = structuredClone(source);
  const merged = mergeCatalogData(source);
  assert.equal(merged.settings.heroTitle, heroCopy.id.heroTitle);
  assert.equal(merged.settings.heroTitleEn, heroCopy.en.heroTitle);
  assert.deepEqual(source, before);
  for (const {code} of languages) {
    const localized = localizeCatalog(merged, code);
    assert.equal(localized.settings.heroTitle, heroCopy[code].heroTitle, code);
    assert.equal(localized.settings.heroDescription, heroCopy[code].heroDescription, code);
  }
});

test('custom CMS copy, images, prices and contacts survive the default refresh', () => {
  const source = structuredClone(defaultCatalog);
  Object.assign(source.settings, {heroTitle:'Custom title',heroTitleEn:'Custom English title',heroDescription:'Custom description',heroDescriptionEn:'Custom English description',heroImage:'/uploads/custom.png'});
  source.travelRate = 7000;
  const merged = mergeCatalogData(source);
  assert.deepEqual(merged.settings, source.settings);
  assert.equal(merged.travelRate, 7000);
  assert.deepEqual(merged.packages, source.packages);
});

test('legacy rich-text paragraph wrappers update but partially edited fields remain unchanged', () => {
  const settings = {...legacy,heroTitle:'Admin title',heroDescription:`<p>${legacy.heroDescription}</p>`};
  const refreshed = refreshLegacyHeroSettings(settings);
  assert.equal(refreshed.heroTitle, 'Admin title');
  assert.equal(refreshed.heroDescription, heroCopy.id.heroDescription);
  assert.equal(refreshed.heroTitleEn, heroCopy.en.heroTitle);
  assert.equal(refreshLegacyHeroSettings({heroTitle:''}).heroTitle, '');
});

test('package booking context keeps displayed price units and duration, never a computed total', () => {
  for (const item of defaultCatalog.packages) {
    assert.deepEqual(packageBooking(item),{type:'wisata',name:item.name,price:item.price,unit:item.unit,duration:item.duration,image:item.image,route:item.route});
  }
  const context = packageBooking({name:'Custom package',price:'Contact us',unit:'per group',duration:'2 days',people:10,estimatedPrice:1});
  assert.equal(context.price,'Contact us');
  assert.equal(context.estimatedPrice,undefined);
  assert.equal(context.people,undefined);
  assert.equal(packageBooking({name:'No optional fields'}).price,undefined);
});

test('every package booking entry point supplies price context to the shared dialog', () => {
  for (const path of ['../src/routes/+page.svelte','../src/routes/[lang]/paket-wisata/[slug]/+page.svelte']) {
    const source=readFileSync(new URL(path,import.meta.url),'utf8');
    assert.match(source,/booking = packageBooking\(item\)/);
    assert.doesNotMatch(source,/booking = \{ type: 'wisata', name: item.name \}/);
  }
  const dialog=readFileSync(new URL('../src/lib/BookingDialog.svelte',import.meta.url),'utf8');
  for(const field of ['booking.duration','booking.price','booking.unit','t.priceConfirmation']) assert.ok(dialog.includes(field),field);
});

test('homepage curates featured packages and destinations with counts and see-all links', () => {
  const source=readFileSync(new URL('../src/routes/+page.svelte',import.meta.url),'utf8');
  const packages=source.slice(source.indexOf('<section class="packages section"'),source.indexOf('<section class="destinations"'));
  assert.match(packages, /\{#each homePackages as item\}/);
  assert.match(packages, /<TourCard \{item\}/);
  assert.doesNotMatch(packages, /\{#each packages as item\}/);
  assert.match(packages, /class="section-kicker">\{c\.featuredTours\}/);
  assert.match(packages, /c\.packageCount/);
  assert.match(packages, /class="section-more" href=\{localePath\(locale, '\/paket-wisata'\)\}/);
  const destinations=source.slice(source.indexOf('<section class="destinations"'),source.indexOf('<section class="travel-section"'));
  assert.match(destinations, /\{#each homeDestinations as destination\}/);
  assert.match(destinations, /<DestinationCard item=\{destination\}/);
  assert.match(destinations, /c\.destinationCount/);
  assert.match(destinations, /class="section-more" href=\{localePath\(locale, '\/destinasi'\)\}/);
  assert.match(source, /class="nav-dropdown-more" href=\{`\/\$\{locale\}\/paket-wisata`\}/);
  assert.match(source, /class="nav-dropdown-more" href=\{localePath\(locale, '\/destinasi'\)\}/);
});

test('summary labels and final-price notices are translated for all eight locales', () => {
  for(const {code} of languages) {
    const copy=getFormCopy(code);
    for(const key of ['checkTransferFare','packageDuration','startingPrice','priceConfirmation']) {
      assert.ok(copy[key],`${code}.${key}`);
      if(code!=='en')assert.notEqual(copy[key],getFormCopy('en')[key],`${code}.${key}`);
    }
  }
});
