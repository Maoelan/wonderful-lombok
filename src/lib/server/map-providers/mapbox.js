import { MAX_ROUTE_SNAP_METRES, MAX_TRAVEL_POINTS, mapboxPlaceSearchUrl, mapboxRouteUrl, readMapboxPlaceResults, readMapboxRoute } from '../../pickup.js';
import { fetchWithRetry } from '../upstream.js';
import { TravelQuoteError } from '../travel-quote-error.js';

export async function searchPlaces(query, locale = 'en', {
  token = process.env.MAPBOX_SERVER_TOKEN,
  fetchImpl = globalThis.fetch,
  timeoutMs = 8_000,
  retries = 1,
  retryDelayMs = 100
} = {}) {
  if (!token) throw new TravelQuoteError('Layanan peta belum dikonfigurasi. Hubungi admin.', 503, 'not_configured');

  let response;
  try {
    response = await fetchWithRetry(mapboxPlaceSearchUrl(query, locale, token), {
      method: 'GET'
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
  return readMapboxPlaceResults(payload);
}

export async function getRoadRoute(stops, locale = 'id', {
  token = process.env.MAPBOX_SERVER_TOKEN,
  fetchImpl = globalThis.fetch,
  timeoutMs = 10_000,
  retries = 1,
  retryDelayMs = 100
} = {}) {
  if (!token) throw new TravelQuoteError('Layanan rute belum dikonfigurasi. Hubungi admin.', 503, 'not_configured');
  if (!Array.isArray(stops) || stops.length !== MAX_TRAVEL_POINTS) {
    throw new TravelQuoteError('Jumlah titik perjalanan tidak valid.', 400, 'invalid_points');
  }

  let response;
  try {
    response = await fetchWithRetry(mapboxRouteUrl(stops, locale, token), {
      method: 'GET'
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
    const route = readMapboxRoute(payload, 'Rute perjalanan tidak ditemukan. Periksa titik jemput dan tujuan.', stops);
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
