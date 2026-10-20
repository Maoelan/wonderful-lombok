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

const addressTerms = {
  id: {
    regions: { west: 'Kabupaten Lombok Barat', central: 'Kabupaten Lombok Tengah', east: 'Kabupaten Lombok Timur', north: 'Kabupaten Lombok Utara', mataram: 'Kota Mataram' },
    state: 'Nusa Tenggara Barat', country: 'Indonesia', district: (name) => `Kecamatan ${name}`
  },
  en: {
    regions: { west: 'West Lombok Regency', central: 'Central Lombok Regency', east: 'East Lombok Regency', north: 'North Lombok Regency', mataram: 'Mataram City' },
    state: 'West Nusa Tenggara', country: 'Indonesia', district: (name) => `${name} District`
  },
  'zh-cn': {
    regions: { west: '西龙目县', central: '中龙目县', east: '东龙目县', north: '北龙目县', mataram: '马塔兰市' },
    state: '西努沙登加拉省', country: '印度尼西亚', district: (name) => `${name}区`
  },
  'zh-tw': {
    regions: { west: '西龍目縣', central: '中龍目縣', east: '東龍目縣', north: '北龍目縣', mataram: '馬塔蘭市' },
    state: '西努沙登加拉省', country: '印度尼西亞', district: (name) => `${name}區`
  },
  nl: {
    regions: { west: 'regentschap West-Lombok', central: 'regentschap Centraal-Lombok', east: 'regentschap Oost-Lombok', north: 'regentschap Noord-Lombok', mataram: 'Mataram' },
    state: 'West-Nusa Tenggara', country: 'Indonesië', district: (name) => `district ${name}`
  },
  fr: {
    regions: { west: 'régence de Lombok occidental', central: 'régence de Lombok central', east: 'régence de Lombok oriental', north: 'régence de Lombok du Nord', mataram: 'Mataram' },
    state: 'Petites îles de la Sonde occidentales', country: 'Indonésie', district: (name) => `district de ${name}`
  },
  de: {
    regions: { west: 'Regierungsbezirk West-Lombok', central: 'Regierungsbezirk Zentral-Lombok', east: 'Regierungsbezirk Ost-Lombok', north: 'Regierungsbezirk Nord-Lombok', mataram: 'Mataram' },
    state: 'West-Nusa Tenggara', country: 'Indonesien', district: (name) => `Distrikt ${name}`
  },
  ms: {
    regions: { west: 'Daerah Lombok Barat', central: 'Daerah Lombok Tengah', east: 'Daerah Lombok Timur', north: 'Daerah Lombok Utara', mataram: 'Bandar Mataram' },
    state: 'Nusa Tenggara Barat', country: 'Indonesia', district: (name) => `Daerah ${name}`
  }
};

const normalizeAddressTerm = (value) => String(value || '').trim().toLocaleLowerCase('en').replace(/^kabupaten\s+/, '');

function localizeAddressPart(value, locale) {
  const text = String(value || '').trim();
  const terms = addressTerms[locale] || addressTerms.en;
  const normalized = normalizeAddressTerm(text);
  const regions = {
    'lombok barat': 'west', 'west lombok': 'west',
    'lombok tengah': 'central', 'central lombok': 'central',
    'lombok timur': 'east', 'east lombok': 'east',
    'lombok utara': 'north', 'north lombok': 'north',
    'kota mataram': 'mataram', 'mataram city': 'mataram'
  };
  const district = text.match(/^(?:kec\.?|kecamatan|district)\s+(.+)$/i);
  if (district) return terms.district(district[1].trim());
  if (regions[normalized]) return terms.regions[regions[normalized]];
  if (['nusa tenggara barat', 'west nusa tenggara', 'west-nusa tenggara'].includes(normalized)) return terms.state;
  if (['indonesia', 'indonesië', 'indonésie', 'indonesien', '印度尼西亚', '印度尼西亞'].includes(normalized)) return terms.country;
  return text;
}

function placeName(item, locale) {
  const languageKeys = locale === 'zh-cn'
    ? ['name:zh-Hans', 'name:zh-CN', 'name:zh']
    : locale === 'zh-tw'
      ? ['name:zh-Hant', 'name:zh-TW']
      : [`name:${locale}`];
  const localized = languageKeys.map((key) => item?.namedetails?.[key]).find(Boolean);
  if (localized) return String(localized).trim();
  const address = item?.address || {};
  return String(item?.namedetails?.name || address[item?.addresstype] || item?.name || item?.display_name?.split(',')[0] || '').trim();
}

export function formatPlaceSearchName(item, locale = 'id') {
  const address = item?.address || {};
  const addressPart = (key) => item?.addresstype === key ? '' : address[key];
  const parts = [
    placeName(item, locale),
    addressPart('road'),
    addressPart('neighbourhood'),
    addressPart('quarter'),
    addressPart('suburb'),
    addressPart('hamlet'),
    addressPart('village'),
    addressPart('town'),
    addressPart('city'),
    addressPart('city_district'),
    addressPart('municipality'),
    addressPart('county'),
    addressPart('state'),
    address.postcode,
    address.country
  ].map((part) => localizeAddressPart(part, locale)).filter(Boolean);
  const seen = new Set();
  return parts.filter((part) => {
    const key = part.toLocaleLowerCase('en');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(', ');
}

export function placeSearchQueries(value) {
  const query = String(value || '').trim().replace(/\s+/g, ' ');
  if (!query) return [];
  const compact = query.replace(/\s+/g, '');
  return compact === query ? [query] : [query, compact];
}

export function readPlaceSearchResults(payload, locale = 'id') {
  const seen = new Set();
  return (Array.isArray(payload) ? payload : []).flat().map((item) => ({
    name: formatPlaceSearchName(item, locale),
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

export function roadRouteUrl({ from, to, fromAccuracy }) {
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const reportedAccuracy = Number.isFinite(fromAccuracy) && fromAccuracy > 0 ? fromAccuracy : 50;
  const originRadius = clamp(Math.max(Math.ceil(reportedAccuracy * 3), 150), 150, 600);
  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({ overview: 'simplified', geometries: 'geojson', radiuses: `${originRadius};600` });
  return `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params}`;
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
