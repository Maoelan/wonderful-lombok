import test from 'node:test';
import assert from 'node:assert/strict';
import { TravelQuoteError, getTravelQuote } from '../src/lib/server/travel-quote.js';

const details = {
  origin: 'Bandara Internasional Lombok',
  destination: 'Senggigi',
  originCoordinates: [-8.756283, 116.277145],
  destinationCoordinates: [-8.493705, 116.044691],
  originAccuracyM: 20,
  locale: 'en'
};

const encodedRoute = 'vemt@ekudUchr@zkl@';
const driveSteps = [
  { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DEPART' } },
  { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DESTINATION' } }
];
const airportLeg = {
  startLocation: { latLng: { latitude: -8.756283, longitude: 116.277145 } },
  endLocation: { latLng: { latitude: -8.493705, longitude: 116.044691 } },
  steps: driveSteps
};
const farLeg = {
  startLocation: { latLng: { latitude: -8.5, longitude: 116.1 } },
  endLocation: { latLng: { latitude: -8.6, longitude: 116.2 } },
  steps: driveSteps
};
const routePayload = {
  routes: [{ distanceMeters: 12_100, duration: '1800s', polyline: { encodedPolyline: encodedRoute }, legs: [airportLeg] }]
};

test('server travel quote uses Google Routes distance, duration, and the catalog rate', async () => {
  let requestedUrl = '';
  let requestedOptions;
  const quote = await getTravelQuote(details, 10_000, {
    apiKey: 'test-server-key',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return new Response(JSON.stringify(routePayload), { status: 200 });
    }
  });
  assert.deepEqual(quote, { distanceKm: 13, durationMinutes: 30, estimatedPrice: 130_000, travelRate: 10_000 });
  assert.equal(requestedUrl, 'https://routes.googleapis.com/directions/v2:computeRoutes');
  assert.equal(requestedOptions.method, 'POST');
  assert.equal(requestedOptions.headers['x-goog-api-key'], 'test-server-key');
  const body = JSON.parse(requestedOptions.body);
  assert.deepEqual(body.origin.location.latLng, { latitude: -8.756283, longitude: 116.277145 });
  assert.deepEqual(body.destination.location.latLng, { latitude: -8.493705, longitude: 116.044691 });
  assert.equal('intermediates' in body, false);
});

test('server travel quote rejects more than two points before calling Google', async () => {
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
      apiKey: 'test-server-key',
      fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 400 && error.code === 'invalid_points'
  );
  assert.equal(calls, 0);
});

test('server travel quote rejects a route that cannot be found', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: 'test-server-key',
      fetchImpl: async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'not_found'
  );
});

test('server travel quote rejects a route that snaps too far from either stop', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: 'test-server-key',
      fetchImpl: async () => new Response(JSON.stringify({
        routes: [{ distanceMeters: 12_100, duration: '1800s', polyline: { encodedPolyline: '~c{r@_xrcU~oR_pR' }, legs: [farLeg] }]
      }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('server travel quote rejects a ferry route instead of treating it as a road route', async () => {
  const ferryLeg = {
    ...airportLeg,
    steps: [{ travelMode: 'DRIVE', navigationInstruction: { maneuver: 'FERRY' } }]
  };
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: 'test-server-key',
      fetchImpl: async () => new Response(JSON.stringify({
        routes: [{ distanceMeters: 12_100, duration: '1800s', polyline: { encodedPolyline: encodedRoute }, legs: [ferryLeg] }]
      }), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 422 && error.code === 'no_road_access'
  );
});

test('server travel quote returns a retryable error when Google Routes is unavailable', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: 'test-server-key',
      retryDelayMs: 0,
      fetchImpl: async () => { throw new Error('offline'); }
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'network'
  );
});

test('server travel quote retries one transient Google Routes outage', async () => {
  let calls = 0;
  const quote = await getTravelQuote(details, 10_000, {
    apiKey: 'test-server-key',
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

test('server travel quote maps persistent Google Routes 503 to a retryable error', async () => {
  let calls = 0;
  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: 'test-server-key',
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
        apiKey: 'test-server-key',
        retryDelayMs: 0,
        fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'no' } }), { status })
      }),
      (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === code
    );
  }

  await assert.rejects(
    getTravelQuote(details, 10_000, {
      apiKey: '',
      fetchImpl: async () => new Response(JSON.stringify(routePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 503 && error.code === 'not_configured'
  );
});

test('server travel quote rejects an invalid catalog rate and an invalid number of stops', async () => {
  await assert.rejects(
    getTravelQuote(details, 0, { apiKey: 'test-server-key', fetchImpl: async () => new Response('{}', { status: 200 }) }),
    (error) => error instanceof TravelQuoteError && error.status === 503
  );
  await assert.rejects(
    getTravelQuote({ stops: [{ name: 'Only point', coordinates: [-8.5, 116.1] }] }, 10_000, {
      apiKey: 'test-server-key',
      fetchImpl: async () => new Response(JSON.stringify(routePayload), { status: 200 })
    }),
    (error) => error instanceof TravelQuoteError && error.status === 400 && error.code === 'invalid_points'
  );
});
