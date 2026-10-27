import { json } from '@sveltejs/kit';
import { getFormCopy, isLocale } from '#lib/i18n.js';
import { MAX_TRAVEL_POINTS, isInsideLombok } from '#lib/pickup.js';
import { clientAddressKey } from '#lib/server/client-address.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';
import { TravelQuoteError, getRoadRoute } from '#lib/server/travel-quote.js';

const number = (url, key) => Number(url.searchParams.get(key));

function publicError(error, t) {
  if (!(error instanceof TravelQuoteError)) return { error: t.routeServiceDown, status: 502 };
  if (error.code === 'invalid_points') return { error: t.routeStopCount, status: 400 };
  if (error.code === 'not_configured') return { error: t.mapNotConfigured, status: 503 };
  if (error.code === 'permission_denied') return { error: t.mapPermissionDenied, status: 503 };
  if (error.code === 'quota_exceeded') return { error: t.mapQuotaExceeded, status: 503 };
  if (error.code === 'network') return { error: t.mapNetworkError, status: 502 };
  if (error.code === 'no_road_access') return { error: t.routeNoRoadAccess, status: 422 };
  if (error.code === 'not_found') return { error: t.routeNotFound, status: 422 };
  return { error: t.routeServiceDown, status: 502 };
}

async function routeResponse(stops, locale, fetch, getClientAddress) {
  const t = getFormCopy(locale);
  const limit = consumeRateLimit(`route:${clientAddressKey(getClientAddress())}`, 120, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests(t.tooManyRoutes, limit);
  if (!Array.isArray(stops) || stops.length !== MAX_TRAVEL_POINTS) {
    return json({ error: t.routeStopCount }, { status: 400 });
  }
  const seen = new Set();
  for (const stop of stops) {
    if (!isInsideLombok(stop.lat, stop.lng)) return json({ error: t.routeOutsideLombok }, { status: 400 });
    const key = `${stop.lat.toFixed(6)},${stop.lng.toFixed(6)}`;
    if (seen.has(key)) return json({ error: t.routeDuplicateStop }, { status: 400 });
    seen.add(key);
  }

  try {
    const route = await getRoadRoute(stops, locale, {
      fetchImpl: fetch,
      timeoutMs: 10_000,
      retries: 1
    });
    return json(route, { headers: { 'cache-control': 'private, no-store' } });
  } catch (error) {
    const result = publicError(error, t);
    return json({ error: result.error }, { status: result.status });
  }
}

export async function GET({ url, getClientAddress, fetch }) {
  const requestedLocale = url.searchParams.get('lang');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  return routeResponse([
    { lat: number(url, 'fromLat'), lng: number(url, 'fromLng') },
    { lat: number(url, 'toLat'), lng: number(url, 'toLng') }
  ], locale, fetch, getClientAddress);
}

export async function POST({ request, getClientAddress, fetch }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Format permintaan rute tidak valid.' }, { status: 400 });
  }
  const requestedLocale = body?.lang;
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const stops = (Array.isArray(body?.stops) ? body.stops : []).map((stop) => ({
    lat: Number(stop?.lat ?? stop?.coordinates?.[0]),
    lng: Number(stop?.lng ?? stop?.coordinates?.[1])
  }));
  return routeResponse(stops, locale, fetch, getClientAddress);
}
