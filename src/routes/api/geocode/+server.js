import { json } from '@sveltejs/kit';
import { lombokBounds, placeSearchQueries, readPlaceSearchResults } from '#lib/pickup.js';
import { getFormCopy, isLocale, nominatimLanguage } from '#lib/i18n.js';
import { clientAddressKey } from '#lib/server/client-address.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

export async function GET({ url, getClientAddress }) {
  const requestedLocale = url.searchParams.get('lang');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const t = getFormCopy(locale);
  const limit = consumeRateLimit(`geocode:${clientAddressKey(getClientAddress())}`, 60, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests(t.tooManySearches, limit);
  const query = url.searchParams.get('q')?.trim() || '';
  if (query.length < 3 || query.length > 120) return json({ error: t.placeQueryLength }, { status: 400 });

  const viewbox = `${lombokBounds.west},${lombokBounds.north},${lombokBounds.east},${lombokBounds.south}`;
  const language = nominatimLanguage(locale);
  let results = [];

  for (const candidate of placeSearchQueries(query)) {
    const params = new URLSearchParams({ format: 'jsonv2', limit: '8', countrycodes: 'id', bounded: '1', addressdetails: '1', namedetails: '1', 'accept-language': language, viewbox, q: candidate });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { accept: 'application/json', 'accept-language': language, 'user-agent': 'WonderfulLombok/1.0' } });
    if (!response.ok) continue;
    results = readPlaceSearchResults(await response.json(), locale);
    if (results.length) break;
  }

  return json({ results }, { headers: { 'cache-control': 'private, max-age=300' } });
}
