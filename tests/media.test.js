import test from 'node:test';
import assert from 'node:assert/strict';
import { collectStorageIds, deleteRemovedMedia, removedStorageIds, storageIdFromUrl, storageIdsInText } from '../convex/media.js';

const storage = (id) => `https://example.convex.cloud/api/storage/${id}`;

test('extracts Convex storage IDs from storage URLs', () => {
  assert.equal(storageIdFromUrl(storage('abc_123-XYZ')), 'abc_123-XYZ');
  assert.equal(storageIdFromUrl(`${storage('abc')}?download=1`), 'abc');
  assert.equal(storageIdFromUrl(`${storage('abc')}#preview`), 'abc');
  assert.equal(storageIdFromUrl('https://commons.wikimedia.org/wiki/File:Example.jpg'), null);
  assert.equal(storageIdFromUrl('http://example.convex.cloud/api/storage/abc'), null);
  assert.equal(storageIdFromUrl(`${storage('abc')}/extra`), null);
  assert.equal(storageIdFromUrl(null), null);
});

test('collects storage IDs from exact URLs and rich text', () => {
  assert.deepEqual(storageIdsInText(`<p><a href="${storage('inline')}">Open</a></p>`), ['inline']);
  assert.deepEqual(storageIdsInText(`<p>${storage('one')} and ${storage('two')}?download=1</p>`), ['one', 'two']);
  assert.deepEqual(storageIdsInText(`<a href="${storage('abc')}/extra">Invalid</a>`), []);

  const catalog = {
    packages: [
      { image: storage('one'), images: [storage('two'), storage('one')] },
      { image: 'https://commons.wikimedia.org/wiki/File:Example.jpg', images: [] }
    ],
    settings: { heroImage: storage('three'), about: `<p><a href="${storage('four')}">Open</a></p>` }
  };

  assert.deepEqual([...collectStorageIds(catalog)].sort(), ['four', 'one', 'three', 'two']);
});

test('returns only storage IDs removed from the saved catalog', () => {
  const previous = {
    packages: [
      { image: storage('keep'), images: [storage('remove'), storage('shared')] },
      { image: storage('also-keep'), images: [] }
    ],
    settings: { heroImage: storage('delete-hero') }
  };
  const next = {
    packages: [
      { image: storage('keep'), images: [storage('shared')] },
      { image: storage('also-keep'), images: [] }
    ],
    settings: { heroImage: '' }
  };

  assert.deepEqual(removedStorageIds(previous, next), ['remove', 'delete-hero']);
  assert.deepEqual(removedStorageIds(null, next), []);
  assert.deepEqual(removedStorageIds(previous, previous), []);
});

test('keeps a storage ID that still appears in rich text and deletes one that was removed', () => {
  const previous = { settings: { about: `<p><a href="${storage('inline')}">Inline file</a></p>` } };
  const kept = { settings: { about: `<p><a href="${storage('inline')}">Inline file</a></p>` } };
  const removed = { settings: { about: '<p>Link removed</p>' } };

  assert.deepEqual(removedStorageIds(previous, kept), []);
  assert.deepEqual(removedStorageIds(previous, removed), ['inline']);
});

test('deletes removed media and tolerates a storage deletion failure', async () => {
  const deleted = [];
  const ctx = {
    storage: {
      async delete(storageId) {
        deleted.push(storageId);
        if (storageId === 'broken') throw new Error('not found');
      }
    }
  };
  const previous = { image: storage('gone'), gallery: [storage('broken'), storage('kept')] };
  const next = { image: '', gallery: [storage('kept')] };

  assert.equal(await deleteRemovedMedia(ctx, previous, next), 1);
  assert.deepEqual(deleted, ['gone', 'broken']);
});
