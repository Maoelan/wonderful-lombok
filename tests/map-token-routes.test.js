import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = [
  ['Indonesian home', '../src/routes/+page.server.js'],
  ['localized home', '../src/routes/[lang]/+page.server.js'],
  ['localized travel page', '../src/routes/[lang]/travel-lombok/+page.server.js']
];

for (const [name, path] of routes) {
  test(`${name} passes the public Mapbox token to the planner`, () => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /mapboxToken:\s*process\.env\.PUBLIC_MAPBOX_TOKEN\s*\|\|\s*''/);
  });
}

test('the shared home page forwards the token to the pickup calculator', () => {
  const source = readFileSync(new URL('../src/routes/+page.svelte', import.meta.url), 'utf8');
  assert.match(source, /<LazyPickupCalculator[^>]*mapboxToken=\{data\.mapboxToken\}/);
});
