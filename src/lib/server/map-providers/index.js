import { normalizeMapProvider } from '../../map-provider.js';
import * as google from './google.js';
import * as mapbox from './mapbox.js';

export function getMapProviderName(value = process.env.MAP_PROVIDER) {
  return normalizeMapProvider(value);
}

export function getMapProvider(name = process.env.MAP_PROVIDER) {
  return getMapProviderName(name) === 'mapbox' ? mapbox : google;
}

export async function searchPlaces(query, locale = 'en', options = {}) {
  return getMapProvider(options.provider).searchPlaces(query, locale, options);
}

export async function getRoadRoute(stops, locale = 'id', options = {}) {
  return getMapProvider(options.provider).getRoadRoute(stops, locale, options);
}
