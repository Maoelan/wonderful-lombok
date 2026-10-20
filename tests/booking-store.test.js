import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdempotentBooking, defaultBookingCode } from '../convex/bookingStore.js';

function fakeContext() {
  const state = { bookings: [], bookingRequests: [] };
  return {
    state,
    db: {
      query(table) {
        assert.equal(table, 'bookingRequests');
        return {
          withIndex(name, buildRange) {
            assert.equal(name, 'by_key');
            const filter = buildRange({ eq: (field, value) => ({ field, value }) });
            return {
              first: async () => state.bookingRequests.find((item) => item[filter.field] === filter.value) || null
            };
          }
        };
      },
      async insert(table, document) {
        state[table].push(structuredClone(document));
      }
    }
  };
}

const data = { serviceType: 'travel', customerName: 'Siti', details: { distanceKm: 13 } };

test('idempotent booking creation returns the existing code for a duplicate key', async () => {
  const ctx = fakeContext();
  let sequence = 0;
  const generateCode = () => `WL-TEST-${++sequence}`;

  const first = await createIdempotentBooking(ctx, { idempotencyKey: 'key-1234567890', data, now: 1, generateCode });
  const second = await createIdempotentBooking(ctx, { idempotencyKey: 'key-1234567890', data, now: 2, generateCode });

  assert.equal(first, 'WL-TEST-1');
  assert.equal(second, 'WL-TEST-1');
  assert.equal(ctx.state.bookings.length, 1);
  assert.equal(ctx.state.bookingRequests.length, 1);
});

test('different idempotency keys create different bookings', async () => {
  const ctx = fakeContext();
  let sequence = 0;
  const generateCode = () => `WL-TEST-${++sequence}`;

  await createIdempotentBooking(ctx, { idempotencyKey: 'key-1234567890', data, now: 1, generateCode });
  await createIdempotentBooking(ctx, { idempotencyKey: 'key-0987654321', data, now: 2, generateCode });

  assert.equal(ctx.state.bookings.length, 2);
  assert.deepEqual(ctx.state.bookingRequests.map((item) => item.code), ['WL-TEST-1', 'WL-TEST-2']);
});

test('default booking code is non-empty and request scoped', () => {
  const code = defaultBookingCode(1_700_000_000_000);
  assert.match(code, /^WL-[A-Z0-9]+-[A-Z0-9]{6}$/);
});
