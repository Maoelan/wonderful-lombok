import { isIP } from 'node:net';

/**
 * Rate-limit keys must stay bounded and IP-shaped. adapter-vercel exposes the
 * platform-controlled x-forwarded-for value through getClientAddress(). Vercel
 * overwrites that header; self-hosted proxies must overwrite or append the real
 * client address and block direct access to the app port. We use the right-most
 * value so a spoofed prefix cannot choose the bucket when a proxy appends.
 */
export function clientAddressKey(value) {
  const parts = String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
  const candidate = parts.at(-1);
  if (!candidate) return 'unknown';
  const normalized = candidate.startsWith('::ffff:') ? candidate.slice(7) : candidate;
  return isIP(normalized) ? normalized.toLowerCase() : 'unknown';
}
