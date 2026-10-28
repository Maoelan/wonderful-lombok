import test from 'node:test';
import assert from 'node:assert/strict';
import { removeBooking, updateBookingStatus } from '../convex/bookingData.js';

function fakeContext(bookings, requests = {}) {
  const deleted = [];
  const patched = [];
  return {
    deleted,
    patched,
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
      },
      async patch(id, values) {
        patched.push({ id, ...values });
      }
    }
  };
}

test('updates the status only when the booking exists', async () => {
  const ctx = fakeContext({ 'booking-1': { _id: 'booking-1', status: 'baru' } });

  assert.equal(await updateBookingStatus(ctx, 'booking-1', 'selesai', 123), true);
  assert.deepEqual(ctx.patched, [{ id: 'booking-1', status: 'selesai', updatedAt: 123 }]);
  assert.equal(await updateBookingStatus(ctx, 'missing', 'selesai', 456), false);
  assert.equal(ctx.patched.length, 1);
});

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
