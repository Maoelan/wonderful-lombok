import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hooks = readFileSync(new URL('../src/hooks.server.js', import.meta.url), 'utf8');

test('the reviewed X-Frame-Options header stays enforced', () => {
  assert.match(hooks, /'x-frame-options',\s*'DENY'/);
  assert.match(hooks, /nosemgrep: security-rules\.javascript\.express\.security\.x-frame-options-misconfiguration/);
});
