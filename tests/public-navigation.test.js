import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('destination detail headers retain the complete destination dropdown', () => {
  const header = source('../src/lib/SiteHeader.svelte');
  assert.doesNotMatch(header, /onDestinationsPage/);
  assert.match(header, /<summary>\{c.destinations\}<\/summary>/);
  assert.match(header, /\{#each destinations as destination\}/);
  assert.match(header, /destinationSlug\(destination\)/);
  assert.match(header, /href=\{`\$\{home\}#destinasi`\}/);
  const detail = source('../src/routes/[lang]/destinasi/[slug]/+page.svelte');
  assert.match(detail, /destinations=\{data.catalog.destinations\}/);
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
