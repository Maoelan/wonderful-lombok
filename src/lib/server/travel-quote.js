import { calculatePickupPrice, readRoadRoute, roadRouteUrl } from '../pickup.js';
import { fetchWithRetry } from './upstream.js';

export class TravelQuoteError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = 'TravelQuoteError';
    this.status = status;
  }
}

export async function getTravelQuote(details, rate, { fetchImpl = globalThis.fetch, timeoutMs = 10_000, retries = 1, retryDelayMs = 100 } = {}) {
  const travelRate = Number(rate);
  if (!Number.isFinite(travelRate) || travelRate <= 0) {
    throw new TravelQuoteError('Tarif travel belum dikonfigurasi.');
  }

  const [fromLat, fromLng] = details.originCoordinates;
  const [toLat, toLng] = details.destinationCoordinates;
  const url = roadRouteUrl({
    from: { lat: fromLat, lng: fromLng },
    to: { lat: toLat, lng: toLng },
    fromAccuracy: details.originAccuracyM
  });

  let response;
  try {
    response = await fetchWithRetry(url, {}, { fetchImpl, timeoutMs, retries, retryDelayMs });
  } catch {
    throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 503);
  }
  if (response.status === 429 || response.status >= 500) {
    throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 503);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 502);
  }
  if (!response.ok || payload?.code !== 'Ok') {
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422);
  }

  let route;
  try {
    route = readRoadRoute(payload, 'Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.');
  } catch {
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422);
  }
  if (!route.distanceKm) {
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422);
  }

  return {
    distanceKm: route.distanceKm,
    estimatedPrice: calculatePickupPrice(route.distanceKm, travelRate),
    travelRate
  };
}
