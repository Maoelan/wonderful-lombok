import test from 'node:test';
import assert from 'node:assert/strict';
import { readCatalogState, saveCatalog } from '../convex/catalogStore.js';

function fakeContext(initial) {
  const state = { catalog: initial ? [{ ...structuredClone(initial), _id: 'catalog-1' }] : [] };
  return {
    state,
    db: {
      query(table) {
        assert.equal(table, 'catalog');
        return {
          withIndex(name, buildRange) {
            assert.equal(name, 'by_key');
            const filter = buildRange({ eq: (field, value) => ({ field, value }) });
            return {
              unique: async () => state.catalog.find((item) => item[filter.field] === filter.value) || null
            };
          }
        };
      },
      async insert(table, document) {
        assert.equal(table, 'catalog');
        state.catalog.push({ ...structuredClone(document), _id: 'catalog-1' });
      },
      async patch(id, document) {
        const item = state.catalog.find((row) => row._id === id);
        Object.assign(item, structuredClone(document));
      }
    }
  };
}

test('reads an empty catalog as revision zero', async () => {
  const ctx = fakeContext();
  assert.deepEqual(await readCatalogState(ctx), { data: null, revision: 0 });
});

test('creates the first catalog at revision one', async () => {
  const ctx = fakeContext();
  const data = { packages: [{ slug: 'first' }] };

  assert.deepEqual(await saveCatalog(ctx, { data, expectedRevision: 0, now: 100 }), { ok: true, revision: 1 });
  assert.deepEqual(ctx.state.catalog, [{ _id: 'catalog-1', key: 'main', data, updatedAt: 100, revision: 1 }]);
});

test('saves over the current revision and increments it', async () => {
  const ctx = fakeContext({ key: 'main', data: { packages: [{ slug: 'old' }] }, updatedAt: 10, revision: 4 });
  const data = { packages: [{ slug: 'new' }] };

  assert.deepEqual(await saveCatalog(ctx, { data, expectedRevision: 4, now: 200 }), { ok: true, revision: 5 });
  assert.equal(ctx.state.catalog[0].revision, 5);
  assert.equal(ctx.state.catalog[0].updatedAt, 200);
  assert.deepEqual(ctx.state.catalog[0].data, data);
});

test('only the first of two saves from the same revision wins', async () => {
  const ctx = fakeContext({ key: 'main', data: { packages: [] }, updatedAt: 10, revision: 1 });
  const firstData = { packages: [{ slug: 'first-writer' }] };
  const secondData = { packages: [{ slug: 'second-writer' }] };

  assert.deepEqual(await saveCatalog(ctx, { data: firstData, expectedRevision: 1, now: 100 }), { ok: true, revision: 2 });
  assert.deepEqual(await saveCatalog(ctx, { data: secondData, expectedRevision: 1, now: 200 }), {
    ok: false,
    conflict: true,
    revision: 2
  });
  assert.deepEqual(ctx.state.catalog[0].data, firstData);
  assert.equal(ctx.state.catalog[0].revision, 2);
});

test('rejects a stale save without changing the catalog', async () => {
  const original = { key: 'main', data: { packages: [{ slug: 'current' }] }, updatedAt: 10, revision: 2 };
  const ctx = fakeContext(original);

  assert.deepEqual(await saveCatalog(ctx, { data: { packages: [{ slug: 'stale' }] }, expectedRevision: 1, now: 200 }), {
    ok: false,
    conflict: true,
    revision: 2
  });
  assert.deepEqual(ctx.state.catalog[0].data, original.data);
  assert.equal(ctx.state.catalog[0].updatedAt, 10);
  assert.equal(ctx.state.catalog[0].revision, 2);
});

test('treats a legacy catalog without a revision as revision zero', async () => {
  const ctx = fakeContext({ key: 'main', data: { packages: [] }, updatedAt: 10 });
  assert.deepEqual(await readCatalogState(ctx), { data: { packages: [] }, revision: 0 });

  assert.deepEqual(await saveCatalog(ctx, { data: { packages: [{ slug: 'upgraded' }] }, expectedRevision: 0, now: 200 }), { ok: true, revision: 1 });
  assert.equal(ctx.state.catalog[0].revision, 1);
});

test('does not insert when the expected revision is stale for a missing catalog', async () => {
  const ctx = fakeContext();
  assert.deepEqual(await saveCatalog(ctx, { data: { packages: [] }, expectedRevision: 1, now: 200 }), {
    ok: false,
    conflict: true,
    revision: 0
  });
  assert.equal(ctx.state.catalog.length, 0);
});

test('rejects invalid revisions before touching the catalog', async () => {
  const ctx = fakeContext({ key: 'main', data: { packages: [] }, updatedAt: 10, revision: 1 });

  await assert.rejects(() => saveCatalog(ctx, { data: { packages: [] }, expectedRevision: -1 }), /Revisi katalog/);
  await assert.rejects(() => saveCatalog(ctx, { data: { packages: [] }, expectedRevision: 1.5 }), /Revisi katalog/);
  assert.equal(ctx.state.catalog[0].revision, 1);
});
