import { isInsideLombok } from '../pickup.js';
import { isLocale } from '../i18n.js';
import { todayInWita } from '../date.js';

export { todayInWita };

export const MAX_STOPS = 2;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_DETAIL_LENGTH = 4000;
export const MAX_TRAVEL_DISTANCE_KM = 500;
export const MAX_TRAVEL_PRICE = 20_000_000;

const TRAVEL_DETAIL_KEYS = new Set([
  'notes', 'origin', 'destination', 'originCoordinates', 'originAccuracyM', 'originSource',
  'destinationCoordinates', 'pickupTime', 'distanceKm', 'estimatedPrice', 'locale'
]);
const COMMON_DETAIL_KEYS = new Set(['notes']);
const ORIGIN_SOURCES = new Set(['search', 'map', 'gps', 'preset']);

export class BookingValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'BookingValidationError';
    this.status = status;
  }
}

const fail = (message, status = 400) => { throw new BookingValidationError(message, status); };

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

export function normalizeWhatsApp(value) {
  const textValue = typeof value === 'string' ? value.trim() : '';
  if (!textValue || !/^\+?[\d\s().-]+$/.test(textValue)) {
    fail('Nama dan nomor WhatsApp belum valid.');
  }
  const digits = textValue.replace(/\D/g, '');
  if (digits.startsWith('00')) fail('Nama dan nomor WhatsApp belum valid.');
  const normalized = digits.startsWith('62') ? digits : digits.startsWith('0') ? `62${digits.slice(1)}` : '';
  if (!/^628\d{7,12}$/.test(normalized)) fail('Nama dan nomor WhatsApp belum valid.');
  return normalized;
}

export function isValidIdempotencyKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

export function normalizeBookingDetails(serviceType, details) {
  if (!isPlainObject(details)) fail('Detail pemesanan tidak valid.');
  const allowed = serviceType === 'travel' ? TRAVEL_DETAIL_KEYS : COMMON_DETAIL_KEYS;
  if (Object.keys(details).some((key) => !allowed.has(key))) fail('Detail pemesanan tidak valid.');
  if (JSON.stringify(details).length > MAX_DETAIL_LENGTH) fail('Detail pemesanan terlalu panjang.');

  const notes = optionalNotes(details.notes);
  if (serviceType !== 'travel') return { notes };

  const origin = text(details.origin, 'titik jemput', 160);
  const destination = text(details.destination, 'tujuan', 160);
  const originCoordinates = coordinatePair(details.originCoordinates, 'koordinat jemput');
  const destinationCoordinates = coordinatePair(details.destinationCoordinates, 'koordinat tujuan');
  if (originCoordinates[0] === destinationCoordinates[0] && originCoordinates[1] === destinationCoordinates[1]) {
    fail('Titik jemput dan tujuan harus berbeda.');
  }

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
    pickupTime: details.pickupTime,
    distanceKm,
    estimatedPrice,
    locale
  };
}

export function verifyTravelQuote(details, quote) {
  if (!quote || details.distanceKm !== quote.distanceKm || details.estimatedPrice !== quote.estimatedPrice) {
    fail('Harga atau jarak perjalanan sudah berubah. Silakan hitung ulang.', 409);
  }
}
