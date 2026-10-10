import { PUBLIC_SITE_URL } from '$app/env/private';

export function getSiteOrigin(fallbackOrigin) {
  return PUBLIC_SITE_URL || fallbackOrigin;
}

export function absoluteUrl(value, origin) {
  try { return new URL(value, origin).href; } catch { return origin; }
}
