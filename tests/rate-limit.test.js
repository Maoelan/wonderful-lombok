import test from 'node:test';
import assert from 'node:assert/strict';
import { clearRateLimits, consumeRateLimit, RATE_LIMIT_MAX_BUCKETS, rateLimit } from '../src/lib/server/rate-limit.js';

test('rate limit allows up to the limit and then returns a retry hint', () => {
  clearRateLimits();
  const now = 1_700_000_000_000;
  assert.equal(consumeRateLimit('login:203.0.113.9', 2, 60_000, now).allowed, true);
  assert.equal(consumeRateLimit('login:203.0.113.9', 2, 60_000, now).allowed, true);

  const blocked = consumeRateLimit('login:203.0.113.9', 2, 60_000, now);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 60);

  assert.equal(consumeRateLimit('login:203.0.113.9', 2, 60_000, now + 60_001).allowed, true);
});

test('rate limit keeps buckets independent', () => {
  clearRateLimits();
  const now = 1_700_000_000_000;
  assert.equal(consumeRateLimit('geocode:one', 1, 60_000, now).allowed, true);
  assert.equal(consumeRateLimit('geocode:one', 1, 60_000, now).allowed, false);
  assert.equal(consumeRateLimit('geocode:two', 1, 60_000, now).allowed, true);
});

test('rateLimit keeps the boolean compatibility wrapper', () => {
  clearRateLimits();
  assert.equal(rateLimit('route:one', 1, 60_000, 1), true);
  assert.equal(rateLimit('route:one', 1, 60_000, 1), false);
});

test('a full table rejects new keys instead of evicting active buckets', () => {
  clearRateLimits();
  for (let index = 0; index < RATE_LIMIT_MAX_BUCKETS; index += 1) {
    assert.equal(consumeRateLimit(`fill:${index}`, 5, 60_000, 1).allowed, true);
  }

  assert.equal(consumeRateLimit('fill:0', 5, 60_000, 1).allowed, true);
  const blocked = consumeRateLimit('fresh:key', 1, 60_000, 1);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'capacity');

  assert.equal(consumeRateLimit('fresh:key', 1, 60_000, 60_002).allowed, true);
});
