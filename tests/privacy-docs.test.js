import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const privacy = readFileSync(new URL('../PRIVACY.md', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('privacy inventory documents booking and location data', () => {
  for (const term of ['customer name', 'WhatsApp number', 'origin and destination coordinates', 'GPS accuracy', 'road-routing provider', 'admin users']) {
    assert.match(privacy, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), term);
  }
});

test('privacy inventory records retention, export, and deletion procedures', () => {
  for (const term of ['12 months after the travel date', 'GET /api/admin/bookings/export', 'DELETE /api/admin/bookings/<id>', 'no-store', 'idempotency record']) {
    assert.match(privacy, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), term);
  }
  assert.match(readme, /\[PRIVACY\.md\]\(PRIVACY\.md\)/);
});
