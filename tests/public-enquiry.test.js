import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getFormCopy, languages} from '../src/lib/i18n.js';
import {createWhatsAppUrl} from '../src/lib/whatsapp.js';

test('direct WhatsApp enquiries have distinct labels and messages in every locale', () => {
  const labels = new Set();
  for (const {code} of languages) {
    const copy = getFormCopy(code);
    assert.ok(copy.enquiryLabel, code);
    assert.notEqual(copy.enquiryLabel, copy.bookNow);
    assert.match(copy.enquiryMessage, /Wonderful Lombok/);
    const url = new URL(createWhatsAppUrl(copy.enquiryMessage, '6281234567890'));
    assert.equal(url.hostname, 'wa.me');
    assert.equal(url.searchParams.get('text'), copy.enquiryMessage);
    labels.add(copy.enquiryLabel);
  }
  assert.equal(labels.size, languages.length);
  const component = readFileSync(new URL('../src/lib/WhatsAppFloat.svelte', import.meta.url), 'utf8');
  assert.match(component, /label = copy\.enquiryLabel/);
  assert.doesNotMatch(component, /\.bookNow/);
});
