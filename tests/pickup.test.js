import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_TRAVEL_POINTS,
  calculatePickupPrice,
  coordinateDistanceMetres,
  estimateLabel,
  hasStableGpsFix,
  isInsideLombok,
  isUsableGpsFix,
  localizedPlaces,
  mapboxGeocodePlaceSearchUrl,
  mapboxLanguage,
  mapboxPlaceSearchUrl,
  mapboxRouteUrl,
  readMapboxGeocodePlaceResults,
  readMapboxPlaceResults,
  readMapboxRoute,
  travelStopsFromDetails
} from '../src/lib/pickup.js';
import { createWhatsAppUrl, formatWhatsAppNumber } from '../src/lib/whatsapp.js';

const airport = { name: 'Bandara Internasional Lombok', lat: -8.756283, lng: 116.277145 };
const kuta = { name: 'Kuta Mandalika', lat: -8.893241, lng: 116.277504 };
const senggigi = { name: 'Senggigi', lat: -8.493705, lng: 116.044691 };

test('pickup price bills each started kilometer at Rp10.000', () => {
  assert.equal(calculatePickupPrice(8.2), 90_000);
  assert.equal(calculatePickupPrice(0), 0);
});

test('estimate display does not show a zero price before a route is ready or after a route error', () => {
  const format = (value) => `Rp ${value}`;
  const base = { ready: true, price: 130_000, format, calculating: 'Calculating…' };
  assert.equal(estimateLabel({ ...base, loading: true, error: '' }), 'Calculating…');
  assert.equal(estimateLabel({ ...base, loading: false, error: '' }), 'Rp 130000');
  assert.equal(estimateLabel({ ...base, loading: false, error: 'Route not found' }), '—');
  assert.equal(estimateLabel({ ...base, loading: false, error: '', ready: false }), '—');
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

test('land validation accepts Lombok land points and rejects sea points inside the old bounding box', () => {
  assert.equal(isInsideLombok(-8.5833, 116.1167), true); // Mataram
  assert.equal(isInsideLombok(-8.756283, 116.277145), true); // Airport
  assert.equal(isInsideLombok(-8.393852, 116.099492), true); // Bangsal
  assert.equal(isInsideLombok(-8.61646, 115.85837), false); // west of Lombok, inside the old bbox
  assert.equal(isInsideLombok(-8.43819, 115.976), false); // north of Lombok, inside the old bbox
  assert.equal(isInsideLombok(-8.65, 115.22), false); // Bali
  assert.equal(isInsideLombok(-8.55, 117.42), false); // east of Lombok
  assert.equal(isInsideLombok(-8.35, 116.039), false); // Gili Trawangan
});

test('Mapbox place search requests are Lombok-bound and locale-aware', () => {
  const url = new URL(mapboxPlaceSearchUrl('  Kuta  ', 'zh-cn', 'test-mapbox-token'));
  assert.equal(`${url.origin}${url.pathname}`, 'https://api.mapbox.com/search/searchbox/v1/forward');
  assert.equal(url.searchParams.get('q'), 'Kuta');
  assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
  assert.equal(url.searchParams.get('country'), 'id');
  assert.equal(url.searchParams.get('bbox'), '115.78,-9.15,116.82,-8.15');
  assert.equal(url.searchParams.get('proximity'), '116.17,-8.65');
  assert.equal(url.searchParams.get('language'), 'zh-Hans');
  assert.equal(url.searchParams.get('limit'), '8');
  assert.equal(url.searchParams.get('types'), 'poi,address,place,locality,neighborhood,street');

  const fallback = new URL(mapboxGeocodePlaceSearchUrl('  Kuta  ', 'zh-cn', 'test-mapbox-token'));
  assert.equal(`${fallback.origin}${fallback.pathname}`, 'https://api.mapbox.com/geocoding/v5/mapbox.places/Kuta.json');
  assert.equal(fallback.searchParams.get('autocomplete'), 'true');
  assert.equal(fallback.searchParams.get('country'), 'id');
  assert.equal(fallback.searchParams.get('types'), 'poi,address,place,locality,neighborhood');
  assert.equal(mapboxLanguage('zh-tw'), 'zh-Hant');
  assert.equal(mapboxLanguage('unknown'), 'en');
});

test('Mapbox Search Box results use full addresses and drop outside or duplicate places', () => {
  const payload = {
    features: [
      { properties: { mapbox_id: 'mb1', name: 'Kuta', full_address: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia' }, geometry: { coordinates: [116.277504, -8.893241] } },
      { properties: { mapbox_id: 'mb2', name: 'Kuta Beach', full_address: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia' }, geometry: { coordinates: [116.28, -8.89] } },
      { properties: { mapbox_id: 'mb3', name: 'Denpasar', full_address: 'Denpasar, Bali, Indonesia' }, geometry: { coordinates: [115.22, -8.65] } },
      { properties: { mapbox_id: 'mb1', name: 'Kuta duplicate', full_address: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia' }, geometry: { coordinates: [116.277504, -8.893241] } },
      { properties: { mapbox_id: 'mb4', name: 'Sea point', full_address: 'Sea point, West Nusa Tenggara, Indonesia' }, geometry: { coordinates: [115.85837, -8.61646] } }
    ]
  };
  assert.deepEqual(readMapboxPlaceResults(payload), [
    { name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.893241, lng: 116.277504, placeId: 'mb1' },
    { name: 'Kuta Beach, Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.89, lng: 116.28, placeId: 'mb2' }
  ]);
});

test('Mapbox geocoding fallback results keep localized place names and Lombok filtering', () => {
  const payload = {
    features: [
      { id: 'mb1', text: 'Kuta', place_name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', center: [116.277504, -8.893241] },
      { id: 'mb2', text: 'Kuta Beach', place_name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', center: [116.28, -8.89] },
      { id: 'mb3', text: 'Denpasar', place_name: 'Denpasar, Bali, Indonesia', center: [115.22, -8.65] },
      { id: 'mb1', text: 'Kuta duplicate', place_name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', center: [116.277504, -8.893241] },
      { id: 'mb4', text: 'Sea point', place_name: 'Sea point, West Nusa Tenggara, Indonesia', center: [115.85837, -8.61646] }
    ]
  };
  assert.deepEqual(readMapboxGeocodePlaceResults(payload), [
    { name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.893241, lng: 116.277504, placeId: 'mb1' },
    { name: 'Kuta Beach, Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.89, lng: 116.28, placeId: 'mb2' }
  ]);
});

test('Mapbox route requests use driving, exclude ferries, and request full GeoJSON', () => {
  const url = new URL(mapboxRouteUrl([airport, senggigi], 'fr', 'test-mapbox-token'));
  assert.equal(url.origin, 'https://api.mapbox.com');
  assert.equal(url.pathname, '/directions/v5/mapbox/driving/116.277145,-8.756283;116.044691,-8.493705');
  assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
  assert.equal(url.searchParams.get('alternatives'), 'false');
  assert.equal(url.searchParams.get('geometries'), 'geojson');
  assert.equal(url.searchParams.get('overview'), 'full');
  assert.equal(url.searchParams.get('steps'), 'true');
  assert.equal(url.searchParams.get('exclude'), 'ferry');
  assert.equal(url.searchParams.get('language'), 'fr');
  assert.throws(() => mapboxRouteUrl([airport, kuta, senggigi], 'fr', 'token'), /exactly two points/);
});

const mapboxRoutePayload = {
  waypoints: [
    { distance: 0.04, location: [116.1, -8.5] },
    { distance: 0, location: [116.2, -8.6] }
  ],
  routes: [{
    distance: 12_100,
    duration: 1800,
    geometry: { type: 'LineString', coordinates: [[116.1, -8.5], [116.15, -8.55], [116.2, -8.6]] },
    legs: [{
      steps: [
        { mode: 'driving', maneuver: { type: 'depart' } },
        { mode: 'driving', maneuver: { type: 'turn' } },
        { mode: 'driving', maneuver: { type: 'arrive' } }
      ]
    }]
  }]
};

test('Mapbox route data uses distance, duration, GeoJSON geometry, and snap distance', () => {
  const route = readMapboxRoute(mapboxRoutePayload, 'No route', [
    { lat: -8.5, lng: 116.1 },
    { lat: -8.6, lng: 116.2 }
  ]);
  assert.equal(route.distanceMeters, 12_100);
  assert.equal(route.distanceKm, 13);
  assert.equal(route.durationMinutes, 30);
  assert.equal(route.snapDistanceM, 0.04);
  assert.equal(route.roadAccess, true);
  assert.deepEqual(route.points, [[-8.5, 116.1], [-8.55, 116.15], [-8.6, 116.2]]);
});

test('Mapbox route data keeps the actual metres for a route shorter than 1 km', () => {
  const route = readMapboxRoute({
    waypoints: [
      { distance: 0, location: [116.10645, -8.58415] },
      { distance: 0, location: [116.10742, -8.58403] }
    ],
    routes: [{
      distance: 150,
      duration: 90,
      geometry: {
        type: 'LineString',
        coordinates: [[116.10645, -8.58415], [116.10742, -8.58403]]
      },
      legs: [{ steps: [{ mode: 'driving', maneuver: { type: 'depart' } }, { mode: 'driving', maneuver: { type: 'arrive' } }] }]
    }]
  }, 'No route', [
    { lat: -8.58415, lng: 116.10645 },
    { lat: -8.58403, lng: 116.10742 }
  ]);
  assert.equal(route.distanceMeters, 150);
  assert.equal(route.distanceKm, 1);
});

test('Mapbox route data only grants road access to all-driving routes without ferries', () => {
  const routeWith = (steps) => readMapboxRoute({
    ...mapboxRoutePayload,
    routes: [{ ...mapboxRoutePayload.routes[0], legs: [{ steps }] }]
  });
  assert.equal(routeWith([{ mode: 'walking', maneuver: { type: 'turn' } }]).roadAccess, false);
  assert.equal(routeWith([{ mode: 'driving', maneuver: { type: 'ferry' } }]).roadAccess, false);
  assert.equal(routeWith([{ mode: 'driving', maneuver: { type: 'ferry_train' } }]).roadAccess, false);
  assert.equal(routeWith([{ mode: 'ferry', maneuver: { type: 'depart' } }]).roadAccess, false);
  assert.equal(routeWith([]).roadAccess, false);
});

test('Mapbox route data rejects a missing route and reports a distant snap', () => {
  assert.throws(() => readMapboxRoute({}, 'No road route was found.'), /No road route was found/);
  assert.throws(() => readMapboxRoute({ routes: [{ distance: 0 }] }, 'No road route was found.'), /No road route was found/);
  const route = readMapboxRoute(mapboxRoutePayload, 'No route', [
    { lat: -8.7, lng: 116.5 },
    { lat: -8.6, lng: 116.2 }
  ]);
  assert.ok(route.snapDistanceM > 500);
});

test('booking details expose ordered stops while accepting legacy two-point records', () => {
  assert.deepEqual(travelStopsFromDetails({
    stops: [
      { name: 'Airport', coordinates: [-8.756283, 116.277145] },
      { name: 'Kuta', coordinates: [-8.893241, 116.277504] },
      { name: 'Senggigi', coordinates: [-8.493705, 116.044691] }
    ]
  }), [
    { name: 'Airport', lat: -8.756283, lng: 116.277145 },
    { name: 'Kuta', lat: -8.893241, lng: 116.277504 },
    { name: 'Senggigi', lat: -8.493705, lng: 116.044691 }
  ]);
  assert.deepEqual(travelStopsFromDetails({
    origin: 'Airport',
    destination: 'Senggigi',
    originCoordinates: [-8.756283, 116.277145],
    destinationCoordinates: [-8.493705, 116.044691]
  }), [
    { name: 'Airport', lat: -8.756283, lng: 116.277145 },
    { name: 'Senggigi', lat: -8.493705, lng: 116.044691 }
  ]);
  assert.deepEqual(travelStopsFromDetails({}), []);
});

test('popular Lombok places follow the active interface language', () => {
  assert.equal(localizedPlaces('en').find((place) => place.id === 'airport').name, 'Lombok International Airport');
  assert.equal(localizedPlaces('fr').find((place) => place.id === 'bangsal').name, 'Port de Bangsal');
  assert.equal(localizedPlaces('id').find((place) => place.id === 'airport').name, 'Bandara Internasional Lombok');
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
