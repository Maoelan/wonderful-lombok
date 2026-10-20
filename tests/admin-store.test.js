import test from 'node:test';
import assert from 'node:assert/strict';
import { findSessionUser, removeAdmin, upsertAdmin } from '../convex/adminStore.js';

function fakeContext() {
  const state = {
    admins: [],
    sessions: []
  };

  return {
    state,
    db: {
      query(table) {
        return {
          withIndex(name, buildRange) {
            assert.equal(typeof name, 'string');
            const filter = buildRange({ eq: (field, value) => ({ field, value }) });
            const rows = () => state[table].filter((item) => item[filter.field] === filter.value);
            return {
              unique: async () => rows()[0] || null,
              collect: async () => rows()
            };
          }
        };
      },
      async insert(table, document) {
        const id = `${table}-${state[table].length + 1}`;
        state[table].push({ ...structuredClone(document), _id: id });
        return id;
      },
      async patch(id, document) {
        const item = state.admins.find((admin) => admin._id === id);
        Object.assign(item, structuredClone(document));
      },
      async get(id) {
        return state.admins.find((admin) => admin._id === id) || null;
      },
      async delete(id) {
        state.admins = state.admins.filter((admin) => admin._id !== id);
        state.sessions = state.sessions.filter((session) => session._id !== id);
      }
    }
  };
}

test('updating an admin password invalidates all sessions for that admin', async () => {
  const ctx = fakeContext();
  ctx.state.admins.push({ _id: 'admins-1', username: 'owner', passwordHash: 'old-hash' });
  ctx.state.sessions.push(
    { _id: 'sessions-1', adminId: 'admins-1' },
    { _id: 'sessions-2', adminId: 'admins-1' },
    { _id: 'sessions-3', adminId: 'admins-2' }
  );

  const result = await upsertAdmin(ctx, { username: 'owner', passwordHash: 'new-hash', now: 42 });

  assert.deepEqual(result, { id: 'admins-1', created: false, invalidatedSessions: 2 });
  assert.equal(ctx.state.admins[0].passwordHash, 'new-hash');
  assert.equal(ctx.state.admins[0].updatedAt, 42);
  assert.deepEqual(ctx.state.sessions.map((session) => session._id), ['sessions-3']);
});

test('creating an admin does not invalidate unrelated sessions', async () => {
  const ctx = fakeContext();
  ctx.state.sessions.push({ _id: 'sessions-1', adminId: 'admins-1' });

  const result = await upsertAdmin(ctx, { username: 'new-owner', passwordHash: 'hash', now: 7 });

  assert.deepEqual(result, { id: 'admins-1', created: true, invalidatedSessions: 0 });
  assert.equal(ctx.state.sessions.length, 1);
});

test('removing an admin deletes the account and its sessions', async () => {
  const ctx = fakeContext();
  ctx.state.admins.push({ _id: 'admins-1', username: 'owner' }, { _id: 'admins-2', username: 'other' });
  ctx.state.sessions.push(
    { _id: 'sessions-1', adminId: 'admins-1' },
    { _id: 'sessions-2', adminId: 'admins-2' }
  );

  const result = await removeAdmin(ctx, { username: 'owner' });

  assert.deepEqual(result, { removed: true, invalidatedSessions: 1 });
  assert.deepEqual(ctx.state.admins.map((admin) => admin.username), ['other']);
  assert.deepEqual(ctx.state.sessions.map((session) => session._id), ['sessions-2']);
});

test('removing a missing admin reports no change', async () => {
  const ctx = fakeContext();
  assert.deepEqual(await removeAdmin(ctx, { username: 'missing' }), { removed: false, invalidatedSessions: 0 });
});

test('session lookup rejects expired sessions and deleted admins', async () => {
  const ctx = fakeContext();
  ctx.state.admins.push({ _id: 'admins-1', username: 'owner' });
  ctx.state.sessions.push(
    { _id: 'sessions-1', adminId: 'admins-1', tokenHash: 'valid', expiresAt: 2_000 },
    { _id: 'sessions-2', adminId: 'admins-1', tokenHash: 'expired', expiresAt: 1_000 },
    { _id: 'sessions-3', adminId: 'admins-missing', tokenHash: 'orphaned', expiresAt: 2_000 }
  );

  assert.deepEqual(await findSessionUser(ctx, { tokenHash: 'valid', now: 1_500 }), { id: 'admins-1', username: 'owner' });
  assert.equal(await findSessionUser(ctx, { tokenHash: 'valid', now: 2_000 }), null);
  assert.equal(await findSessionUser(ctx, { tokenHash: 'expired', now: 1_500 }), null);
  assert.equal(await findSessionUser(ctx, { tokenHash: 'orphaned', now: 1_500 }), null);
  assert.equal(await findSessionUser(ctx, { tokenHash: 'missing', now: 1_500 }), null);
});
