import { json } from '@sveltejs/kit';
import { lombokBounds, placeSearchQueries, readPlaceSearchResults } from '#lib/pickup.js';
import { rateLimit } from '#lib/server/rate-limit.js';

const localeHeaders = { id: 'id', en: 'en', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', nl: 'nl', fr: 'fr', de: 'de', ms: 'ms' };

export async function GET({ url, getClientAddress }) {
  if (!rateLimit(`geocode:${getClientAddress()}`, 60, 60 * 60_000)) return json({ error: 'Terlalu banyak pencarian. Coba lagi nanti.' }, { status: 429 });
  const query = url.searchParams.get('q')?.trim() || '';
  if (query.length < 3 || query.length > 120) return json({ error: 'Nama tempat harus berisi 3–120 karakter.' }, { status: 400 });

  const viewbox = `${lombokBounds.west},${lombokBounds.north},${lombokBounds.east},${lombokBounds.south}`;
  const language = localeHeaders[url.searchParams.get('lang')] || 'id';
  let results = [];

  for (const candidate of placeSearchQueries(query)) {
    const params = new URLSearchParams({ format: 'jsonv2', limit: '8', countrycodes: 'id', bounded: '1', addressdetails: '1', viewbox, q: candidate });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { accept: 'application/json', 'accept-language': language, 'user-agent': 'WonderfulLombok/1.0' } });
    if (!response.ok) continue;
    results = readPlaceSearchResults(await response.json());
    if (results.length) break;
  }

  return json({ results }, { headers: { 'cache-control': 'private, max-age=300' } });
}
