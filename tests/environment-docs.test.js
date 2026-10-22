import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const environmentDoc = readFileSync(new URL('../ENVIRONMENT.md', import.meta.url), 'utf8');

test('documents every variable in .env.example', () => {
  const keys = [...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]);

  assert.ok(keys.length > 0, 'expected variables in .env.example');
  for (const key of keys) {
    assert.match(environmentDoc, new RegExp(`\\b${key}\\b`), `${key} must be documented in ENVIRONMENT.md`);
  }
});

test('documents local-only and CI credentials that are not in .env.example', () => {
  for (const key of ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_INITIAL_PASSWORD', 'CONVEX_DEPLOY_KEY', 'VERCEL_TOKEN']) {
    assert.match(environmentDoc, new RegExp(`\\b${key}\\b`), `${key} must be documented in ENVIRONMENT.md`);
  }
});

test('separates browser-visible values from server-only values', () => {
  assert.match(environmentDoc, /Browser-visible by design/);
  assert.match(environmentDoc, /Server-only/);
  assert.match(environmentDoc, /`CONVEX_SERVER_SECRET`/);
  assert.match(environmentDoc, /HttpOnly/);
});
