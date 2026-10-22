import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookingRequest } from '../src/lib/server/booking-request.js';

process.env.GOOGLE_MAPS_SERVER_API_KEY = 'test-server-key';
const now = Date.parse('2026-10-19T16:30:00Z');
const routePayload = {
  routes: [{
    distanceMeters: 12_100,
    duration: '1800s',
    polyline: { encodedPolyline: 'vemt@ekudUchr@zkl@' },
    legs: [{
      startLocation: { latLng: { latitude: -8.756283, longitude: 116.277145 } },
      endLocation: { latLng: { latitude: -8.493705, longitude: 116.044691 } },
      steps: [
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DEPART' } },
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DESTINATION' } }
      ]
    }]
  }]
};

function travelBody(overrides = {}) {
  return {
    name: '  Siti  ',
    whatsapp: '0812 3456 7890',
    travelDate: '2026-10-20',
    people: 2,
    serviceType: 'travel',
    serviceName: 'Travel',
    details: {
      origin: 'Bandara Internasional Lombok',
      destination: 'Senggigi',
      originCoordinates: [-8.756283, 116.277145],
      originAccuracyM: 20,
      originSource: 'gps',
      destinationCoordinates: [-8.493705, 116.044691],
      pickupTime: '09:30',
      distanceKm: 13,
      estimatedPrice: 130_000,
      locale: 'en'
    },
    ...overrides
  };
}

function quoteFetch(calls = []) {
  return async (url) => {
    calls.push(url);
    return new Response(JSON.stringify(routePayload), { status: 200 });
  };
}

test('booking request stores the server travel quote and normalized customer data', async () => {
  const saved = [];
  const result = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174000',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async (booking) => { saved.push(booking); return 'WL-TEST-1'; }
  });

  assert.deepEqual(result, { status: 201, body: { code: 'WL-TEST-1' } });
  assert.equal(saved.length, 1);
  assert.equal(saved[0].name, 'Siti');
  assert.equal(saved[0].whatsapp, '6281234567890');
  assert.equal(saved[0].idempotencyKey, '123e4567-e89b-42d3-a456-426614174000');
  assert.equal(saved[0].details.distanceKm, 13);
  assert.equal(saved[0].details.durationMinutes, 30);
  assert.equal(saved[0].details.estimatedPrice, 130_000);
  assert.equal(saved[0].details.travelRate, 10_000);
  assert.deepEqual(saved[0].details.stops, [
    { name: 'Bandara Internasional Lombok', coordinates: [-8.756283, 116.277145] },
    { name: 'Senggigi', coordinates: [-8.493705, 116.044691] }
  ]);
});

test('booking quote verification stops before Google when the shared route budget is exhausted', async () => {
  let providerCalls = 0;
  const result = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174099',
    now,
    fetchImpl: async () => { providerCalls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); },
    consumeTravelQuote: async () => ({ allowed: false }),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-NEVER'
  });

  assert.equal(result.status, 429);
  assert.equal(providerCalls, 0);
});

test('booking request rejects duplicate or excessive stops before calling Google', async () => {
  let calls = 0;
  const duplicate = await createBookingRequest({
    body: travelBody({
      details: {
        stops: [
          { name: 'Airport', coordinates: [-8.756283, 116.277145] },
          { name: 'Airport again', coordinates: [-8.756283, 116.277145] }
        ],
        pickupTime: '09:30',
        distanceKm: 13,
        estimatedPrice: 130_000,
        locale: 'en'
      }
    }),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174010',
    now,
    fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); },
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-DUPLICATE'
  });

  assert.equal(duplicate.status, 400);
  assert.match(duplicate.body.error, /harus berbeda/);
  assert.equal(calls, 0);

  const threeStops = Array.from({ length: 3 }, (_, index) => ({
    name: `Stop ${index}`,
    coordinates: [-8.5 - index * 0.01, 116.1 + index * 0.01]
  }));
  const excessive = await createBookingRequest({
    body: travelBody({
      details: {
        stops: threeStops,
        pickupTime: '09:30',
        distanceKm: 13,
        estimatedPrice: 130_000,
        locale: 'en'
      }
    }),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174011',
    now,
    fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); },
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-EXCESSIVE'
  });

  assert.equal(excessive.status, 400);
  assert.match(excessive.body.error, /tepat 2/);
  assert.equal(calls, 0);
});

