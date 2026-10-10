import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePickupPrice, isInsideLombok, readRoadRoute } from '../src/lib/pickup.js';
import { createWhatsAppUrl } from '../src/lib/whatsapp.js';

test('pickup price bills each started kilometer at Rp10.000', () => {
  assert.equal(calculatePickupPrice(8.2), 90_000);
  assert.equal(calculatePickupPrice(0), 0);
});

test('road route uses routed distance and converts GeoJSON coordinates for Leaflet', () => {
  const route = readRoadRoute({ routes: [{ distance: 12_100, geometry: { coordinates: [[116.1, -8.5], [116.2, -8.6]] } }] });
  assert.equal(route.distanceKm, 13);
  assert.deepEqual(route.points, [[-8.5, 116.1], [-8.6, 116.2]]);
});

test('location bounds accept Lombok and reject other islands', () => {
  assert.equal(isInsideLombok(-8.5833, 116.1167), true);
  assert.equal(isInsideLombok(-8.65, 115.22), false);
  assert.equal(isInsideLombok(-8.55, 117.42), false);
});

test('WhatsApp link targets the configured business number and encodes its message', () => {
  const url = createWhatsAppUrl('Paket wisata & penjemputan');
  assert.match(url, /^https:\/\/wa\.me\/6281916550731\?text=/);
  assert.ok(url.includes('%26'));
  assert.match(createWhatsAppUrl('Halo', '62 812-3456-7890'), /^https:\/\/wa\.me\/6281234567890\?text=Halo$/);
});
