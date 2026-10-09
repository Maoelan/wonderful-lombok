import { getSessionUser } from '#lib/server/auth.js';

export async function handle({ event, resolve }) {
  event.locals.user = await getSessionUser(event.cookies);
  const response = await resolve(event);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('content-security-policy', "frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  if (process.env.NODE_ENV === 'production') response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  return response;
}
