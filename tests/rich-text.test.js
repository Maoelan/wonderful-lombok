import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCatalogRichText, sanitizeRichText } from '../src/lib/server/rich-text.js';

test('rich text keeps editor formatting and removes executable content', () => {
  const clean = sanitizeRichText('<h3>Judul</h3><p><strong>Tebal</strong></p><table><tr><td>Isi</td></tr></table><img src=x onerror=alert(1)><script>alert(1)</script><a href="javascript:alert(1)">buruk</a>');
  assert.match(clean, /<strong>Tebal<\/strong>/);
  assert.match(clean, /<table>/);
  assert.doesNotMatch(clean, /script|onerror|javascript:/i);
});

test('catalog sanitizer also cleans fallback rich text fields', () => {
  const clean = sanitizeCatalogRichText({
    packages: [{ detail: '<p>Aman</p>', detailEn: '<img src=x onerror=alert(1)><p>Safe</p>' }],
    destinations: [], rentals: [], faqs: [{ answer: 'Aman', answerEn: '<script>alert(1)</script><b>Safe</b>' }],
    settings: { heroDescription: 'Aman', heroDescriptionEn: '<a href="javascript:alert(1)">Bad</a>', aboutDescription: 'Aman', aboutDescriptionEn: '<em>Safe</em>' }
  });
  assert.doesNotMatch(JSON.stringify(clean), /<script|onerror|javascript:/i);
  assert.match(clean.packages[0].detailEn, /<p>Safe<\/p>/);
  assert.match(clean.faqs[0].answerEn, /<b>Safe<\/b>/);
});
