import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = [
  ['homepage', '../src/routes/+page.server.js'],
  ['localized homepage', '../src/routes/[lang]/+page.server.js'],
  ['localized travel page', '../src/routes/[lang]/travel-lombok/+page.server.js']
];

for (const [name, path] of routes) {
  test(`${name} passes the public Mapbox token to the planner`, () => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /mapboxToken:\s*process\.env\.PUBLIC_MAPBOX_TOKEN\s*\|\|\s*''/);
  });
}

test('the homepage retains one lazy transfer calculator as the primary travel workflow', () => {
  const source = readFileSync(new URL('../src/routes/+page.svelte', import.meta.url), 'utf8');
  assert.equal((source.match(/<LazyPickupCalculator /g) || []).length, 1);
  assert.equal((source.match(/id="hitung-travel"/g) || []).length, 1);
  assert.match(source, /mapboxToken=\{data.mapboxToken\}/);
  assert.doesNotMatch(source, /href=\{localePath\(locale, '\/travel-lombok'\)\}/);
});
