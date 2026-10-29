import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  MIN_TRANSFER_DISTANCE_LABEL,
  MIN_TRANSFER_DISTANCE_METRES,
  isBookableTransferDistance,
  transferDistanceLabel
} from '../src/lib/travel-rules.js';

test('the minimum transfer distance uses the 1000 m boundary', () => {
  assert.equal(MIN_TRANSFER_DISTANCE_METRES, 1000);
  assert.equal(isBookableTransferDistance(150), false);
  assert.equal(isBookableTransferDistance(999), false);
  assert.equal(isBookableTransferDistance(1000), true);
  assert.equal(isBookableTransferDistance(1001), true);
  assert.equal(isBookableTransferDistance(Number.NaN), false);
});

test('the minimum distance label stays locale-neutral', () => {
  assert.equal(MIN_TRANSFER_DISTANCE_LABEL, '1 km');
  assert.equal(transferDistanceLabel(750), '750 m');
  assert.equal(transferDistanceLabel(1500), '1.5 km');
});

test('the calculator prevents a short route from reaching the booking or WhatsApp handoff', () => {
  const source = readFileSync(new URL('../src/lib/PickupCalculator.svelte', import.meta.url), 'utf8');
  assert.match(source, /isBookableTransferDistance/);
  assert.match(source, /routeShort = error\.code === 'route_too_short'/);
  const shortGuard = source.indexOf('if (routeShort)');
  const bookingCall = source.indexOf("fetch('/api/bookings'");
  const whatsappHandoff = source.indexOf('createWhatsAppUrl(whatsappMessage');
  assert.ok(shortGuard > -1, 'short-route guard');
  assert.ok(bookingCall > shortGuard, 'booking call must come after the short-route guard');
  assert.ok(whatsappHandoff > shortGuard, 'WhatsApp handoff must come after the short-route guard');
});
