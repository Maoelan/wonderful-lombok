import { MAX_TRAVEL_POINTS, isInsideLombok } from '../pickup.js';
import { isLocale } from '../i18n.js';
import { todayInWita } from '../date.js';

export { todayInWita };

export const MAX_STOPS = MAX_TRAVEL_POINTS;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_DETAIL_LENGTH = 4000;
export const MAX_TRAVEL_DISTANCE_KM = 500;
export const MAX_TRAVEL_PRICE = 20_000_000;

const TRAVEL_DETAIL_KEYS = new Set([
  'notes', 'origin', 'destination', 'originCoordinates', 'originAccuracyM', 'originSource',
  'destinationCoordinates', 'stops', 'pickupTime', 'distanceKm', 'estimatedPrice', 'locale'
]);
const COMMON_DETAIL_KEYS = new Set(['notes']);
const ORIGIN_SOURCES = new Set(['search', 'map', 'gps', 'preset']);

export class BookingValidationError extends Error {
  constructor(message, status = 400, code = 'invalid') {
    super(message);
    this.name = 'BookingValidationError';
    this.status = status;
    this.code = code;
  }
}

const fail = (message, status = 400, code = 'invalid') => { throw new BookingValidationError(message, status, code); };

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value, label, maxLength) {
  if (typeof value !== 'string') fail(`Detail pemesanan tidak valid: ${label}.`);
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maxLength) fail(`Detail pemesanan tidak valid: ${label}.`);
  return cleaned;
}

function optionalNotes(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') fail('Detail pemesanan tidak valid: catatan.');
  const notes = value.trim();
  if (notes.length > MAX_NOTES_LENGTH) fail('Detail pemesanan terlalu panjang.');
  return notes;
}

function coordinatePair(value, label) {
  if (!Array.isArray(value) || value.length !== 2) fail(`Detail pemesanan tidak valid: ${label}.`);
  const [lat, lng] = value;
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    fail(`Detail pemesanan tidak valid: ${label}.`);
  }
  if (!isInsideLombok(lat, lng)) fail('Titik jemput atau tujuan berada di luar Lombok.');
  return [lat, lng];
}

function positiveInteger(value, label, maximum) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) fail(`Detail pemesanan tidak valid: ${label}.`);
  return value;
}

export function isValidTravelDate(value, now = Date.now()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return false;
  return value >= todayInWita(now);
}

function witaTimestamp(date, time) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN;
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const timestamp = Date.UTC(year, month - 1, day, hour - 8, minute);
  const wita = new Date(timestamp + 8 * 60 * 60_000);
  if (wita.getUTCFullYear() !== year || wita.getUTCMonth() !== month - 1 || wita.getUTCDate() !== day || wita.getUTCHours() !== hour || wita.getUTCMinutes() !== minute) return NaN;
  return timestamp;
}

export function isValidPickupDateTime(date, time, now = Date.now()) {
  const timestamp = witaTimestamp(date, time);
  return Number.isFinite(timestamp) && timestamp >= now;
}

export function normalizeWhatsApp(value) {
  const invalid = () => fail('Nama dan nomor WhatsApp belum valid.', 400, 'contact');
  const textValue = typeof value === 'string' ? value.trim() : '';
  if (!textValue || !/^\+?[\d\s().-]+$/.test(textValue)) invalid();
  const digits = textValue.replace(/\D/g, '');
  if (digits.startsWith('00')) invalid();
  const normalized = textValue.startsWith('+') || digits.startsWith('62')
    ? digits
    : digits.startsWith('0') ? `62${digits.slice(1)}`
    : digits.startsWith('8') ? `62${digits}`
    : '';
  const valid = normalized.startsWith('62') ? /^628\d{7,12}$/.test(normalized) : /^[1-9]\d{7,14}$/.test(normalized);
  if (!valid) invalid();
  return normalized;
}

export function isValidIdempotencyKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

