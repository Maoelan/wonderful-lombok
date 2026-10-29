import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoadRoute, searchPlaces } from '../src/lib/server/map-providers/index.js';
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

test('Mapbox place search uses Search Box, the access token, and keeps only Lombok results', async () => {
  let requestedUrl;
  const results = await searchPlaces('Kuta', 'en', {
    token: 'test-mapbox-token',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [116.277504, -8.893241] },
            properties: {
              mapbox_id: 'mb1',
              name: 'Kuta',
              full_address: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia'
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [115.22, -8.65] },
            properties: { mapbox_id: 'mb2', name: 'Denpasar', full_address: 'Denpasar, Bali, Indonesia' }
          }
        ]
      }), { status: 200 });
    }
  });

  const url = new URL(requestedUrl);
  assert.equal(url.origin, 'https://api.mapbox.com');
  assert.equal(url.pathname, '/search/searchbox/v1/forward');
  assert.equal(url.searchParams.get('q'), 'Kuta');
  assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
  assert.equal(url.searchParams.get('country'), 'id');
  assert.deepEqual(results, [
    { name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.893241, lng: 116.277504, placeId: 'mb1' }
  ]);
});

test('Mapbox place search falls back to Geocoding when Search Box returns no places', async () => {
  const requestedUrls = [];
  const results = await searchPlaces('Jl. Raya Senggigi No.8', 'en', {
    token: 'test-mapbox-token',
    fetchImpl: async (url) => {
      requestedUrls.push(url);
      if (url.includes('/search/searchbox/v1/forward')) {
        return new Response(JSON.stringify({ features: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({
        features: [{
          id: 'geocode-1',
          text: 'Senggigi',
          place_name: 'Senggigi, Batu Layar, West Lombok Regency, West Nusa Tenggara, Indonesia',
          center: [116.044691, -8.493705]
        }]
      }), { status: 200 });
    }
  });

  assert.equal(requestedUrls.length, 2);
  assert.match(requestedUrls[0], /\/search\/searchbox\/v1\/forward\?/);
  assert.match(requestedUrls[1], /\/geocoding\/v5\/mapbox\.places\/Jl\.%20Raya%20Senggigi%20No\.8\.json\?/);
  assert.deepEqual(results, [
    { name: 'Senggigi, Batu Layar, West Lombok Regency, West Nusa Tenggara, Indonesia', lat: -8.493705, lng: 116.044691, placeId: 'geocode-1' }
  ]);
});

test('Mapbox place search maps quota failures without falling back', async () => {
  const requestedUrls = [];
  await assert.rejects(
    searchPlaces('kfc', 'en', {
      token: 'test-mapbox-token',
      fetchImpl: async (url) => {
        requestedUrls.push(url);
        return new Response('{}', { status: 429 });
      }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'quota_exceeded'
  );
  assert.ok(requestedUrls.length >= 1);
  assert.ok(requestedUrls.every((url) => url.includes('/search/searchbox/v1/forward?')));
});

test('Mapbox road routes use driving directions and require a full road route', async () => {
  let requestedUrl;
  const route = await getRoadRoute([airport, senggigi], 'en', {
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
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(ferryPayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('Mapbox routes that snap too far from a selected point are rejected', async () => {
  await assert.rejects(
    getRoadRoute([{ lat: -8.7, lng: 116.5 }, senggigi], 'en', {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(mapboxRoutePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('Mapbox providers fail closed without an access token or when the route is missing', async () => {
  await assert.rejects(
    searchPlaces('Kuta', 'en', { token: '', fetchImpl: async () => new Response('{}') }),
    (error) => error instanceof TravelQuoteError && error.code === 'not_configured'
  );
  await assert.rejects(
    getRoadRoute([airport, senggigi], 'en', {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.code === 'not_found'
  );
});

const shortStops = [
  { lat: -8.58415, lng: 116.10645 },
  { lat: -8.58403, lng: 116.10742 }
];

function shortRoutePayload(distance) {
  return {
    waypoints: [
      { distance: 0, location: [116.10645, -8.58415] },
      { distance: 0, location: [116.10742, -8.58403] }
    ],
    routes: [{
      distance,
      duration: 90,
      geometry: {
        type: 'LineString',
        coordinates: [[116.10645, -8.58415], [116.10742, -8.58403]]
      },
      legs: [{
        steps: [
          { mode: 'driving', maneuver: { type: 'depart' } },
          { mode: 'driving', maneuver: { type: 'arrive' } }
        ]
      }]
    }]
  };
}

test('Mapbox road routes below the 1 km minimum fail closed at the 999 m boundary', async () => {
  for (const distance of [150, 999]) {
    await assert.rejects(
      getRoadRoute(shortStops, 'en', {
        token: 'test-mapbox-token',
        fetchImpl: async () => new Response(JSON.stringify(shortRoutePayload(distance)), { status: 200 })
      }),
      (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'route_too_short'
    );
  }
});

test('Mapbox road routes are bookable from the 1000 m boundary upward', async () => {
  for (const distance of [1000, 1001]) {
    const route = await getRoadRoute(shortStops, 'en', {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(shortRoutePayload(distance)), { status: 200 })
    });
    assert.equal(route.distanceMeters, distance);
    assert.equal(route.distanceKm, distance === 1000 ? 1 : 2);
  }
});
