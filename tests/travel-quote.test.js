import test from 'node:test';
import assert from 'node:assert/strict';
import { TravelQuoteError, getTravelQuote } from '../src/lib/server/travel-quote.js';

process.env.MAPBOX_SERVER_TOKEN = 'test-mapbox-token';

const details = {
  origin: 'Bandara Internasional Lombok',
  destination: 'Senggigi',
  originCoordinates: [-8.756283, 116.277145],
  destinationCoordinates: [-8.493705, 116.044691],
  originAccuracyM: 20,
  locale: 'en'
};

const driveSteps = [
  { mode: 'driving', maneuver: { type: 'depart' } },
  { mode: 'driving', maneuver: { type: 'turn' } },
  { mode: 'driving', maneuver: { type: 'arrive' } }
];

const routePayload = {
  waypoints: [
    { distance: 0, location: [116.277145, -8.756283] },
    { distance: 0, location: [116.044691, -8.493705] }
  ],
  routes: [{
    distance: 12_100,
    duration: 1_800,
    geometry: {
      type: 'LineString',
      coordinates: [[116.277145, -8.756283], [116.1, -8.6], [116.044691, -8.493705]]
    },
    legs: [{ steps: driveSteps }]
  }]
};

const farPayload = {
  ...routePayload,
  waypoints: [
    { distance: 0, location: [116.1, -8.5] },
    { distance: 0, location: [116.2, -8.6] }
  ]
};

test('server travel quote uses Mapbox Directions distance, duration, and the catalog rate', async () => {
  let requestedUrl = '';
  let requestedOptions;
  const quote = await getTravelQuote(details, 10_000, {
    token: 'test-mapbox-token',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return new Response(JSON.stringify(routePayload), { status: 200 });
    }
  });
  assert.deepEqual(quote, { distanceKm: 13, durationMinutes: 30, estimatedPrice: 130_000, travelRate: 10_000 });
  const url = new URL(requestedUrl);
  assert.equal(url.origin, 'https://api.mapbox.com');
  assert.equal(url.pathname, '/directions/v5/mapbox/driving/116.277145,-8.756283;116.044691,-8.493705');
  assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
  assert.equal(url.searchParams.get('exclude'), 'ferry');
  assert.equal(requestedOptions.method, 'GET');
});

test('server travel quote rejects more than two points before calling Mapbox', async () => {
  let calls = 0;
  await assert.rejects(
    getTravelQuote({
      stops: [
        { name: 'Bandara Internasional Lombok', coordinates: [-8.756283, 116.277145] },
        { name: 'Kuta Mandalika', coordinates: [-8.893241, 116.277504] },
        { name: 'Senggigi', coordinates: [-8.493705, 116.044691] }
      ],
      locale: 'en'
    }, 10_000, {
      token: 'test-mapbox-token',
      fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 400 && error.code === 'invalid_points'
  );
  assert.equal(calls, 0);
});

test('server travel quote rejects a route that cannot be found', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'not_found'
  );
});

test('server travel quote rejects a route that snaps too far from either stop', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(farPayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('server travel quote rejects a ferry route instead of treating it as a road route', async () => {
  const ferryPayload = {
    ...routePayload,
    routes: [{
      ...routePayload.routes[0],
      legs: [{ steps: [{ mode: 'driving', maneuver: { type: 'ferry' } }] }]
    }]
  };
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(ferryPayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('server travel quote returns a retryable error when Mapbox Directions is unavailable', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: 'test-mapbox-token',
      retryDelayMs: 0,
      fetchImpl: async () => { throw new Error('offline'); }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'network'
  );
});

test('server travel quote retries one transient Mapbox Directions outage', async () => {
  let calls = 0;
  const quote = await getTravelQuote(details, 10_000, {
    token: 'test-mapbox-token',
    retryDelayMs: 0,
    fetchImpl: async () => {
      calls += 1;
      return new Response(
        JSON.stringify(calls === 1 ? { error: { message: 'busy' } } : routePayload),
        { status: calls === 1 ? 503 : 200 }
      );
    }
  });

  assert.deepEqual(quote, { distanceKm: 13, durationMinutes: 30, estimatedPrice: 130_000, travelRate: 10_000 });
  assert.equal(calls, 2);
});

test('server travel quote maps persistent Mapbox Directions 503 to a retryable error', async () => {
  let calls = 0;
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: 'test-mapbox-token',
      retryDelayMs: 0,
      fetchImpl: async () => {
        calls += 1;
        return new Response(JSON.stringify({ error: { message: 'down' } }), { status: 503 });
      }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'network'
  );
  assert.equal(calls, 2);
});

test('server travel quote distinguishes permission, quota, and configuration failures', async () => {
  for (const [status, code] of [[403, 'permission_denied'], [429, 'quota_exceeded']]) {
    await assert.rejects(
      getTravelQuote(details, 10_000, {
        token: 'test-mapbox-token',
        retryDelayMs: 0,
        fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'no' } }), { status })
      }),
      (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === code
    );
  }

  await assert.rejects(
    getTravelQuote(details, 10_000, {
      token: '',
      fetchImpl: async () => new Response(JSON.stringify(routePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'not_configured'
  );
});

test('server travel quote rejects an invalid catalog rate and an invalid number of stops', async () => {
  await assert.rejects(
    getTravelQuote(details, 0, { token: 'test-mapbox-token', fetchImpl: async () => new Response('{}', { status: 200 }) }),
    (error) => error instanceof TravelQuoteError && error.status === 503
  );
  await assert.rejects(
    getTravelQuote({ stops: [{ name: 'Only point', coordinates: [-8.5, 116.1] }] }, 10_000, {
      token: 'test-mapbox-token',
      fetchImpl: async () => new Response(JSON.stringify(routePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 400 && error.code === 'invalid_points'
  );
});
