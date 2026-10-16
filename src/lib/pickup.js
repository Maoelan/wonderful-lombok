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
const EARTH_RADIUS_METRES = 6_371_000;

export function placeSearchQueries(value) {
  const query = String(value || '').trim().replace(/\s+/g, ' ');
  if (!query) return [];
  const compact = query.replace(/\s+/g, '');
  return compact === query ? [query] : [query, compact];
}

export function readPlaceSearchResults(payload) {
  const seen = new Set();
  return (Array.isArray(payload) ? payload : []).flat().map((item) => ({
    name: String(item?.display_name || '').trim(),
    lat: Number(item?.lat),
    lng: Number(item?.lon)
  })).filter((item) => {
    const key = `${item.lat},${item.lng}`;
    if (!item.name || !isInsideLombok(item.lat, item.lng) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export function isInsideLombok(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= lombokBounds.south && lat <= lombokBounds.north && lng >= lombokBounds.west && lng <= lombokBounds.east;
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

export function readRoadRoute(payload, notFoundMessage = 'Rute jalan tidak ditemukan.') {
  const route = payload?.routes?.[0];
  if (!route?.distance || !route.geometry?.coordinates?.length) {
    throw new Error(notFoundMessage);
  }
  return {
    distanceKm: Math.ceil(route.distance / 1000),
    points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    snapDistanceM: Math.max(0, ...(payload.waypoints || []).map((waypoint) => Number(waypoint?.distance) || 0))
  };
}

export function calculatePickupPrice(distanceKm, rate = 10_000) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.ceil(distanceKm) * rate;
}
