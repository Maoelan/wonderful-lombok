import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePickupPrice, coordinateDistanceMetres, formatPlaceSearchName, hasStableGpsFix, isInsideLombok, isUsableGpsFix, localizedPlaces, placeSearchQueries, readPlaceSearchResults, readRoadRoute } from '../src/lib/pickup.js';
import { createWhatsAppUrl, formatWhatsAppNumber } from '../src/lib/whatsapp.js';

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
    { display_name: 'Aikmual, Lombok Tengah', address: { village: 'Aikmual', county: 'Lombok Tengah', state: 'Nusa Tenggara Barat', country: 'Indonesia' }, lat: '-8.6621668', lon: '116.2855197' },
    { display_name: 'Denpasar, Bali', lat: '-8.65', lon: '115.22' }
  ], 'en'), [{ name: 'Aikmual, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.6621668, lng: 116.2855197 }]);
});

test('search address administrative terms follow the active language', () => {
  const mataram = {
    addresstype: 'city', namedetails: { name: 'Mataram', 'name:zh': '马塔兰' },
    address: { city: 'Mataram', county: 'Kec. Selaparang', state: 'West Nusa Tenggara', country: 'Indonesia' }
  };
  const masMas = {
    addresstype: 'village', namedetails: { name: 'Mas-Mas' },
    address: { village: 'Mas-Mas', county: 'Lombok Tengah', state: 'West Nusa Tenggara', postcode: '83553', country: 'Indonesia' }
  };
  assert.equal(formatPlaceSearchName(mataram, 'en'), 'Mataram, Selaparang District, West Nusa Tenggara, Indonesia');
  assert.equal(formatPlaceSearchName(mataram, 'zh-cn'), '马塔兰, Selaparang区, 西努沙登加拉省, 印度尼西亚');
  assert.equal(formatPlaceSearchName(mataram, 'zh-tw'), 'Mataram, Selaparang區, 西努沙登加拉省, 印度尼西亞');
  const expectedMasMas = {
    id: 'Mas-Mas, Kabupaten Lombok Tengah, Nusa Tenggara Barat, 83553, Indonesia',
    en: 'Mas-Mas, Central Lombok Regency, West Nusa Tenggara, 83553, Indonesia',
    'zh-cn': 'Mas-Mas, 中龙目县, 西努沙登加拉省, 83553, 印度尼西亚',
    'zh-tw': 'Mas-Mas, 中龍目縣, 西努沙登加拉省, 83553, 印度尼西亞',
    nl: 'Mas-Mas, regentschap Centraal-Lombok, West-Nusa Tenggara, 83553, Indonesië',
    fr: 'Mas-Mas, régence de Lombok central, Petites îles de la Sonde occidentales, 83553, Indonésie',
    de: 'Mas-Mas, Regierungsbezirk Zentral-Lombok, West-Nusa Tenggara, 83553, Indonesien',
    ms: 'Mas-Mas, Daerah Lombok Tengah, Nusa Tenggara Barat, 83553, Indonesia'
  };
  for (const [locale, expected] of Object.entries(expectedMasMas)) {
    assert.equal(formatPlaceSearchName(masMas, locale), expected);
  }
});

test('popular Lombok places follow the active interface language', () => {
  assert.equal(localizedPlaces('en').find((place) => place.id === 'airport').name, 'Lombok International Airport');
  assert.equal(localizedPlaces('fr').find((place) => place.id === 'bangsal').name, 'Port de Bangsal');
  assert.equal(localizedPlaces('id').find((place) => place.id === 'airport').name, 'Bandara Internasional Lombok');
});

test('road route uses the localized not-found message', () => {
  assert.throws(() => readRoadRoute({}, 'No road route was found.'), /No road route was found/);
});

test('WhatsApp link targets the configured business number and encodes its message', () => {
  const url = createWhatsAppUrl('Paket wisata & penjemputan');
  assert.match(url, /^https:\/\/wa\.me\/6281916550731\?text=/);
  assert.ok(url.includes('%26'));
  assert.match(createWhatsAppUrl('Halo', '62 812-3456-7890'), /^https:\/\/wa\.me\/6281234567890\?text=Halo$/);
});

test('WhatsApp display numbers use readable international grouping', () => {
  assert.equal(formatWhatsAppNumber('6287873026445'), '+62 878-7302-6445');
  assert.equal(formatWhatsAppNumber('+62 812-3456-7890'), '+62 812-3456-7890');
  assert.equal(formatWhatsAppNumber('0812 3456 7890'), '+62 812-3456-7890');
  assert.equal(formatWhatsAppNumber(''), '');
});
