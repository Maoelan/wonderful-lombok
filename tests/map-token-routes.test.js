import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = [
  ['localized travel page', '../src/routes/[lang]/travel-lombok/+page.server.js']
];

for (const [name, path] of routes) {
  test(`${name} passes the public Mapbox token to the planner`, () => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /mapboxToken:\s*process\.env\.PUBLIC_MAPBOX_TOKEN\s*\|\|\s*''/);
  });
}

test('the homepage links to the travel workflow instead of loading another map', () => {
  const source = readFileSync(new URL('../src/routes/+page.svelte', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /LazyPickupCalculator/);
  assert.match(source, /href=\{`\$\{localePath\(locale, '\/travel-lombok'\)\}#hitung-travel`\}/);
  for (const path of ['../src/routes/+page.server.js', '../src/routes/[lang]/+page.server.js']) {
    assert.doesNotMatch(readFileSync(new URL(path, import.meta.url), 'utf8'), /mapboxToken:/);
  }
});