function normalizeTravelStops(details) {
  let stops;
  if (details.stops !== undefined) {
    if (!Array.isArray(details.stops) || details.stops.length < 2 || details.stops.length > MAX_STOPS) {
      fail(`Jumlah titik perjalanan harus tepat ${MAX_STOPS}.`);
    }
    stops = details.stops.map((stop, index) => {
      if (!isPlainObject(stop)) fail(`Detail pemesanan tidak valid: lokasi ${index + 1}.`);
      return {
        name: text(stop.name, `lokasi ${index + 1}`, 160),
        coordinates: coordinatePair(stop.coordinates, `koordinat lokasi ${index + 1}`)
      };
    });
  } else {
    stops = [
      { name: text(details.origin, 'titik jemput', 160), coordinates: coordinatePair(details.originCoordinates, 'koordinat jemput') },
      { name: text(details.destination, 'tujuan', 160), coordinates: coordinatePair(details.destinationCoordinates, 'koordinat tujuan') }
    ];
  }

  const seen = new Set();
  for (const stop of stops) {
    const key = `${stop.coordinates[0].toFixed(6)},${stop.coordinates[1].toFixed(6)}`;
    if (seen.has(key)) fail('Titik perjalanan harus berbeda.');
    seen.add(key);
  }
  return stops;
}

export function normalizeBookingDetails(serviceType, details) {
  if (!isPlainObject(details)) fail('Detail pemesanan tidak valid.');
  const allowed = serviceType === 'travel' ? TRAVEL_DETAIL_KEYS : COMMON_DETAIL_KEYS;
  if (Object.keys(details).some((key) => !allowed.has(key))) fail('Detail pemesanan tidak valid.');
  if (JSON.stringify(details).length > MAX_DETAIL_LENGTH) fail('Detail pemesanan terlalu panjang.');

  const notes = optionalNotes(details.notes);
  if (serviceType !== 'travel') return { notes };

  const stops = normalizeTravelStops(details);
  const origin = stops[0].name;
  const destination = stops.at(-1).name;
  const originCoordinates = stops[0].coordinates;
  const destinationCoordinates = stops.at(-1).coordinates;

  let originAccuracyM = null;
  if (details.originAccuracyM !== undefined && details.originAccuracyM !== null) {
    if (typeof details.originAccuracyM !== 'number' || !Number.isFinite(details.originAccuracyM) || details.originAccuracyM < 0 || details.originAccuracyM > 1000) {
      fail('Detail pemesanan tidak valid: akurasi lokasi.');
    }
    originAccuracyM = details.originAccuracyM;
  }

  const originSource = details.originSource ?? 'search';
  if (typeof originSource !== 'string' || !ORIGIN_SOURCES.has(originSource)) {
    fail('Detail pemesanan tidak valid: sumber lokasi.');
  }
  if (typeof details.pickupTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(details.pickupTime)) {
    fail('Detail pemesanan tidak valid: jam jemput.');
  }
  const distanceKm = positiveInteger(details.distanceKm, 'jarak', MAX_TRAVEL_DISTANCE_KM);
  const estimatedPrice = positiveInteger(details.estimatedPrice, 'harga', MAX_TRAVEL_PRICE);
  const locale = details.locale ?? 'id';
  if (typeof locale !== 'string' || !isLocale(locale)) fail('Detail pemesanan tidak valid: bahasa.');

  return {
    notes,
    origin,
    destination,
    originCoordinates,
    originAccuracyM,
    originSource,
    destinationCoordinates,
    stops,
    pickupTime: details.pickupTime,
    distanceKm,
    estimatedPrice,
    locale
  };
}

export function verifyTravelQuote(details, quote) {
  if (!quote || details.distanceKm !== quote.distanceKm || details.estimatedPrice !== quote.estimatedPrice) {
    fail('Harga atau jarak perjalanan sudah berubah. Silakan hitung ulang.', 409, 'conflict');
  }
}
