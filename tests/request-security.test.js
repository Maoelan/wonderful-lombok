import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigins, checkRequestOrigin, isSafeMethod, requiresTrustedOrigin } from '../src/lib/server/request-security.js';

const canonical = 'https://wonderfullombok.example';
const base = (overrides = {}) => ({
  method: 'POST',
  pathname: '/login',
  origin: canonical,
  requestOrigin: canonical,
  publicSiteUrl: canonical,
  production: true,
  ...overrides
});

test('cookie-authenticated mutations require a matching Origin header', () => {
  for (const pathname of ['/login', '/logout', '/admin', '/api/admin/bookings', '/api/admin/bookings/abc', '/api/admin/catalog', '/api/admin/upload']) {
    assert.equal(requiresTrustedOrigin(pathname), true, pathname);
    assert.equal(checkRequestOrigin(base({ pathname })).ok, true, `${pathname} matching origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: null })).reason, 'missing', `${pathname} missing origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: 'null' })).reason, 'malformed', `${pathname} null origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: 'https://evil.example' })).reason, 'untrusted', `${pathname} cross origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: 'https://wonderfullombok.example.evil.example' })).reason, 'untrusted', `${pathname} suffix origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: `${canonical}/` })).reason, 'malformed', `${pathname} path origin`);
    assert.equal(checkRequestOrigin(base({ pathname, origin: 'not a url' })).reason, 'malformed', `${pathname} malformed origin`);
  }

  assert.equal(requiresTrustedOrigin('/api/%61dmin/catalog'), true);
  assert.equal(checkRequestOrigin(base({ pathname: '/api/%61dmin/catalog', origin: null })).reason, 'missing');
});

test('public booking may omit Origin but rejects a supplied untrusted Origin', () => {
  assert.equal(requiresTrustedOrigin('/api/bookings'), false);
  assert.equal(checkRequestOrigin(base({ pathname: '/api/bookings', origin: null })).ok, true);
  assert.equal(checkRequestOrigin(base({ pathname: '/api/bookings', origin: 'https://evil.example' })).reason, 'untrusted');
  assert.equal(checkRequestOrigin(base({ pathname: '/api/bookings' })).ok, true);
});

test('safe methods do not require an Origin header', () => {
  assert.equal(isSafeMethod('GET'), true);
  assert.equal(isSafeMethod('head'), true);
  assert.equal(isSafeMethod('OPTIONS'), true);
  assert.equal(isSafeMethod('POST'), false);
  assert.equal(checkRequestOrigin(base({ method: 'GET', origin: null })).ok, true);
});

test('production trusts only the canonical origin instead of the Host header', () => {
  assert.equal(checkRequestOrigin(base({ requestOrigin: 'https://evil.example', origin: 'https://evil.example' })).reason, 'untrusted');
  assert.deepEqual([...allowedOrigins({ requestOrigin: 'https://evil.example', publicSiteUrl: canonical, production: true })], [canonical]);
});

test('development allows the request origin while the canonical origin is unset', () => {
  const dev = { production: false, publicSiteUrl: undefined, requestOrigin: 'http://localhost:5173', origin: 'http://localhost:5173' };
  assert.equal(checkRequestOrigin(base(dev)).ok, true);
  assert.deepEqual([...allowedOrigins(dev)], ['http://localhost:5173']);
});
