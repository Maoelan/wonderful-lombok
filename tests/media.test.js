import test from 'node:test';
import assert from 'node:assert/strict';
import { collectStorageIds, deleteRemovedMedia, removedStorageIds, storageIdFromUrl } from '../convex/media.js';

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

test('collects unique storage IDs from nested catalog strings', () => {
  const catalog = {
    packages: [
      { image: storage('one'), images: [storage('two'), storage('one')] },
      { image: 'https://commons.wikimedia.org/wiki/File:Example.jpg', images: [] }
    ],
    settings: { heroImage: storage('three'), about: '<p>No image here</p>' }
  };

  assert.deepEqual([...collectStorageIds(catalog)].sort(), ['one', 'three', 'two']);
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

test('keeps a storage ID that still appears in rich text', () => {
  const previous = { settings: { about: `<p><img src="${storage('inline')}"></p>` } };
  const next = { settings: { about: `<p>Kept: ${storage('inline')}</p>` } };

  assert.deepEqual(removedStorageIds(previous, next), []);
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
