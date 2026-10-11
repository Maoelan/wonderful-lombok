import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRichText } from '../src/lib/server/rich-text.js';

test('rich text keeps editor formatting and removes executable content', () => {
  const clean = sanitizeRichText('<h3>Judul</h3><p><strong>Tebal</strong></p><table><tr><td>Isi</td></tr></table><img src=x onerror=alert(1)><script>alert(1)</script><a href="javascript:alert(1)">buruk</a>');
  assert.match(clean, /<strong>Tebal<\/strong>/);
  assert.match(clean, /<table>/);
  assert.doesNotMatch(clean, /script|onerror|javascript:/i);
});
