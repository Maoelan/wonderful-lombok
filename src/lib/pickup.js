import { isPointInLombokLand } from './lombok-land.js';

export const places = [
  { id: 'airport', name: 'Bandara Internasional Lombok', detail: 'Praya, Lombok Tengah', lat: -8.756283, lng: 116.277145 },
  { id: 'kuta', name: 'Kuta Mandalika', detail: 'Pujut, Lombok Tengah', lat: -8.893241, lng: 116.277504 },
  { id: 'mataram', name: 'Kota Mataram', detail: 'Mataram', lat: -8.583381, lng: 116.11679 },
  { id: 'senggigi', name: 'Senggigi', detail: 'Batu Layar, Lombok Barat', lat: -8.493705, lng: 116.044691 },
  { id: 'bangsal', name: 'Pelabuhan Bangsal', detail: 'Pemenang, Lombok Utara', lat: -8.393852, lng: 116.099492 }
];

const placeNames = {
  en: { airport: 'Lombok International Airport', kuta: 'Kuta Mandalika', mataram: 'Mataram City', senggigi: 'Senggigi', bangsal: 'Bangsal Harbour' },
  'zh-cn': { airport: '龙目国际机场', kuta: '库塔曼达利卡', mataram: '马塔兰市', senggigi: '圣吉吉', bangsal: '邦萨尔港' },
  'zh-tw': { airport: '龍目國際機場', kuta: '庫塔曼達利卡', mataram: '馬塔蘭市', senggigi: '聖吉吉', bangsal: '邦薩爾港' },
  nl: { airport: 'Internationale luchthaven Lombok', kuta: 'Kuta Mandalika', mataram: 'Mataram', senggigi: 'Senggigi', bangsal: 'Haven van Bangsal' },
  fr: { airport: 'Aéroport international de Lombok', kuta: 'Kuta Mandalika', mataram: 'Mataram', senggigi: 'Senggigi', bangsal: 'Port de Bangsal' },
  de: { airport: 'Internationaler Flughafen Lombok', kuta: 'Kuta Mandalika', mataram: 'Mataram', senggigi: 'Senggigi', bangsal: 'Hafen Bangsal' },
  ms: { airport: 'Lapangan Terbang Antarabangsa Lombok', kuta: 'Kuta Mandalika', mataram: 'Bandar Mataram', senggigi: 'Senggigi', bangsal: 'Pelabuhan Bangsal' }
};

export function localizedPlaces(locale) {
  const names = placeNames[locale];
  return names ? places.map((place) => ({ ...place, name: names[place.id] || place.name })) : places;
}

export const lombokBounds = { west: 115.78, south: -9.15, east: 116.82, north: -8.15 };
export const MAX_TRAVEL_POINTS = 2;
// A selected point must be close enough to the road network for a car to reach it.
export const MAX_ROUTE_SNAP_METRES = 250;
const EARTH_RADIUS_METRES = 6_371_000;

export function isInsideLombok(lat, lng) {
  return isPointInLombokLand(lat, lng);
}

export function coordinateDistanceMetres(first, second) {
  if (![first?.lat, first?.lng, second?.lat, second?.lng].every(Number.isFinite)) return Infinity;
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(second.lat - first.lat);
  const longitudeDelta = radians(second.lng - first.lng);
  const startLatitude = radians(first.lat);
  const endLatitude = radians(second.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(haversine));
}

export function isUsableGpsFix(fix, { maxAccuracy = 50, maxAge = 15_000, now = Date.now() } = {}) {
  return isInsideLombok(fix?.lat, fix?.lng)
    && Number.isFinite(fix?.accuracy)
    && fix.accuracy > 0
    && fix.accuracy <= maxAccuracy
    && Number.isFinite(fix?.timestamp)
    && Math.abs(now - fix.timestamp) <= maxAge;
}

