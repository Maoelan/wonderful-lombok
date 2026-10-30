import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('tour dropdown stays compact with a see-all link on catalogue and package detail pages', () => {
  const header = source('../src/lib/SiteHeader.svelte');
  assert.doesNotMatch(header, /onToursPage/);
  assert.match(header, /<summary>\{c.tours\}<\/summary>/);
  assert.match(header, /\{#each navPackages as item\}/);
  assert.match(header, /class="nav-dropdown-more" href=\{localePath\(locale, '\/paket-wisata'\)\}/);
  for (const path of ['../src/routes/[lang]/paket-wisata/+page.svelte', '../src/routes/[lang]/paket-wisata/[slug]/+page.svelte']) {
    assert.match(source(path), /packages=\{data.catalog.packages\}/);
    assert.match(source(path), /destinations=\{data.catalog.destinations\}/);
  }
});

test('destination dropdown groups links by region and links to the destination index', () => {
  const header = source('../src/lib/SiteHeader.svelte');
  assert.doesNotMatch(header, /onDestinationsPage/);
  assert.match(header, /<summary>\{c.destinations\}<\/summary>/);
  assert.match(header, /\{#each navDestinationGroups as group\}/);
  assert.match(header, /class="nav-dropdown-group">\{c\.regions\[group\.key\]\}/);
  assert.match(header, /group\.items\.slice\(0, NAV_DESTINATION_LIMIT\)/);
  assert.match(header, /\{#each navDestinations as destination\}/);
  assert.match(header, /destinationSlug\(destination\)/);
  assert.match(header, /class="nav-dropdown-more" href=\{localePath\(locale, '\/destinasi'\)\}/);
  const detail = source('../src/routes/[lang]/destinasi/[slug]/+page.svelte');
  assert.match(detail, /destinations=\{data.catalog.destinations\}/);
  assert.match(detail, /localePath\(data\.locale, '\/destinasi'\)/);
});

test('travel navigation consistently targets the homepage calculator', () => {
  const home = source('../src/routes/+page.svelte');
  assert.match(home, /<a href="#hitung-travel" on:click=\{closeMenu\}>\{c.travel\}<\/a>/);
  assert.match(home, /class="service-tile" href="#hitung-travel"/);
  for (const path of ['../src/lib/SiteHeader.svelte', '../src/lib/SiteFooter.svelte']) {
    const component = source(path);
    assert.match(component, /href=\{`\$\{home\}#hitung-travel`\}/);
    assert.doesNotMatch(component, /href=\{localePath\(locale, '\/travel-lombok'\)\}/);
  }
});
