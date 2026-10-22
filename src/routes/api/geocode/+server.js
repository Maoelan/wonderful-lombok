import { json } from '@sveltejs/kit';
import { getFormCopy, isLocale } from '#lib/i18n.js';
import { clientAddressKey } from '#lib/server/client-address.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';
import { getMapProviderName, searchPlaces } from '#lib/server/map-providers/index.js';
import { TravelQuoteError } from '#lib/server/travel-quote-error.js';

export async function GET({ url, getClientAddress, fetch }) {
  const requestedLocale = url.searchParams.get('lang');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const t = getFormCopy(locale);
  const limit = consumeRateLimit(`geocode:${clientAddressKey(getClientAddress())}`, 60, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests(t.tooManySearches, limit);
  const query = url.searchParams.get('q')?.trim() || '';
  if (query.length < 3 || query.length > 120) return json({ error: t.placeQueryLength }, { status: 400 });

  try {
    const results = await searchPlaces(query, locale, {
      provider: getMapProviderName(process.env.MAP_PROVIDER),
      apiKey: process.env.GOOGLE_MAPS_SERVER_API_KEY,
      token: process.env.MAPBOX_SERVER_TOKEN,
      fetchImpl: fetch,
      timeoutMs: 8_000,
      retries: 1
    });
    return json({ results }, { headers: { 'cache-control': 'private, max-age=300' } });
  } catch (error) {
    if (!(error instanceof TravelQuoteError)) return json({ error: t.mapNetworkError }, { status: 502 });
    if (error.code === 'not_configured') return json({ error: t.mapNotConfigured }, { status: 503 });
    if (error.code === 'permission_denied') return json({ error: t.mapPermissionDenied }, { status: 503 });
    if (error.code === 'quota_exceeded') return json({ error: t.mapQuotaExceeded }, { status: 503 });
    if (error.code === 'network') return json({ error: t.mapNetworkError }, { status: 502 });
    return json({ error: t.searchFailed }, { status: 502 });
  }
}
