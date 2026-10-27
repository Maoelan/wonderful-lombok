import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRedirectTarget } from '../src/lib/server/canonical-redirect.js';

const publicSiteUrl = 'https://wonderfullombok.example';

test('canonical redirect keeps the configured origin and path', () => {
  assert.deepEqual(
    canonicalRedirectTarget({ pathname: '/en/paket', search: '?from=test', publicSiteUrl }),
    { origin: publicSiteUrl, location: 'https://wonderfullombok.example/en/paket?from=test' }
  );
  assert.deepEqual(
    canonicalRedirectTarget({ pathname: '/', search: '', publicSiteUrl: `${publicSiteUrl}/` }),
    { origin: publicSiteUrl, location: 'https://wonderfullombok.example/' }
  );
});

test('canonical redirect rejects protocol-relative and backslash paths', () => {
  for (const pathname of ['//evil.example/phish', '/\\evil.example/phish', '/foo\\bar']) {
    assert.deepEqual(canonicalRedirectTarget({ pathname, search: '?x=1', publicSiteUrl }), { invalid: true }, pathname);
  }
});

test('canonical redirect rejects encoded and malformed path escapes', () => {
  for (const pathname of ['/%2F%2Fevil.example/phish', '/%5Cevil.example/phish', '//%', '/%']) {
    assert.deepEqual(canonicalRedirectTarget({ pathname, search: '', publicSiteUrl }), { invalid: true }, pathname);
  }
  assert.deepEqual(canonicalRedirectTarget({ pathname: '/login', search: '?next=%', publicSiteUrl }), { invalid: true });
});

test('canonical redirect ignores invalid canonical origins', () => {
  assert.equal(canonicalRedirectTarget({ pathname: '/', publicSiteUrl: '' }), null);
  assert.equal(canonicalRedirectTarget({ pathname: '/', publicSiteUrl: 'not a url' }), null);
  assert.equal(canonicalRedirectTarget({ pathname: '/', publicSiteUrl: 'javascript:alert(1)' }), null);
});
