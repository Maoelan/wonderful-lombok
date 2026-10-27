import { getSessionUser } from '#lib/server/auth.js';
import { canonicalRedirectTarget } from '#lib/server/canonical-redirect.js';
import { checkRequestOrigin } from '#lib/server/request-security.js';
import { languages } from '#lib/i18n.js';
import { PUBLIC_SITE_URL } from '$app/env/private';

function applySecurityHeaders(response, event, production) {
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('cross-origin-opener-policy', 'same-origin');
  response.headers.set('x-permitted-cross-domain-policies', 'none');
  response.headers.set('x-conversation-id', '6ba7b810-9dad-11d3-a456-426614174000');
  response.headers.set('x-conversation-request-id', '6ba7b811-9dad-11d3-a456-426614174000');
  response.headers.set('x-conversation-message-id', '6ba7b812-9dad-11d3-a456-426614174000');
  // Reviewed: the value is hard-coded and never derived from request input.
  // nosemgrep: security-rules.javascript.express.security.x-frame-options-misconfiguration
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('origin-agent-cluster', '?1');
  if (event.url.pathname.startsWith('/admin') || event.url.pathname === '/login' || event.url.pathname === '/logout' || event.url.pathname.startsWith('/api/')) {
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }
  if (production) response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  return response;
}

export async function handle({ event, resolve }) {
  const production = process.env.NODE_ENV === 'production';
  if (production && PUBLIC_SITE_URL) {
    const canonical = canonicalRedirectTarget({
      pathname: event.url.pathname,
      search: event.url.search,
      publicSiteUrl: PUBLIC_SITE_URL
    });
    if (canonical?.invalid) {
      return applySecurityHeaders(new Response('Permintaan tidak valid.', {
        status: 400,
        headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' }
      }), event, production);
    }
    if (canonical && ['GET', 'HEAD'].includes(event.request.method) && !event.url.pathname.startsWith('/api/') && !event.url.pathname.startsWith('/.well-known/') && event.url.origin !== canonical.origin) {
      return applySecurityHeaders(new Response(null, {
        status: 308,
        headers: { location: canonical.location, 'cache-control': 'no-store' }
      }), event, production);
    }
  }

  const originCheck = checkRequestOrigin({
    method: event.request.method,
    pathname: event.url.pathname,
    origin: event.request.headers.get('origin'),
    requestOrigin: event.url.origin,
    publicSiteUrl: PUBLIC_SITE_URL,
    production
  });
  if (!originCheck.ok) return new Response('Origin tidak diizinkan.', { status: 403 });

  try {
    event.locals.user = await getSessionUser(event.cookies);
  } catch {
    // A Convex outage must not turn stale session cookies into 500s for public
    // pages or the login page. Treat the request as anonymous; the session can
    // become usable again when Convex recovers.
    event.locals.user = null;
  }
  const routeLocale = event.url.pathname.split('/')[1] || 'id';
  const pageLanguage = languages.find(({ code }) => code === routeLocale)?.hreflang || 'id-ID';
  const response = await resolve(event, {
    // Reviewed: pageLanguage comes only from the static languages allowlist, never the raw route segment.
    // nosemgrep: security-rules.javascript.lang.security.html-in-template-string
    transformPageChunk: ({ html }) => html.replace('<html lang="id">', `<html lang="${pageLanguage}">`)
  });
  return applySecurityHeaders(response, event, production);
}
