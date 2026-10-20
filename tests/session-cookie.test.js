import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_TTL_SECONDS, sessionCookieClearOptions, sessionCookieName, sessionCookieOptions } from '../src/lib/server/session-cookie.js';

test('production admin session uses the __Host- prefix and strict flags', () => {
  assert.equal(sessionCookieName(true), '__Host-wl_admin_session');
  const options = sessionCookieOptions(true);
  assert.equal(options.path, '/');
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'strict');
  assert.equal(options.secure, true);
  assert.equal(options.maxAge, SESSION_TTL_SECONDS);
  assert.equal(Object.hasOwn(options, 'domain'), false);
});

test('session clearing keeps the same name and strict flags', () => {
  const options = sessionCookieClearOptions(true);
  assert.equal(options.path, '/');
  assert.equal(options.sameSite, 'strict');
  assert.equal(options.secure, true);
  assert.equal(Object.hasOwn(options, 'domain'), false);
});

test('development session uses a host-compatible name without Secure', () => {
  assert.equal(sessionCookieName(false), 'wl_admin_session');
  assert.equal(sessionCookieOptions(false).secure, false);
  assert.equal(sessionCookieClearOptions(false).secure, false);
});