export function hasStableGpsFix(fixes, targetAccuracy = 20) {
  const recent = fixes.filter((fix) => isUsableGpsFix(fix, { maxAccuracy: targetAccuracy, maxAge: 15_000 })).slice(-2);
  if (recent.length < 2) return false;
  const tolerance = Math.max(12, recent[0].accuracy, recent[1].accuracy);
  return coordinateDistanceMetres(recent[0], recent[1]) <= tolerance;
}

// Search Box indexes POIs and category terms ("kfc", "pantai") that the
// Geocoding API does not cover. Geocoding is still used as a fallback for
// street addresses that Search Box does not return.
const mapboxSearchBoxTypes = 'poi,address,place,locality,neighborhood,street';
const mapboxGeocodeTypes = 'poi,address,place,locality,neighborhood';

export function mapboxPlaceSearchUrl(query, locale = 'en', token = '') {
  const params = new URLSearchParams({
    access_token: String(token || ''),
    q: String(query || '').trim(),
    country: 'id',
    bbox: `${lombokBounds.west},${lombokBounds.south},${lombokBounds.east},${lombokBounds.north}`,
    proximity: '116.17,-8.65',
    language: mapboxLanguage(locale),
    limit: '8',
    types: mapboxSearchBoxTypes
  });
  return `https://api.mapbox.com/search/searchbox/v1/forward?${params.toString()}`;
}

