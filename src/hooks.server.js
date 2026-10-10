import { getSessionUser } from '#lib/server/auth.js';
import { PUBLIC_SITE_URL } from '$app/env/private';

export async function handle({ event, resolve }) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
    const origin = event.request.headers.get('origin');
    const allowedOrigins = new Set([event.url.origin]);
    if (PUBLIC_SITE_URL) allowedOrigins.add(PUBLIC_SITE_URL);
    if (origin && !allowedOrigins.has(origin)) return new Response('Origin tidak diizinkan.', { status: 403 });
  }

  event.locals.user = await getSessionUser(event.cookies);
  const response = await resolve(event);
  const production = process.env.NODE_ENV === 'production';
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('cross-origin-opener-policy', 'same-origin');
  response.headers.set('x-permitted-cross-domain-policies', 'none');
  if (event.url.pathname.startsWith('/admin') || event.url.pathname === '/login' || event.url.pathname.startsWith('/api/')) {
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }
  if (production) response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  return response;
}