test('booking request reports a Google Routes permission failure as retryable', async () => {
  const result = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174012',
    now,
    fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'forbidden' } }), { status: 403 }),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-403'
  });

  assert.equal(result.status, 503);
  assert.match(result.body.error, /belum dikonfigurasi/);
});

test('booking request rejects a tampered price or distance with 409', async () => {
  const saved = [];
  const result = await createBookingRequest({
    body: travelBody({ details: { ...travelBody().details, estimatedPrice: 1 } }),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174001',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async (booking) => { saved.push(booking); return 'WL-TEST-2'; }
  });

  assert.equal(result.status, 409);
  assert.match(result.body.error, /hitung ulang/);
  assert.equal(saved.length, 0);
});

test('booking request rejects coordinates outside Lombok', async () => {
  const body = travelBody();
  body.details.originCoordinates = [-8.65, 115.22];
  const result = await createBookingRequest({
    body,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174002',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-3'
  });

  assert.equal(result.status, 400);
  assert.match(result.body.error, /luar Lombok/);
});

test('booking request rejects sea points inside the old bounding box', async () => {
  let calls = 0;
  const body = travelBody();
  body.details.originCoordinates = [-8.61646, 115.85837];
  const result = await createBookingRequest({
    body,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174013',
    now,
    fetchImpl: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); },
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-SEA'
  });

  assert.equal(result.status, 400);
  assert.match(result.body.error, /luar Lombok/);
  assert.equal(calls, 0);
});

test('booking request rejects a ferry route as lacking road access', async () => {
  const body = travelBody();
  const ferryPayload = {
    routes: [{
      distanceMeters: 12_100,
      duration: '1800s',
      polyline: { encodedPolyline: 'vemt@ekudUchr@zkl@' },
      legs: [{
        startLocation: { latLng: { latitude: -8.756283, longitude: 116.277145 } },
        endLocation: { latLng: { latitude: -8.493705, longitude: 116.044691 } },
        steps: [{ travelMode: 'DRIVE', navigationInstruction: { maneuver: 'FERRY' } }]
      }]
    }]
  };
  const result = await createBookingRequest({
    body,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174014',
    now,
    fetchImpl: async () => new Response(JSON.stringify(ferryPayload), { status: 200 }),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-FERRY'
  });

  assert.equal(result.status, 422);
  assert.match(result.body.error, /akses jalan/);
});

test('booking request rejects arbitrary detail objects and missing idempotency keys', async () => {
  const invalidDetails = await createBookingRequest({
    body: travelBody({ details: [] }),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174003',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-4'
  });
  assert.equal(invalidDetails.status, 400);

  const missingKey = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-5'
  });
  assert.equal(missingKey.status, 400);
});

test('booking request enforces the WITA date and rental flag', async () => {
  const yesterday = await createBookingRequest({
    body: travelBody({ travelDate: '2026-10-19' }),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174004',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => 'WL-TEST-6'
  });
  assert.equal(yesterday.status, 400);

  const rentalBody = {
    name: 'Siti',
    whatsapp: '081234567890',
    travelDate: '2026-10-20',
    people: 2,
    serviceType: 'rental',
    serviceName: 'Mobil Privat + Driver',
    details: { notes: 'Antar pagi' }
  };
  const disabled = await createBookingRequest({
    body: rentalBody,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174005',
    now,
    saveBooking: async () => 'WL-TEST-7'
  });
  assert.equal(disabled.status, 400);

  const enabled = await createBookingRequest({
    body: rentalBody,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174006',
    now,
    rentalEnabled: true,
    saveBooking: async () => 'WL-TEST-8'
  });
  assert.deepEqual(enabled, { status: 201, body: { code: 'WL-TEST-8' } });
});

test('booking request rejects honeypot submissions without saving', async () => {
  const saved = [];
  const result = await createBookingRequest({
    body: { ...travelBody(), website: 'https://spam.example' },
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174008',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async (booking) => { saved.push(booking); return 'WL-TEST-HONEY'; }
  });

  assert.equal(result.status, 400);
  assert.equal(saved.length, 0);
});

test('booking request returns a retryable 503 when persistence fails', async () => {
  const result = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174007',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => { throw new Error('Convex down'); }
  });

  assert.equal(result.status, 503);
  assert.match(result.body.error, /Coba lagi/);
});
