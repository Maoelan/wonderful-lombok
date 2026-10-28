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
