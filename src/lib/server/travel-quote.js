import { calculatePickupPrice, travelStopsFromDetails } from '../pickup.js';
import { isBookableTransferDistance, MIN_TRANSFER_DISTANCE_LABEL } from '../travel-rules.js';
import { getRoadRoute as getMapboxRoadRoute } from './map-providers/index.js';
import { TravelQuoteError } from './travel-quote-error.js';

export { TravelQuoteError };

export async function getRoadRoute(stops, locale = 'id', options = {}) {
  return getMapboxRoadRoute(stops, locale, options);
}

export async function getTravelQuote(details, rate, options = {}) {
  const travelRate = Number(rate);
  if (!Number.isFinite(travelRate) || travelRate <= 0) {
    throw new TravelQuoteError('Tarif travel belum dikonfigurasi.');
  }

  const stops = travelStopsFromDetails(details);
  const route = await getRoadRoute(stops, details.locale ?? 'id', options);
  if (!route.distanceKm) {
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422);
  }
  if (!isBookableTransferDistance(route.distanceMeters)) {
    throw new TravelQuoteError(
      `Rute terlalu dekat untuk layanan travel. Jarak minimum ${MIN_TRANSFER_DISTANCE_LABEL}.`,
      422,
      'route_too_short'
    );
  }

  return {
    distanceMeters: route.distanceMeters,
    distanceKm: route.distanceKm,
    durationMinutes: route.durationMinutes,
    estimatedPrice: calculatePickupPrice(route.distanceKm, travelRate),
    travelRate
  };
}
