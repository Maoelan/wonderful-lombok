const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const COOKIE_AUTH_PATH = /^\/(?:admin(?:\/|$)|api\/admin(?:\/|$)|login(?:\/|$)|logout(?:\/|$))/;

export function isSafeMethod(method) {
  return SAFE_METHODS.has(String(method || '').toUpperCase());
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function requiresTrustedOrigin(pathname) {
  return COOKIE_AUTH_PATH.test(decodePathname(pathname));
}

export function allowedOrigins({ requestOrigin, publicSiteUrl, production }) {
  const origins = new Set();
  if (publicSiteUrl) origins.add(publicSiteUrl);
  if (!production || !publicSiteUrl) origins.add(requestOrigin);
  return origins;
}

/**
 * Cookie-authenticated mutations must send an Origin header from the canonical
 * site. A missing Origin is rejected there. Public, unauthenticated endpoints
 * such as /api/bookings may omit Origin, but a supplied Origin must still match.
 */
export function checkRequestOrigin({
  method,
  pathname,
  origin,
  requestOrigin,
  publicSiteUrl,
  production = process.env.NODE_ENV === 'production'
}) {
  if (isSafeMethod(method)) return { ok: true };

  if (origin === null || origin === undefined || origin === '') {
    return requiresTrustedOrigin(pathname) ? { ok: false, reason: 'missing' } : { ok: true };
  }

  if (typeof origin !== 'string' || origin === 'null') return { ok: false, reason: 'malformed' };

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (parsed.origin !== origin || parsed.username || parsed.password) return { ok: false, reason: 'malformed' };

  const allowed = allowedOrigins({ requestOrigin, publicSiteUrl, production });
  return allowed.has(parsed.origin) ? { ok: true } : { ok: false, reason: 'untrusted' };
}
