import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('dialog close buttons center a drawn icon instead of an offset glyph', () => {
  for (const path of ['../src/lib/BookingDialog.svelte', '../src/lib/DetailDialog.svelte']) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const button = source.match(/<button class="booking-close"[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? '';
    assert.match(button, /<svg viewBox="0 0 24 24"/, path);
    assert.doesNotMatch(button, /×/, path);
  }

  const css = readFileSync(new URL('../src/app.css', import.meta.url), 'utf8');
  assert.match(css, /\.booking-close \{[^}]*display: grid;[^}]*place-items: center;[^}]*padding: 0;/);
  assert.match(css, /\.booking-close svg \{[^}]*width: 20px;[^}]*height: 20px;/);
});
