import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BookingValidationError,
  MAX_STOPS,
  isValidIdempotencyKey,
  isValidPickupDateTime,
  isValidTravelDate,
  normalizeBookingDetails,
  normalizeWhatsApp,
  todayInWita,
  verifyTravelQuote
} from '../src/lib/server/booking-validation.js';

const travelDetails = {
  origin: 'Bandara Internasional Lombok',
  destination: 'Senggigi',
  originCoordinates: [-8.756283, 116.277145],
  originAccuracyM: null,
  originSource: 'search',
  destinationCoordinates: [-8.493705, 116.044691],
  pickupTime: '09:30',
  distanceKm: 30,
  estimatedPrice: 300_000,
  locale: 'en'
};

test('travel dates use the WITA calendar instead of UTC', () => {
  const now = Date.parse('2026-10-19T16:30:00Z');
  assert.equal(todayInWita(now), '2026-10-20');
  assert.equal(isValidTravelDate('2026-10-20', now), true);
  assert.equal(isValidTravelDate('2026-10-19', now), false);
  assert.equal(isValidTravelDate('2026-02-31', now), false);
  assert.equal(isValidTravelDate('20-10-2026', now), false);
});

test('pickup times must be in the WITA future', () => {
  const now = Date.parse('2026-10-19T16:30:00Z');
  assert.equal(isValidPickupDateTime('2026-10-20', '00:31', now), true);
  assert.equal(isValidPickupDateTime('2026-10-20', '00:29', now), false);
  assert.equal(isValidPickupDateTime('2026-10-19', '23:59', now), false);
  assert.equal(isValidPickupDateTime('2026-10-20', '24:00', now), false);
  assert.equal(isValidPickupDateTime('2026-02-31', '10:00', now), false);
});

test('WhatsApp numbers normalize to international format', () => {
  assert.equal(normalizeWhatsApp('0812 3456 7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('6281234567890'), '6281234567890');
  assert.equal(normalizeWhatsApp('+62 812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('812 3456 7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('+1 415 555 2671'), '14155552671');
  assert.throws(() => normalizeWhatsApp('00628123456789'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('62081234567890'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('abc081234567890'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('0812'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('081234567890123456'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('4155552671'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('+1234'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('+081234567890'), /belum valid/);
});

test('validation errors carry a stable code for client-side translation', () => {
  assert.equal(new BookingValidationError('x').code, 'invalid');
  assert.throws(() => normalizeWhatsApp('0812'), (error) => error.code === 'contact');
  assert.throws(() => verifyTravelQuote(travelDetails, { distanceKm: 31, estimatedPrice: 1 }), (error) => error.code === 'conflict');
});

test('idempotency keys are bounded and URL-safe', () => {
  assert.equal(isValidIdempotencyKey('123e4567-e89b-42d3-a456-426614174000'), true);
  assert.equal(isValidIdempotencyKey('short'), false);
  assert.equal(isValidIdempotencyKey('key with spaces and symbols !!!!!!'), false);
  assert.equal(isValidIdempotencyKey('x'.repeat(129)), false);
});

test('travel details are normalized and bounded to the two-point route flow', () => {
  assert.equal(MAX_STOPS, 2);
  const details = normalizeBookingDetails('travel', travelDetails);
  assert.deepEqual(details.originCoordinates, travelDetails.originCoordinates);
  assert.equal(details.origin, 'Bandara Internasional Lombok');
  assert.equal(details.destination, 'Senggigi');
  assert.deepEqual(details.stops, [
    { name: 'Bandara Internasional Lombok', coordinates: [-8.756283, 116.277145] },
    { name: 'Senggigi', coordinates: [-8.493705, 116.044691] }
  ]);
  assert.equal(details.estimatedPrice, 300_000);
  assert.equal(details.notes, '');
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, originCoordinates: [-8.65, 115.22] }), /luar Lombok/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, originCoordinates: [-8.61646, 115.85837] }), /luar Lombok/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, destinationCoordinates: [-8.43819, 115.976] }), /luar Lombok/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, destinationCoordinates: [-8.756283, 116.277145] }), /harus berbeda/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, stops: [] }), /tepat 2/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, pickupTime: '25:00' }), /jam jemput/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, originSource: 'gps-spoofed' }), /sumber lokasi/);
});

test('exactly two ordered stops preserve the itinerary and reject duplicates or malformed points', () => {
  const stops = [
    { name: 'Bandara Internasional Lombok', coordinates: [-8.756283, 116.277145] },
    { name: 'Senggigi', coordinates: [-8.493705, 116.044691] }
  ];
  const details = normalizeBookingDetails('travel', { ...travelDetails, stops });
  assert.deepEqual(details.stops, stops);
  assert.equal(details.origin, 'Bandara Internasional Lombok');
  assert.equal(details.destination, 'Senggigi');
  assert.deepEqual(details.destinationCoordinates, [-8.493705, 116.044691]);

  assert.throws(
    () => normalizeBookingDetails('travel', { ...travelDetails, stops: [stops[0], stops[0]] }),
    /harus berbeda/
  );
  assert.throws(
    () => normalizeBookingDetails('travel', {
      ...travelDetails,
      stops: [stops[0], { name: 'Kuta Mandalika', coordinates: [-8.893241, 116.277504] }, stops[1]]
    }),
    /tepat 2/
  );
  assert.throws(
    () => normalizeBookingDetails('travel', { ...travelDetails, stops: [{ name: 'Only point', coordinates: [-8.5, 116.1] }] }),
    /tepat 2/
  );
  assert.throws(
    () => normalizeBookingDetails('travel', { ...travelDetails, stops: [null, stops[1]] }),
    /tidak valid/
  );
  assert.throws(
    () => normalizeBookingDetails('travel', { ...travelDetails, stops: [{ coordinates: [-8.5, 116.1] }, stops[1]] }),
    /lokasi 1/
  );
});

test('the route limit accepts exactly two points and rejects a third', () => {
  const point = (index) => ({ name: `Stop ${index}`, coordinates: [-8.5 - index * 0.01, 116.1 + index * 0.01] });
  const two = [point(0), point(1)];
  const accepted = normalizeBookingDetails('travel', { ...travelDetails, stops: two });
  assert.equal(accepted.stops.length, 2);

  const three = [point(0), point(1), point(2)];
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, stops: three }), /tepat 2/);
});

test('package and rental details reject arbitrary objects and arrays', () => {
  assert.deepEqual(normalizeBookingDetails('wisata', { notes: '  Jemput di lobi  ' }), { notes: 'Jemput di lobi' });
  assert.deepEqual(normalizeBookingDetails('rental', {}), { notes: '' });
  assert.throws(() => normalizeBookingDetails('wisata', []), /tidak valid/);
  assert.throws(() => normalizeBookingDetails('wisata', 'notes'), /tidak valid/);
  assert.throws(() => normalizeBookingDetails('wisata', { notes: { text: 'x' } }), /catatan/);
  assert.throws(() => normalizeBookingDetails('wisata', { unexpected: 'x' }), /tidak valid/);
});

test('a stale client quote is rejected instead of accepted', () => {
  assert.throws(() => verifyTravelQuote(travelDetails, { distanceKm: 30, estimatedPrice: 1 }), (error) => {
    assert.equal(error instanceof BookingValidationError, true);
    assert.equal(error.status, 409);
    return true;
  });
  assert.doesNotThrow(() => verifyTravelQuote(travelDetails, { distanceKm: 30, estimatedPrice: 300_000 }));
});