export function mapboxGeocodePlaceSearchUrl(query, locale = 'en', token = '') {
  const params = new URLSearchParams({
    access_token: String(token || ''),
    autocomplete: 'true',
    country: 'id',
    bbox: `${lombokBounds.west},${lombokBounds.south},${lombokBounds.east},${lombokBounds.north}`,
    proximity: '116.17,-8.65',
    language: mapboxLanguage(locale),
    limit: '8',
    types: mapboxGeocodeTypes
  });
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(String(query || '').trim())}.json?${params.toString()}`;
}

function mapboxPlaceName(name, detail) {
  const label = String(name || '').trim();
  const formatted = String(detail || '').trim();
  return label && formatted && !formatted.toLocaleLowerCase('en').startsWith(label.toLocaleLowerCase('en'))
    ? `${label}, ${formatted}`
    : formatted || label;
}

function uniqueMapboxPlaces(places) {
  const seen = new Set();
  return places.filter((place) => {
    const key = place.placeId || `${place.lat},${place.lng}`;
    if (!place.name || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)
      || !isInsideLombok(place.lat, place.lng) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export function readMapboxPlaceResults(payload) {
  const features = Array.isArray(payload?.features) ? payload.features : [];
  return uniqueMapboxPlaces(features.map((feature) => {
    const properties = feature?.properties || {};
    const coordinates = Array.isArray(feature?.geometry?.coordinates) ? feature.geometry.coordinates : [];
    const placeId = properties.mapbox_id || feature?.id;
    return {
      name: mapboxPlaceName(
        properties.name_preferred || properties.name,
        properties.full_address || properties.address
      ),
      lat: Number(coordinates[1] ?? properties.coordinates?.latitude),
      lng: Number(coordinates[0] ?? properties.coordinates?.longitude),
      placeId: placeId ? String(placeId) : null
    };
  }));
}

export function readMapboxGeocodePlaceResults(payload) {
  const features = Array.isArray(payload?.features) ? payload.features : [];
  return uniqueMapboxPlaces(features.map((feature) => {
    const center = Array.isArray(feature?.center) ? feature.center : feature?.geometry?.coordinates;
    return {
      name: mapboxPlaceName(feature?.text, feature?.place_name),
      lat: Number(center?.[1]),
      lng: Number(center?.[0]),
      placeId: feature?.id ? String(feature.id) : null
    };
  }));
}

export function mapboxRouteUrl(stops, locale = 'en', token = '') {
  if (!Array.isArray(stops) || stops.length !== 2) throw new Error('A route needs exactly two points.');
  const coordinates = stops.map((stop) => `${stop.lng},${stop.lat}`).join(';');
  const params = new URLSearchParams({
    access_token: String(token || ''),
    alternatives: 'false',
    geometries: 'geojson',
    overview: 'full',
    steps: 'true',
    exclude: 'ferry',
    language: mapboxLanguage(locale)
  });
  return `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${params.toString()}`;
}

export function readMapboxRoute(payload, notFoundMessage = 'Rute jalan tidak ditemukan.', stops = []) {
  const route = payload?.routes?.[0];
  const distanceMeters = Number(route?.distance);
  const coordinates = Array.isArray(route?.geometry?.coordinates) ? route.geometry.coordinates : [];
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || coordinates.length < 2) throw new Error(notFoundMessage);
  const points = coordinates.map((coordinate) => {
    const lng = Number(coordinate?.[0]);
    const lat = Number(coordinate?.[1]);
    return [lat, lng];
  }).filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  if (points.length < 2) throw new Error(notFoundMessage);
  const seconds = Number(route?.duration);
  const steps = (Array.isArray(route?.legs) ? route.legs : []).flatMap((leg) => (Array.isArray(leg?.steps) ? leg.steps : []));
  const roadAccess = steps.length > 0 && steps.every((step) => {
    const mode = String(step?.mode || '').toLowerCase();
    const maneuver = String(step?.maneuver?.type || '').toLowerCase();
    return mode === 'driving' && maneuver !== 'ferry' && maneuver !== 'ferry_train';
  });
  const waypoints = Array.isArray(payload?.waypoints) ? payload.waypoints : [];
  const endpoint = (index) => {
    const location = waypoints[index]?.location;
    if (Array.isArray(location)) {
      const lng = Number(location[0]);
      const lat = Number(location[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    const point = index === 0 ? points[0] : points[points.length - 1];
    return point ? { lat: point[0], lng: point[1] } : null;
  };
  const snapFor = (index) => {
    if (!stops[index]) return 0;
    const reported = Number(waypoints[index]?.distance);
    const hasReported = waypoints[index]?.distance !== undefined && waypoints[index]?.distance !== null && Number.isFinite(reported);
    const snapped = endpoint(index);
    const computed = snapped ? coordinateDistanceMetres(stops[index], snapped) : 0;
    return Math.max(hasReported ? reported : 0, computed);
  };
  const snapDistanceM = stops.length === 2 ? Math.max(snapFor(0), snapFor(1)) : 0;
  return {
    // Keep the raw road distance so callers can enforce a minimum before
    // rounding up to billable kilometres.
    distanceMeters,
    distanceKm: Math.max(1, Math.ceil(distanceMeters / 1000)),
    points,
    durationMinutes: Number.isFinite(seconds) && seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : null,
    snapDistanceM,
    roadAccess
  };
}

export function travelStopsFromDetails(details) {
  if (Array.isArray(details?.stops) && details.stops.length) {
    return details.stops.map((stop) => ({
      name: String(stop?.name || '').trim(),
      lat: Number(stop?.coordinates?.[0] ?? stop?.lat),
      lng: Number(stop?.coordinates?.[1] ?? stop?.lng)
    }));
  }
  if (Array.isArray(details?.originCoordinates) && Array.isArray(details?.destinationCoordinates)) {
    return [
      { name: String(details.origin || '').trim(), lat: Number(details.originCoordinates[0]), lng: Number(details.originCoordinates[1]) },
      { name: String(details.destination || '').trim(), lat: Number(details.destinationCoordinates[0]), lng: Number(details.destinationCoordinates[1]) }
    ];
  }
  return [];
}

export function calculatePickupPrice(distanceKm, rate = 10_000) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.ceil(distanceKm) * rate;
}

export function estimateLabel({ loading = false, error = '', ready = false, price = 0, format = (value) => String(value), calculating = '…', empty = '—' } = {}) {
  if (loading) return calculating;
  if (error) return '—';
  if (!ready) return empty;
  return format(price);
}

const mapboxLanguages = {
  id: 'id', en: 'en', 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', nl: 'nl', fr: 'fr', de: 'de', ms: 'ms'
};

export function mapboxLanguage(locale) {
  return mapboxLanguages[locale] || 'en';
}
