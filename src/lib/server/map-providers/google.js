import { MAX_ROUTE_SNAP_METRES, MAX_TRAVEL_POINTS, googlePlaceSearchBody, googleRouteBody, readGooglePlaceResults, readGoogleRoute } from '../../pickup.js';
import { fetchWithRetry } from '../upstream.js';
import { TravelQuoteError } from '../travel-quote-error.js';

export const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
export const GOOGLE_ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
export const GOOGLE_ROUTE_FIELD_MASK = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.polyline.encodedPolyline',
  'routes.legs.startLocation.latLng',
  'routes.legs.endLocation.latLng',
  'routes.legs.steps.travelMode',
  'routes.legs.steps.navigationInstruction.maneuver'
].join(',');

export async function searchPlaces(query, locale = 'en', {
  apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY,
  fetchImpl = globalThis.fetch,
  timeoutMs = 8_000,
  retries = 1,
  retryDelayMs = 100
} = {}) {
  if (!apiKey) throw new TravelQuoteError('Layanan peta belum dikonfigurasi. Hubungi admin.', 503, 'not_configured');

  let response;
  try {
    response = await fetchWithRetry(GOOGLE_PLACES_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
        'x-goog-fieldmask': 'places.id,places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify(googlePlaceSearchBody(query, locale))
    }, { fetchImpl, timeoutMs, retries, retryDelayMs });
  } catch {
    throw new TravelQuoteError('Layanan peta sedang tidak tersedia. Coba lagi.', 502, 'network');
  }

  if (response.status === 401 || response.status === 403) throw new TravelQuoteError('Layanan peta belum dikonfigurasi. Hubungi admin.', 503, 'permission_denied');
  if (response.status === 429) throw new TravelQuoteError('Layanan peta sedang sibuk. Coba lagi sebentar.', 503, 'quota_exceeded');
  if (response.status >= 500) throw new TravelQuoteError('Layanan peta sedang tidak tersedia. Coba lagi.', 502, 'network');

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new TravelQuoteError('Layanan peta sedang tidak tersedia. Coba lagi.', 502, 'network');
  }
  if (!response.ok) throw new TravelQuoteError('Pencarian tempat gagal.', 502, 'search_failed');
  return readGooglePlaceResults(payload);
}

export async function getRoadRoute(stops, locale = 'id', {
  apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY,
  fetchImpl = globalThis.fetch,
  timeoutMs = 10_000,
  retries = 1,
  retryDelayMs = 100
} = {}) {
  if (!apiKey) throw new TravelQuoteError('Layanan rute belum dikonfigurasi. Hubungi admin.', 503, 'not_configured');
  if (!Array.isArray(stops) || stops.length !== MAX_TRAVEL_POINTS) {
    throw new TravelQuoteError('Jumlah titik perjalanan tidak valid.', 400, 'invalid_points');
  }

  let response;
  try {
    response = await fetchWithRetry(GOOGLE_ROUTES_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
        'x-goog-fieldmask': GOOGLE_ROUTE_FIELD_MASK
      },
      body: JSON.stringify(googleRouteBody(stops, locale))
    }, { fetchImpl, timeoutMs, retries, retryDelayMs });
  } catch {
    throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 503, 'network');
  }

  if (response.status === 401 || response.status === 403) throw new TravelQuoteError('Layanan rute belum dikonfigurasi. Hubungi admin.', 503, 'permission_denied');
  if (response.status === 429) throw new TravelQuoteError('Layanan rute sedang sibuk. Coba lagi sebentar.', 503, 'quota_exceeded');
  if (response.status >= 500) throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 503, 'network');

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new TravelQuoteError('Layanan rute sedang tidak tersedia. Coba lagi.', 502, 'network');
  }
  if (!response.ok) {
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422, 'not_found');
  }

  try {
    const route = readGoogleRoute(payload, 'Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', stops);
    if (!route.roadAccess) {
      throw new TravelQuoteError('Rute ini tidak memiliki akses jalan darat. Pilih titik lain di dekat jalan.', 422, 'no_road_access');
    }
    if (route.snapDistanceM > MAX_ROUTE_SNAP_METRES) {
      throw new TravelQuoteError('Titik jemput atau tujuan terlalu jauh dari jalan. Pilih titik lain di dekat jalan.', 422, 'no_road_access');
    }
    return route;
  } catch (error) {
    if (error instanceof TravelQuoteError) throw error;
    throw new TravelQuoteError('Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', 422, 'not_found');
  }
}
