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

test('homepage destinations stretch the short last row on desktop only', () => {
  const css = source('app.css');
  assert.match(css, /@media \(min-width: 1001px\) \{\s*body \.site-theme \.homepage-destinations \{ grid-template-columns: repeat\(6, minmax\(0, 1fr\)\); \}/);
  assert.match(css, /\.homepage-destinations \.destination-card \{ grid-column: span 2; \}/);
  assert.match(css, /\.destination-card:nth-child\(3n \+ 1\):nth-last-child\(2\),\s*body \.site-theme \.homepage-destinations \.destination-card:nth-child\(3n \+ 2\):nth-last-child\(1\) \{ grid-column: span 3; \}/);
  assert.match(css, /\.destination-card:nth-child\(3n \+ 1\):nth-last-child\(1\) \{ grid-column: 2 \/ span 4; \}/);
  assert.match(css, /@media \(max-width: 1000px\) \{[\s\S]*?\.homepage-destinations \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
});
