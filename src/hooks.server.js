import { getSessionUser } from '#lib/server/auth.js';
import { languages } from '#lib/i18n.js';
import { PUBLIC_SITE_URL } from '$app/env/private';

export async function handle({ event, resolve }) {
  const production = process.env.NODE_ENV === 'production';
  if (production && PUBLIC_SITE_URL && ['GET', 'HEAD'].includes(event.request.method) && !event.url.pathname.startsWith('/api/') && !event.url.pathname.startsWith('/.well-known/') && event.url.origin !== PUBLIC_SITE_URL) {
    const canonicalUrl = new URL(`${event.url.pathname}${event.url.search}`, PUBLIC_SITE_URL);
    return new Response(null, { status: 308, headers: { location: canonicalUrl.href } });
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
    const origin = event.request.headers.get('origin');
    const allowedOrigins = new Set([event.url.origin]);
    if (PUBLIC_SITE_URL) allowedOrigins.add(PUBLIC_SITE_URL);
    if (origin && !allowedOrigins.has(origin)) return new Response('Origin tidak diizinkan.', { status: 403 });
  }

  event.locals.user = await getSessionUser(event.cookies);
  const routeLocale = event.url.pathname.split('/')[1] || 'id';
  const pageLanguage = languages.find(({ code }) => code === routeLocale)?.hreflang || 'id-ID';
  let response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="id">', `<html lang="${pageLanguage}">`)
  });
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('cross-origin-opener-policy', 'same-origin');
  response.headers.set('x-permitted-cross-domain-policies', 'none');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('origin-agent-cluster', '?1');
  if (event.url.pathname.startsWith('/admin') || event.url.pathname === '/login' || event.url.pathname.startsWith('/api/')) {
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }
  if (production) response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  return response;
}
