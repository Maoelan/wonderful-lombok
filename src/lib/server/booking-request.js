import {
  BookingValidationError,
  isValidIdempotencyKey,
  isValidPickupDateTime,
  isValidTravelDate,
  normalizeBookingDetails,
  normalizeWhatsApp,
  verifyTravelQuote
} from './booking-validation.js';
import { TravelQuoteError, getTravelQuote } from './travel-quote.js';

const failure = (message, status = 400) => ({ status, body: { error: message } });

function bookingFailure(error) {
  if (error instanceof BookingValidationError || error instanceof TravelQuoteError) return failure(error.message, error.status);
  return failure('Pemesanan belum dapat disimpan. Coba lagi.', 503);
}

export async function createBookingRequest({
  body,
  idempotencyKey,
  fetchImpl = globalThis.fetch,
  googleMapsApiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY,
  loadCatalog,
  saveBooking,
  rentalEnabled = false,
  now = Date.now()
}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return failure('Data pemesanan tidak valid.');
  if (body.website !== undefined && body.website !== null && String(body.website).trim()) return failure('Data pemesanan tidak valid.');
  if (!isValidIdempotencyKey(idempotencyKey)) return failure('Permintaan pemesanan tidak valid.');

  let whatsapp;
  try { whatsapp = normalizeWhatsApp(body.whatsapp); } catch (error) { return bookingFailure(error); }
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 100) return failure('Nama dan nomor WhatsApp belum valid.');

  const allowed = ['wisata', 'travel', ...(rentalEnabled ? ['rental'] : [])];
  if (!allowed.includes(body.serviceType)) return failure('Jenis layanan tidak valid.');
  const serviceName = typeof body.serviceName === 'string' ? body.serviceName.trim() : '';
  if (!serviceName || serviceName.length > 120) return failure('Jenis layanan tidak valid.');

  if (!isValidTravelDate(body.travelDate, now)) return failure('Tanggal perjalanan tidak valid.');
  if (typeof body.people !== 'number' || !Number.isInteger(body.people) || body.people < 1 || body.people > 50) {
    return failure('Jumlah peserta tidak valid.');
  }

  let details;
  try { details = normalizeBookingDetails(body.serviceType, body.details); } catch (error) { return bookingFailure(error); }

  if (body.serviceType === 'travel' && !isValidPickupDateTime(body.travelDate, details.pickupTime, now)) {
    return failure('Jam jemput sudah lewat. Pilih waktu lain.');
  }

  if (body.serviceType === 'travel') {
    let quote;
    try {
      const catalog = await loadCatalog();
      quote = await getTravelQuote(details, catalog?.travelRate, { fetchImpl, apiKey: googleMapsApiKey });
      verifyTravelQuote(details, quote);
    } catch (error) {
      return bookingFailure(error);
    }
    details = {
      ...details,
      distanceKm: quote.distanceKm,
      durationMinutes: quote.durationMinutes,
      estimatedPrice: quote.estimatedPrice,
      travelRate: quote.travelRate
    };
  }

  try {
    const saved = await saveBooking({
      serviceType: body.serviceType,
      serviceName,
      travelDate: body.travelDate,
      name,
      whatsapp,
      people: body.people,
      details,
      idempotencyKey
    });
    if (saved?.conflict) return failure('Permintaan pemesanan tidak konsisten. Silakan coba lagi.', 409);
    const code = typeof saved === 'string' ? saved : saved?.code;
    if (!code) return failure('Pemesanan belum dapat disimpan. Coba lagi.', 503);
    return { status: 201, body: { code } };
  } catch {
    return failure('Pemesanan belum dapat disimpan. Coba lagi.', 503);
  }
}
