import test from 'node:test';
import assert from 'node:assert/strict';
import { removeBooking } from '../convex/bookingData.js';

function fakeContext(bookings, requests = {}) {
  const deleted = [];
  return {
    deleted,
    db: {
      async get(id) {
        return bookings[id] ?? null;
      },
      query(table) {
        return {
          withIndex(_name, build) {
            let key;
            build({ eq: (_field, value) => { key = value; return { value }; } });
            return {
              async first() {
                if (table !== 'bookingRequests') return null;
                return requests[key] ?? null;
              }
            };
          }
        };
      },
      async delete(id) {
        deleted.push(id);
      }
    }
  };
}

test('removes a booking and its idempotency record', async () => {
  const ctx = fakeContext({ 'booking-1': { _id: 'booking-1', idempotencyKey: 'key-1' } }, { 'key-1': { _id: 'request-1' } });

  assert.equal(await removeBooking(ctx, 'booking-1'), true);
  assert.deepEqual(ctx.deleted, ['request-1', 'booking-1']);
});

test('removes a booking without an idempotency record', async () => {
  const ctx = fakeContext({ 'booking-2': { _id: 'booking-2' } });

  assert.equal(await removeBooking(ctx, 'booking-2'), true);
  assert.deepEqual(ctx.deleted, ['booking-2']);
});

test('returns false for a missing booking', async () => {
  const ctx = fakeContext({});

  assert.equal(await removeBooking(ctx, 'missing'), false);
  assert.deepEqual(ctx.deleted, []);
});
