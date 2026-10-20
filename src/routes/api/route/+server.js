import { json } from '@sveltejs/kit';
import { getFormCopy, isLocale } from '#lib/i18n.js';
import { isInsideLombok, roadRouteUrl } from '#lib/pickup.js';
import { clientAddressKey } from '#lib/server/client-address.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

const number = (url, key) => Number(url.searchParams.get(key));

export async function GET({ url, getClientAddress, fetch }) {
  const requestedLocale = url.searchParams.get('lang');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const t = getFormCopy(locale);
  const limit = consumeRateLimit(`route:${clientAddressKey(getClientAddress())}`, 120, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests(t.tooManyRoutes, limit);

  const from = { lat: number(url, 'fromLat'), lng: number(url, 'fromLng') };
  const to = { lat: number(url, 'toLat'), lng: number(url, 'toLng') };
  if (!isInsideLombok(from.lat, from.lng) || !isInsideLombok(to.lat, to.lng)) return json({ error: t.routeOutsideLombok }, { status: 400 });

  try {
    const response = await fetch(roadRouteUrl({ from, to, fromAccuracy: number(url, 'fromAccuracy') }), { signal: AbortSignal.timeout(10_000) });
    const payload = await response.json();
    if (!response.ok || payload.code !== 'Ok') return json({ error: t.routeNotFound }, { status: 422 });
    return json(payload, { headers: { 'cache-control': 'private, no-store' } });
  } catch {
    return json({ error: t.routeServiceDown }, { status: 502 });
  }
}
