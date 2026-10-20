import test from 'node:test';
import assert from 'node:assert/strict';
import { TravelQuoteError, getTravelQuote } from '../src/lib/server/travel-quote.js';
import { roadRouteUrl } from '../src/lib/pickup.js';

const details = {
  originCoordinates: [-8.756283, 116.277145],
  destinationCoordinates: [-8.493705, 116.044691],
  originAccuracyM: 20
};

const osrmPayload = {
  code: 'Ok',
  routes: [{ distance: 12_100, geometry: { coordinates: [[116.277145, -8.756283], [116.044691, -8.493705]] } }],
  waypoints: [{ distance: 8 }, { distance: 16 }]
};

test('server travel quote uses routed distance and the catalog rate', async () => {
  let requestedUrl = '';
  const quote = await getTravelQuote(details, 10_000, {
    fetchImpl: async (url) => {
      requestedUrl = url;
      return { ok: true, json: async () => osrmPayload };
    }
  });
  assert.deepEqual(quote, { distanceKm: 13, estimatedPrice: 130_000, travelRate: 10_000 });
  assert.match(requestedUrl, /116\.277145,-8\.756283;116\.044691,-8\.493705/);
  assert.match(requestedUrl, /radiuses=150%3B600/);
});

test('server travel quote rejects a route that cannot be found', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, { fetchImpl: async () => ({ ok: true, json: async () => ({ code: 'NoRoute' }) }) }),
    (error) => error instanceof TravelQuoteError && error.status === 422
  );
});

test('server travel quote returns a retryable error when OSRM is unavailable', async () => {
  await assert.rejects(
    getTravelQuote(details, 10_000, { fetchImpl: async () => { throw new Error('offline'); } }),
    (error) => error instanceof TravelQuoteError && error.status === 503
  );
});

test('server travel quote rejects an invalid catalog rate', async () => {
  await assert.rejects(
    getTravelQuote(details, 0, { fetchImpl: async () => ({ ok: true, json: async () => osrmPayload }) }),
    (error) => error instanceof TravelQuoteError && error.status === 503
  );
});

test('road route URL clamps GPS accuracy to the supported radius', () => {
  const url = roadRouteUrl({ from: { lat: -8.5, lng: 116.1 }, to: { lat: -8.6, lng: 116.2 }, fromAccuracy: 999 });
  assert.match(url, /radiuses=600%3B600/);
  assert.match(url, /overview=simplified/);
  assert.match(url, /geometries=geojson/);
});
