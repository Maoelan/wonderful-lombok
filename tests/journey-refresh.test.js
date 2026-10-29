import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaultCatalog } from '../src/lib/catalog.js';
import { demoImage, demoImageKeys, isDemoImage, refreshDemoImages } from '../src/lib/demo-images.js';
import { imageSrcset, imageUrl } from '../src/lib/image.js';
import { validImage } from '../src/lib/server/catalog-validation.js';
import { getCopy, getFormCopy, languages } from '../src/lib/i18n.js';
import { refreshLegacyHeroSettings, heroCopy } from '../src/lib/hero-copy.js';

test('every generated delivery variant exists, has WebP data and uses a strict local allowlist', () => {
  for (const key of demoImageKeys) for (const width of [480,720,960,1280,1600]) {
    const path = `/images/lombok-ai/${key}-${width}.webp`;
    assert.equal(validImage(path), true);
    const bytes = readFileSync(new URL('../static' + path, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
  for (const bad of ['/images/lombok-ai/../secret-480.webp', '/images/lombok-ai/unknown-480.webp', '/images/lombok-ai/hero-coast-1.webp', '/images/lombok-ai/hero-coast-480.webp?x=1', '//evil.example/x.webp']) assert.equal(validImage(bad), false, bad);
});

test('demo media uses static responsive delivery even on Vercel', () => {
  const previous = process.env.VERCEL;
  try {
    process.env.VERCEL = '1';
    assert.equal(imageUrl(demoImage('hero-coast'),640), '/images/lombok-ai/hero-coast-720.webp');
    assert.equal(imageSrcset(demoImage('hero-coast'),[480,600,640]), '/images/lombok-ai/hero-coast-480.webp 480w, /images/lombok-ai/hero-coast-720.webp 720w');
  } finally { if(previous === undefined)delete process.env.VERCEL; else process.env.VERCEL=previous; }
});

test('seed covers are distinct and gallery refresh never overwrites custom uploads or deletions', () => {
  assert.equal(new Set(defaultCatalog.packages.map(item=>item.image)).size, defaultCatalog.packages.length);
  assert.equal(new Set(defaultCatalog.destinations.map(item=>item.image)).size, defaultCatalog.destinations.length);
  assert.ok(defaultCatalog.packages.every(item=>isDemoImage(item.image)));
  const custom=structuredClone(defaultCatalog);
  custom.packages[0].image='/uploads/my-photo.webp'; custom.packages[0].images=[];
  custom.destinations[0].images=['https://example.convex.cloud/api/storage/custom'];
  custom.settings.heroImage='';
  assert.deepEqual(refreshDemoImages(custom),custom);
});

test('all eight languages provide the refreshed navigation and form hierarchy', () => {
  for(const {code} of languages) {
    const copy=getCopy(code), form=getFormCopy(code);
    for(const key of ['heroPrimary','travel','tourHeading','destinationHeading','faqHeading','imageNotice'])assert.ok(copy[key],code+'.'+key);
    for(const key of ['customerDetails','checkTransferFare','priceConfirmation'])assert.ok(form[key],code+'.'+key);
  }
  assert.equal(getCopy('id').travel,'Jasa Travel');
});

test('the previous hero default updates but an edited hero remains canonical', () => {
  assert.equal(refreshLegacyHeroSettings({heroTitle:'Wisata & antar-jemput Lombok'}).heroTitle, heroCopy.id.heroTitle);
  assert.equal(refreshLegacyHeroSettings({heroTitle:'Perjalanan pilihan client'}).heroTitle,'Perjalanan pilihan client');
});

test('homepage keeps equal cards, two hero links and one calculator introduction', () => {
  const source=readFileSync(new URL('../src/routes/+page.svelte',import.meta.url),'utf8');
  assert.doesNotMatch(source,/class:featured/);
  assert.match(source,/class="hero-actions"/);
  assert.equal((source.match(/id="hitung-travel"/g)||[]).length,1);
  assert.doesNotMatch(source,/class="section travel-heading"/);
  assert.match(source,/booking = packageBooking\(item\)/);
  const manifest=JSON.parse(readFileSync(new URL('../static/images/lombok-ai/manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.assets.length,10);
  assert.ok(manifest.negativePrompt.includes('unrealistic water color, neon turquoise sea'));
});

test('homepage and detail pages share the compact footer without the removed notices', () => {
  const home=readFileSync(new URL('../src/routes/+page.svelte',import.meta.url),'utf8');
  const footer=readFileSync(new URL('../src/lib/SiteFooter.svelte',import.meta.url),'utf8');
  assert.match(home, /<SiteFooter \{settings\} \{locale\} \{rentalEnabled\} homepage/);
  assert.doesNotMatch(home+footer, /image-disclosure|footer-copyright|All rights reserved|Hak cipta dilindungi/);
  assert.match(footer, /id="kontak"/);
  assert.match(footer, /settings\.instagram/);
  assert.match(footer, /#hitung-travel/);
});

test('swap uses a balanced SVG and locale picker retains its current flag', () => {
  const calculator=readFileSync(new URL('../src/lib/PickupCalculator.svelte',import.meta.url),'utf8');
  const language=readFileSync(new URL('../src/lib/LanguageSelector.svelte',import.meta.url),'utf8');
  assert.match(calculator, /aria-label=\{t.swapLocations\}><svg/);
  assert.doesNotMatch(calculator, /⇅/);
  assert.match(language, /\/flags\/\$\{current.flag\}\.png/);
});

test('shared photo gallery auto-rotates package thumbnails with a staggered crossfade', () => {
  const source=readFileSync(new URL('../src/lib/PhotoGallery.svelte',import.meta.url),'utf8');
  assert.match(source, /const AUTOPLAY_DELAY = 5000/);
  assert.match(source, /const STAGGER_DELAY = 1200/);
  assert.match(source, /const FADE_DURATION = 450/);
  assert.match(source, /Math\.min\(position, 4\) \* STAGGER_DELAY/);
  assert.match(source, /if \(!compact \|\| reducedMotion\(\)\) return/);
  assert.match(source, /!autoplayPaused && !document\.hidden && Date\.now\(\) - lastChanged >= AUTOPLAY_DELAY/);
  assert.match(source, /on:mouseenter=\{pauseAutoplay\}/);
  assert.match(source, /on:focusin=\{pauseAutoplay\}/);
  assert.match(source, /class="photo-layer previous" class:fading/);
  assert.doesNotMatch(source, /\{#key selected\}/);
  assert.doesNotMatch(source, /package-slide/);
  assert.match(source, /on:pointercancel/);
  assert.match(source, /event\.preventDefault\(\); suppressClick = false/);
  assert.match(source, /\{#if !compact\}\s*<button class="photo-arrow/);
  assert.match(source, /class="photo-indicators"/);
  assert.match(source, /aria-pressed=\{index === i\}/);
  assert.match(source, /aria-label=\{t\.previousImage\}/);
  assert.match(source, /aria-label=\{t\.nextImage\}/);
});
