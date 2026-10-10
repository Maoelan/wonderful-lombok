import { getSiteOrigin } from '#lib/server/site-url.js';

export function GET({ url }) {
  const origin = getSiteOrigin(url.origin);
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
