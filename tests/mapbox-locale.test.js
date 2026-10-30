import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languages} from '../src/lib/i18n.js';
import {getMapboxLocale} from '../src/lib/maps/mapbox-locale.js';

test('all supported map locales translate gesture instructions and control names', () => {
  const english = getMapboxLocale('en');
  const declarations = readFileSync(new URL('../node_modules/mapbox-gl/dist/mapbox-gl.d.ts', import.meta.url), 'utf8');
  for (const key of Object.keys(english)) assert.ok(declarations.includes(`'${key}': string;`), key);
  for (const {code} of languages) {
    const copy = getMapboxLocale(code);
    assert.deepEqual(Object.keys(copy), Object.keys(english));
    for (const [key, value] of Object.entries(copy)) {
      assert.ok(value, `${code}.${key}`);
      if (code !== 'en') assert.notEqual(value, english[key], `${code}.${key}`);
    }
  }
  assert.deepEqual(getMapboxLocale('unknown'), english);
  assert.equal(getMapboxLocale('id')['TouchPanBlocker.Message'], 'Gunakan dua jari untuk menggeser peta');
});

test('map constructor receives localized controls separately from map label language', () => {
  const source = readFileSync(new URL('../src/lib/maps/mapbox.js', import.meta.url), 'utf8');
  assert.match(source, /locale: getMapboxLocale\(locale\)/);
  assert.match(source, /map\.setLanguage\(mapboxLanguage\(locale\)\)/);
});
