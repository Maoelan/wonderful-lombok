import test from 'node:test';
import assert from 'node:assert/strict';
import { clientAddressKey } from '../src/lib/server/client-address.js';
import { clearRateLimits, consumeRateLimit } from '../src/lib/server/rate-limit.js';

test('client address keys use the proxy-appended address', () => {
  assert.equal(clientAddressKey('203.0.113.9'), '203.0.113.9');
  assert.equal(clientAddressKey('198.51.100.7, 203.0.113.9'), '203.0.113.9');
  assert.equal(clientAddressKey('evil.example, 203.0.113.9'), '203.0.113.9');
  assert.equal(clientAddressKey('::ffff:203.0.113.9'), '203.0.113.9');
  assert.equal(clientAddressKey('2001:db8::1'), '2001:db8::1');
});

test('client address keys reject spoofed or malformed values', () => {
  assert.equal(clientAddressKey('not-an-ip'), 'unknown');
  assert.equal(clientAddressKey(''), 'unknown');
  assert.equal(clientAddressKey(undefined), 'unknown');
  assert.equal(clientAddressKey('203.0.113.9, evil.example'), 'unknown');
});

test('a spoofed forwarding prefix cannot choose a different rate-limit bucket', () => {
  clearRateLimits();
  assert.equal(consumeRateLimit(`login:${clientAddressKey('198.51.100.7, 203.0.113.9')}`, 1, 60_000, 1).allowed, true);
  assert.equal(consumeRateLimit(`login:${clientAddressKey('192.0.2.44, 203.0.113.9')}`, 1, 60_000, 1).allowed, false);
});
