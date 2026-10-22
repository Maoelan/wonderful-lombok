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

export function googlePlaceSearchBody(query, locale = 'en') {
  return {
    textQuery: String(query || '').trim(),
    languageCode: googleMapsLanguage(locale),
    regionCode: 'ID',
    maxResultCount: 8,
    locationRestriction: {
      rectangle: {
        low: { latitude: lombokBounds.south, longitude: lombokBounds.west },
        high: { latitude: lombokBounds.north, longitude: lombokBounds.east }
      }
    }
  };
}

export function readGooglePlaceResults(payload) {
  const seen = new Set();
  return (Array.isArray(payload?.places) ? payload.places : []).map((place) => {
    const display = String(place?.displayName?.text || '').trim();
    const formatted = String(place?.formattedAddress || '').trim();
    const name = display && formatted && !formatted.toLocaleLowerCase('en').startsWith(display.toLocaleLowerCase('en'))
      ? `${display}, ${formatted}`
      : formatted || display;
    const lat = Number(place?.location?.latitude);
    const lng = Number(place?.location?.longitude);
    return { name, lat, lng, placeId: place?.id ? String(place.id) : null };
  }).filter((place) => {
    const key = place.placeId || `${place.lat},${place.lng}`;
    if (!place.name || !isInsideLombok(place.lat, place.lng) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export function googleRouteBody(stops, locale = 'en') {
  if (!Array.isArray(stops) || stops.length !== 2) throw new Error('A route needs exactly two points.');
  const [origin, destination] = stops;
  const point = (stop) => ({ location: { latLng: { latitude: stop.lat, longitude: stop.lng } } });
  return {
    origin: point(origin),
    destination: point(destination),
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
    routeModifiers: { avoidFerries: true },
    polylineQuality: 'OVERVIEW',
    languageCode: googleMapsLanguage(locale),
    units: 'METRIC'
  };
}

export function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      if (index >= encoded.length) throw new Error('Invalid encoded polyline.');
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude += (result & 1) ? ~(result >> 1) : (result >> 1);
    result = 0;
    shift = 0;
    do {
      if (index >= encoded.length) throw new Error('Invalid encoded polyline.');
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push([latitude / 1e5, longitude / 1e5]);
  }
  return points;
}

export function readGoogleRoute(payload, notFoundMessage = 'Rute jalan tidak ditemukan.', stops = []) {
  const route = payload?.routes?.[0];
  const distanceMeters = Number(route?.distanceMeters);
  const encoded = route?.polyline?.encodedPolyline;
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || !encoded) throw new Error(notFoundMessage);
  const points = decodePolyline(encoded);
  const seconds = Number(String(route?.duration || '').replace(/s$/, ''));
  const legs = Array.isArray(route?.legs) ? route.legs : [];
  const steps = legs.flatMap((leg) => (Array.isArray(leg?.steps) ? leg.steps : []));
  const roadAccess = steps.length > 0 && steps.every((step) => {
    const maneuver = step?.navigationInstruction?.maneuver;
    return step?.travelMode === 'DRIVE' && maneuver !== 'FERRY' && maneuver !== 'FERRY_TRAIN';
  });
  const latLng = (location) => {
    const lat = Number(location?.latLng?.latitude);
    const lng = Number(location?.latLng?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  };
  const first = latLng(legs[0]?.startLocation)
    ?? (points.length >= 2 ? { lat: points[0][0], lng: points[0][1] } : null);
  const last = latLng(legs[legs.length - 1]?.endLocation)
    ?? (points.length >= 2 ? { lat: points[points.length - 1][0], lng: points[points.length - 1][1] } : null);
  const snapDistanceM = stops.length === 2 && first && last
    ? Math.max(coordinateDistanceMetres(stops[0], first), coordinateDistanceMetres(stops[1], last))
    : 0;
  return {
    distanceKm: Math.max(1, Math.ceil(distanceMeters / 1000)),
    points,
    durationMinutes: Number.isFinite(seconds) && seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : null,
    snapDistanceM,
    roadAccess
  };
}

export function mapboxPlaceSearchUrl(query, locale = 'en', token = '') {
  const params = new URLSearchParams({
    access_token: String(token || ''),
    autocomplete: 'true',
    country: 'id',
    bbox: `${lombokBounds.west},${lombokBounds.south},${lombokBounds.east},${lombokBounds.north}`,
    proximity: '116.17,-8.65',
    language: mapboxLanguage(locale),
    limit: '8',
    types: 'poi,address,place,locality,neighborhood'
  });
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(String(query || '').trim())}.json?${params.toString()}`;
}

export function readMapboxPlaceResults(payload) {
  const seen = new Set();
  return (Array.isArray(payload?.features) ? payload.features : []).map((feature) => {
    const text = String(feature?.text || '').trim();
    const formatted = String(feature?.place_name || '').trim();
    const name = text && formatted && !formatted.toLocaleLowerCase('en').startsWith(text.toLocaleLowerCase('en'))
      ? `${text}, ${formatted}`
      : formatted || text;
    const center = Array.isArray(feature?.center) ? feature.center : feature?.geometry?.coordinates;
    const lng = Number(center?.[0]);
    const lat = Number(center?.[1]);
    return { name, lat, lng, placeId: feature?.id ? String(feature.id) : null };
  }).filter((place) => {
    const key = place.placeId || `${place.lat},${place.lng}`;
    if (!place.name || !isInsideLombok(place.lat, place.lng) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
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

export function estimateLabel({ loading = false, error = '', ready = false, price = 0, format = (value) => String(value), calculating = '…' } = {}) {
  if (loading) return calculating;
  if (error || !ready) return '—';
  return format(price);
}

const googleLanguages = {
  id: 'id', en: 'en', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', nl: 'nl', fr: 'fr', de: 'de', ms: 'ms'
};

export function googleMapsLanguage(locale) {
  return googleLanguages[locale] || 'en';
}

const mapboxLanguages = {
  id: 'id', en: 'en', 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', nl: 'nl', fr: 'fr', de: 'de', ms: 'ms'
};

export function mapboxLanguage(locale) {
  return mapboxLanguages[locale] || 'en';
}
