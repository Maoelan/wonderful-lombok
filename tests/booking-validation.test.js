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

test('WhatsApp numbers normalize to one Indonesian mobile format', () => {
  assert.equal(normalizeWhatsApp('0812 3456 7890'), '6281234567890');
  assert.equal(normalizeWhatsApp('6281234567890'), '6281234567890');
  assert.equal(normalizeWhatsApp('+62 812-3456-7890'), '6281234567890');
  assert.throws(() => normalizeWhatsApp('00628123456789'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('62081234567890'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('abc081234567890'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('0812'), /belum valid/);
  assert.throws(() => normalizeWhatsApp('081234567890123456'), /belum valid/);
});

test('idempotency keys are bounded and URL-safe', () => {
  assert.equal(isValidIdempotencyKey('123e4567-e89b-42d3-a456-426614174000'), true);
  assert.equal(isValidIdempotencyKey('short'), false);
  assert.equal(isValidIdempotencyKey('key with spaces and symbols !!!!!!'), false);
  assert.equal(isValidIdempotencyKey('x'.repeat(129)), false);
});

test('travel details are normalized and bounded to the current two-stop flow', () => {
  assert.equal(MAX_STOPS, 2);
  const details = normalizeBookingDetails('travel', travelDetails);
  assert.deepEqual(details.originCoordinates, travelDetails.originCoordinates);
  assert.equal(details.destination, 'Senggigi');
  assert.equal(details.estimatedPrice, 300_000);
  assert.equal(details.notes, '');
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, originCoordinates: [-8.65, 115.22] }), /luar Lombok/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, destinationCoordinates: [-8.756283, 116.277145] }), /harus berbeda/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, stops: [] }), /tidak valid/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, pickupTime: '25:00' }), /jam jemput/);
  assert.throws(() => normalizeBookingDetails('travel', { ...travelDetails, originSource: 'gps-spoofed' }), /sumber lokasi/);
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
