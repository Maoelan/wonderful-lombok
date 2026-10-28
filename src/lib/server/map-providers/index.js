import * as mapbox from './mapbox.js';

export async function searchPlaces(query, locale = 'en', options = {}) {
  return mapbox.searchPlaces(query, locale, options);
}

export async function getRoadRoute(stops, locale = 'id', options = {}) {
  return mapbox.getRoadRoute(stops, locale, options);
}
