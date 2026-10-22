export const MAP_PROVIDERS = ['google', 'mapbox'];

export function normalizeMapProvider(value) {
  return String(value || '').trim().toLowerCase() === 'mapbox' ? 'mapbox' : 'google';
}
