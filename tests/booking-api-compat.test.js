import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bookings = readFileSync(new URL('../convex/bookings.js', import.meta.url), 'utf8');
const db = readFileSync(new URL('../src/lib/server/db.js', import.meta.url), 'utf8');

test('legacy booking queries stay deployed for the production site', () => {
  for (const name of ['create', 'list', 'exportList', 'setStatus', 'remove']) {
    assert.match(bookings, new RegExp(`export const ${name} = (query|mutation)\\(`), `missing legacy export ${name}`);
  }
});

test('legacy create keeps returning a plain booking code', () => {
  assert.match(bookings, /rejectConflicts: false/);
  assert.match(bookings, /const \{ code \} = await createIdempotentBooking\([^;]+\);\s*return code;/s);
});

test('paginated booking API coexists with the legacy API', () => {
  for (const name of ['listPage', 'exportPage', 'createChecked']) {
    assert.match(bookings, new RegExp(`export const ${name} = (query|mutation)\\(`), `missing paginated export ${name}`);
  }
  assert.match(db, /convexMutation\('bookings:createChecked'/);
});
