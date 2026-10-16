import { PUBLIC_SITE_URL } from '$app/env/private';

export function getSiteOrigin(fallbackOrigin) {
  return new URL(PUBLIC_SITE_URL || fallbackOrigin).origin;
}

export function absoluteUrl(value, origin) {
  try { return new URL(value, origin).href; } catch { return origin; }
}
