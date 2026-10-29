import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DESTINATION_REGION_KEYS } from '../src/lib/catalog-display.js';
import { getCopy, languages } from '../src/lib/i18n.js';
import { getSeoCopy } from '../src/lib/seo.js';

const source = (path) => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');

test('destination index renders grouped cards with localized metadata and its own header state', () => {
  const page = source('routes/[lang]/destinasi/+page.svelte');
  assert.match(page, /<DestinationCard/);
  assert.match(page, /groupDestinationsByRegion\(data\.catalog\.destinations\)/);
  assert.match(page, /seo\.destinationsTitle/);
  assert.match(page, /seo\.destinationsDescription/);
  assert.match(page, /seo\.destinationsBreadcrumb/);
  assert.match(page, /suffix="\/destinasi"/);
  assert.match(page, /<SiteFooter/);
  const server = source('routes/[lang]/destinasi/+page.server.js');
  assert.match(server, /isLocale\(params\.lang\)/);
  assert.match(server, /localePath\(params\.lang, '\/destinasi'\)/);
  assert.match(server, /alternateUrls\(origin, '\/destinasi'\)/);
});

test('sitemap includes the destination index', () => {
  assert.match(source('routes/sitemap.xml/+server.js'), /'\/destinasi'/);
});

test('discovery copy and destination SEO cover every locale', () => {
  for (const { code } of languages) {
    const copy = getCopy(code);
    for (const key of ['featuredTours', 'featuredDestinations', 'allDestinations', 'packageCount', 'destinationCount']) assert.ok(copy[key], `${code}.${key}`);
    for (const key of DESTINATION_REGION_KEYS) assert.ok(copy.regions[key], `${code}.regions.${key}`);
    const seo = getSeoCopy(code);
    for (const key of ['destinationsTitle', 'destinationsDescription', 'destinationsBreadcrumb']) assert.ok(seo[key], `${code}.${key}`);
  }
});
