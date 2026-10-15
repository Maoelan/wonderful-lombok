export const places = [
  { id: 'airport', name: 'Bandara Internasional Lombok', detail: 'Praya, Lombok Tengah', lat: -8.7573, lng: 116.2767 },
  { id: 'kuta', name: 'Kuta Mandalika', detail: 'Pujut, Lombok Tengah', lat: -8.8941, lng: 116.2776 },
  { id: 'mataram', name: 'Kota Mataram', detail: 'Mataram', lat: -8.5833, lng: 116.1167 },
  { id: 'senggigi', name: 'Senggigi', detail: 'Batu Layar, Lombok Barat', lat: -8.493, lng: 116.0448 },
  { id: 'bangsal', name: 'Pelabuhan Bangsal', detail: 'Pemenang, Lombok Utara', lat: -8.3936, lng: 116.0994 }
];

export const lombokBounds = { west: 115.78, south: -9.15, east: 116.82, north: -8.15 };

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

export function readRoadRoute(payload) {
  const route = payload?.routes?.[0];
  if (!route?.distance || !route.geometry?.coordinates?.length) {
    throw new Error('Rute jalan tidak ditemukan.');
  }
  return {
    distanceKm: Math.ceil(route.distance / 1000),
    points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
  };
}

export function calculatePickupPrice(distanceKm, rate = 10_000) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.ceil(distanceKm) * rate;
}
