import { normalizeMapProvider } from '../map-provider.js';

export async function createMap(options) {
  const provider = normalizeMapProvider(options.provider);
  if (provider === 'mapbox') {
    const { createMapboxMap } = await import('./mapbox.js');
    return createMapboxMap(options);
  }
  const { createGoogleMap } = await import('./google.js');
  return createGoogleMap(options);
}
