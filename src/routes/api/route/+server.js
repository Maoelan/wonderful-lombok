import { json } from '@sveltejs/kit';
import { getFormCopy, isLocale } from '#lib/i18n.js';
import { isInsideLombok } from '#lib/pickup.js';
import { rateLimit } from '#lib/server/rate-limit.js';

const number = (url, key) => Number(url.searchParams.get(key));
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export async function GET({ url, getClientAddress, fetch }) {
  const requestedLocale = url.searchParams.get('lang');
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const t = getFormCopy(locale);
  if (!rateLimit(`route:${getClientAddress()}`, 120, 60 * 60_000)) return json({ error: t.tooManyRoutes }, { status: 429 });

  const from = { lat: number(url, 'fromLat'), lng: number(url, 'fromLng') };
  const to = { lat: number(url, 'toLat'), lng: number(url, 'toLng') };
  if (!isInsideLombok(from.lat, from.lng) || !isInsideLombok(to.lat, to.lng)) return json({ error: t.routeOutsideLombok }, { status: 400 });

  const suppliedAccuracy = number(url, 'fromAccuracy');
  const reportedAccuracy = Number.isFinite(suppliedAccuracy) && suppliedAccuracy > 0 ? suppliedAccuracy : 50;
  const originRadius = clamp(Math.max(Math.ceil(reportedAccuracy * 3), 150), 150, 600);
  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({ overview: 'simplified', geometries: 'geojson', radiuses: `${originRadius};600` });

  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?${params}`, { signal: AbortSignal.timeout(10_000) });
    const payload = await response.json();
    if (!response.ok || payload.code !== 'Ok') return json({ error: t.routeNotFound }, { status: 422 });
    return json(payload, { headers: { 'cache-control': 'private, no-store' } });
  } catch {
    return json({ error: t.routeServiceDown }, { status: 502 });
  }
}
