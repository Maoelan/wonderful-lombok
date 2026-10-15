import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePickupPrice, coordinateDistanceMetres, hasStableGpsFix, isInsideLombok, isUsableGpsFix, placeSearchQueries, readPlaceSearchResults, readRoadRoute } from '../src/lib/pickup.js';
import { createWhatsAppUrl } from '../src/lib/whatsapp.js';

test('pickup price bills each started kilometer at Rp10.000', () => {
  assert.equal(calculatePickupPrice(8.2), 90_000);
  assert.equal(calculatePickupPrice(0), 0);
});

test('road route uses routed distance, snap distance, and Leaflet coordinates', () => {
  const route = readRoadRoute({ routes: [{ distance: 12_100, geometry: { coordinates: [[116.1, -8.5], [116.2, -8.6]] } }], waypoints: [{ distance: 8 }, { distance: 16 }] });
  assert.equal(route.distanceKm, 13);
  assert.deepEqual(route.points, [[-8.5, 116.1], [-8.6, 116.2]]);
  assert.equal(route.snapDistanceM, 16);
});

test('GPS fixes must be fresh, accurate, inside Lombok, and stable', () => {
  const now = Date.now();
  const first = { lat: -8.5833, lng: 116.1167, accuracy: 12, timestamp: now - 1_000 };
  const second = { lat: -8.58331, lng: 116.11671, accuracy: 10, timestamp: now };
  assert.equal(isUsableGpsFix(first, { now }), true);
  assert.equal(hasStableGpsFix([first, second]), true);
  assert.ok(coordinateDistanceMetres(first, second) < 2);
  assert.equal(isUsableGpsFix({ ...first, accuracy: 90 }, { now }), false);
  assert.equal(isUsableGpsFix({ ...first, timestamp: now - 30_000 }, { now }), false);
});

test('location bounds accept Lombok and reject other islands', () => {
  assert.equal(isInsideLombok(-8.5833, 116.1167), true);
  assert.equal(isInsideLombok(-8.65, 115.22), false);
  assert.equal(isInsideLombok(-8.55, 117.42), false);
});

test('place search retries joined village names and keeps only Lombok results', () => {
  assert.deepEqual(placeSearchQueries('  Aik   Mual  '), ['Aik Mual', 'AikMual']);
  assert.deepEqual(readPlaceSearchResults([
    { display_name: 'Aikmual, Lombok Tengah', lat: '-8.6621668', lon: '116.2855197' },
    { display_name: 'Denpasar, Bali', lat: '-8.65', lon: '115.22' }
  ]), [{ name: 'Aikmual, Lombok Tengah', lat: -8.6621668, lng: 116.2855197 }]);
});

test('WhatsApp link targets the configured business number and encodes its message', () => {
  const url = createWhatsAppUrl('Paket wisata & penjemputan');
  assert.match(url, /^https:\/\/wa\.me\/6281916550731\?text=/);
  assert.ok(url.includes('%26'));
  assert.match(createWhatsAppUrl('Halo', '62 812-3456-7890'), /^https:\/\/wa\.me\/6281234567890\?text=Halo$/);
});
