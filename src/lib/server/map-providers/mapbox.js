import {
  MAX_ROUTE_SNAP_METRES,
  MAX_TRAVEL_POINTS,
  mapboxGeocodePlaceSearchUrl,
  mapboxPlaceSearchUrl,
  mapboxRouteUrl,
  readMapboxGeocodePlaceResults,
  readMapboxPlaceResults,
  readMapboxRoute
} from '../../pickup.js';
import { fetchWithRetry } from '../upstream.js';
import { TravelQuoteError } from '../travel-quote-error.js';

function placeSearchError(code) {
  if (code === 'permission_denied') return new TravelQuoteError('Layanan peta belum dikonfigurasi. Hubungi admin.', 503, 'permission_denied');
  if (code === 'quota_exceeded') return new TravelQuoteError('Layanan peta sedang sibuk. Coba lagi sebentar.', 503, 'quota_exceeded');
  if (code === 'network') return new TravelQuoteError('Layanan peta sedang tidak tersedia. Coba lagi.', 502, 'network');
  return new TravelQuoteError('Pencarian tempat gagal.', 502, 'search_failed');
}

async function fetchPlaces(url, readResults, options) {
  let response;
  try {
    response = await fetchWithRetry(url, { method: 'GET' }, options);
  } catch {
    return { error: 'network' };
  }

  if (response.status === 401 || response.status === 403) return { error: 'permission_denied' };
  if (response.status === 429) return { error: 'quota_exceeded' };
  if (response.status >= 500) return { error: 'network' };

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { error: 'network' };
  }
  if (!response.ok) return { error: 'search_failed' };
  return { results: readResults(payload) };
}

export async function searchPlaces(query, locale = 'en', {
  token = process.env.MAPBOX_SERVER_TOKEN || process.env.PUBLIC_MAPBOX_TOKEN,
  fetchImpl = globalThis.fetch,
  timeoutMs = 8_000,
  retries = 1,
  retryDelayMs = 100
} = {}) {
  if (!token) throw new TravelQuoteError('Layanan peta belum dikonfigurasi. Hubungi admin.', 503, 'not_configured');
  const requestOptions = { fetchImpl, timeoutMs, retries, retryDelayMs };

  const searchBox = await fetchPlaces(mapboxPlaceSearchUrl(query, locale, token), readMapboxPlaceResults, requestOptions);
  if (searchBox.error === 'quota_exceeded' || searchBox.error === 'network') throw placeSearchError(searchBox.error);
  if (searchBox.results?.length) return searchBox.results;

  // Search Box does not index every street address, so an empty result set is
  // retried against Geocoding v5. A missing Search Box scope is also tolerated
  // when Geocoding is still available.
  const geocode = await fetchPlaces(mapboxGeocodePlaceSearchUrl(query, locale, token), readMapboxGeocodePlaceResults, requestOptions);
  if (geocode.results) return geocode.results;
  if (geocode.error === 'quota_exceeded' || geocode.error === 'network') throw placeSearchError(geocode.error);
  throw placeSearchError(searchBox.error === 'permission_denied' ? searchBox.error : geocode.error);
}

export async function getRoadRoute(stops, locale = 'id', {
  token = process.env.MAPBOX_SERVER_TOKEN || process.env.PUBLIC_MAPBOX_TOKEN,
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
