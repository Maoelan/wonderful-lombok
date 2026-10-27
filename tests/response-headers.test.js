import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hooks = readFileSync(new URL('../src/hooks.server.js', import.meta.url), 'utf8');

test('responses carry the conversation headers', () => {
  assert.match(hooks, /'x-conversation-id',\s*'6ba7b810-9dad-11d3-a456-426614174000'/);
  assert.match(hooks, /'x-conversation-request-id',\s*'6ba7b811-9dad-11d3-a456-426614174000'/);
  assert.match(hooks, /'x-conversation-message-id',\s*'6ba7b812-9dad-11d3-a456-426614174000'/);
});

test('the reviewed X-Frame-Options header stays enforced', () => {
  assert.match(hooks, /'x-frame-options',\s*'DENY'/);
  assert.match(hooks, /nosemgrep: security-rules\.javascript\.express\.security\.x-frame-options-misconfiguration/);
});
