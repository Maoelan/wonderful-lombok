import test from 'node:test';
import assert from 'node:assert/strict';
import { getMapProviderName, getRoadRoute, searchPlaces } from '../src/lib/server/map-providers/index.js';
import { TravelQuoteError } from '../src/lib/server/travel-quote-error.js';

const airport = { lat: -8.756283, lng: 116.277145 };
const senggigi = { lat: -8.493705, lng: 116.044691 };

const mapboxRoutePayload = {
  waypoints: [
    { distance: 0.04, location: [116.277145, -8.756283] },
    { distance: 0, location: [116.044691, -8.493705] }
  ],
  routes: [{
    distance: 48_212.371,
    duration: 5_171.988,
    geometry: {
      type: 'LineString',
      coordinates: [[116.277145, -8.756283], [116.1, -8.6], [116.044691, -8.493705]]
    },
    legs: [{
      steps: [
        { mode: 'driving', maneuver: { type: 'depart' } },
        { mode: 'driving', maneuver: { type: 'turn' } },
        { mode: 'driving', maneuver: { type: 'arrive' } }
      ]
    }]
  }]
};

test('map provider selection defaults to Google and accepts Mapbox explicitly', () => {
  assert.equal(getMapProviderName(undefined), 'google');
  assert.equal(getMapProviderName('google'), 'google');
  assert.equal(getMapProviderName('MAPBOX'), 'mapbox');
  assert.equal(getMapProviderName('unknown'), 'google');
});

test('Mapbox place search uses the server token and keeps only Lombok results', async () => {
  let requestedUrl;
  const results = await searchPlaces('Kuta', 'en', {
    provider: 'mapbox',
    token: 'test-mapbox-token',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({
        features: [
          { id: 'mb1', text: 'Kuta', place_name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', center: [116.277504, -8.893241] },
          { id: 'mb2', text: 'Denpasar', place_name: 'Denpasar, Bali, Indonesia', center: [115.22, -8.65] }
        ]
      }), { status: 200 });
    }
  });

  const url = new URL(requestedUrl);
  assert.equal(url.origin, 'https://api.mapbox.com');
  assert.equal(url.pathname, '/geocoding/v5/mapbox.places/Kuta.json');
  assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
  assert.equal(url.searchParams.get('country'), 'id');
  assert.deepEqual(results, [
    { name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.893241, lng: 116.277504, placeId: 'mb1' }
  ]);
});

test('Mapbox road routes use driving directions and require a full road route', async () => {
  let requestedUrl;
  const route = await getRoadRoute([airport, senggigi], 'en', {
    provider: 'mapbox',
    token: 'test-mapbox-token',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify(mapboxRoutePayload), { status: 200 });
    }
  });

  const url = new URL(requestedUrl);
  assert.equal(url.pathname, '/directions/v5/mapbox/driving/116.277145,-8.756283;116.044691,-8.493705');
  assert.equal(url.searchParams.get('exclude'), 'ferry');
  assert.equal(url.searchParams.get('geometries'), 'geojson');
  assert.equal(route.distanceKm, 49);
  assert.equal(route.durationMinutes, 87);
  assert.equal(route.snapDistanceM, 0.04);
  assert.equal(route.roadAccess, true);
});

test('Mapbox routes with a ferry or non-driving step fail closed', async () => {
  const ferryPayload = {
    ...mapboxRoutePayload,
    routes: [{
      ...mapboxRoutePayload.routes[0],
      legs: [{ steps: [{ mode: 'driving', maneuver: { type: 'ferry' } }] }]
    }]
  };
  await assert.rejects(
    getRoadRoute([airport, senggigi], 'en', {
      provider: 'mapbox',
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(ferryPayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('Mapbox routes that snap too far from a selected point are rejected', async () => {
  await assert.rejects(
    getRoadRoute([{ lat: -8.7, lng: 116.5 }, senggigi], 'en', {
      provider: 'mapbox',
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(mapboxRoutePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('Mapbox providers fail closed without a server token or when the route is missing', async () => {
  await assert.rejects(
    searchPlaces('Kuta', 'en', { provider: 'mapbox', token: '', fetchImpl: async () => new Response('{}') }),
    (error) => error instanceof TravelQuoteError && error.code === 'not_configured'
  );
  await assert.rejects(
    getRoadRoute([airport, senggigi], 'en', {
      provider: 'mapbox',
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.code === 'not_found'
  );
});
