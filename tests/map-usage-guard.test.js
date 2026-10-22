import test from 'node:test';
import assert from 'node:assert/strict';
import { clearRateLimits } from '../src/lib/server/rate-limit.js';
import { MAP_USAGE_POLICY, consumeMapUsage, mapLimitBuckets } from '../src/lib/server/map-usage-guard.js';

test('map limits use hashed client identities and conservative global daily caps', () => {
  const buckets = mapLimitBuckets('geocode', '203.0.113.10', 1_700_000_000_000);
  assert.equal(buckets.length, 4);
  assert.equal(buckets.some(({ key }) => key.includes('203.0.113.10')), false);
  assert.equal(buckets.at(-1).limit, 200);
  assert.equal(MAP_USAGE_POLICY.route.globalPerDay, 200);
});

test('production map usage fails closed when the distributed guard is unavailable', async () => {
  clearRateLimits();
  const result = await consumeMapUsage('route', '203.0.113.11', {
    now: 1_700_000_000_000,
    production: true,
    distributedConsume: async () => { throw new Error('down'); }
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'guard_unavailable');
});

test('production map usage forwards all distributed buckets atomically', async () => {
  clearRateLimits();
  let received;
  const result = await consumeMapUsage('geocode', '203.0.113.12', {
    now: 1_700_000_000_000,
    production: true,
    distributedConsume: async (buckets, now) => {
      received = { buckets, now };
      return { allowed: true, retryAfterSeconds: 0 };
    }
  });
  assert.equal(result.allowed, true);
  assert.equal(received.buckets.length, 4);
  assert.equal(received.now, 1_700_000_000_000);
});
