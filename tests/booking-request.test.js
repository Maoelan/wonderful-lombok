import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookingRequest } from '../src/lib/server/booking-request.js';

const now = Date.parse('2026-10-19T16:30:00Z');
const osrmPayload = {
  code: 'Ok',
  routes: [{ distance: 12_100, geometry: { coordinates: [[116.277145, -8.756283], [116.044691, -8.493705]] } }],
  waypoints: [{ distance: 8 }, { distance: 16 }]
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
    return { ok: true, json: async () => osrmPayload };
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
  assert.equal(saved[0].details.estimatedPrice, 130_000);
  assert.equal(saved[0].details.travelRate, 10_000);
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

test('booking request rejects a pickup time that has already passed', async () => {
  const saved = [];
  const body = travelBody({ travelDate: '2026-10-20' });
  body.details = { ...body.details, pickupTime: '00:00' };
  const result = await createBookingRequest({
    body,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174010',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async (booking) => { saved.push(booking); return 'WL-TEST-PAST'; }
  });

  assert.equal(result.status, 400);
  assert.match(result.body.error, /sudah lewat/);
  assert.equal(saved.length, 0);
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

test('booking request rejects a reused key with a different payload', async () => {
  const result = await createBookingRequest({
    body: travelBody(),
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174009',
    now,
    fetchImpl: quoteFetch(),
    loadCatalog: async () => ({ travelRate: 10_000 }),
    saveBooking: async () => ({ code: null, conflict: true })
  });

  assert.equal(result.status, 409);
  assert.match(result.body.error, /tidak konsisten/);
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
