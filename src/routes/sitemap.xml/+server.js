import { getSiteOrigin } from '#lib/server/site-url.js';
import { getCatalog } from '#lib/server/db.js';
import { destinationSlug, languages, localePath } from '#lib/i18n.js';

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);

export async function GET({ url }) {
  const origin = getSiteOrigin(url.origin);
  const catalog = await getCatalog();
  const groups = ['', '/paket-wisata', '/travel-lombok', ...catalog.packages.map((item) => `/paket-wisata/${item.slug}`), ...catalog.destinations.map((item) => `/destinasi/${destinationSlug(item)}`)];
  const entries = groups.flatMap((suffix, groupIndex) => {
    const alternates = languages.map((language) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(language.hreflang)}" href="${escapeXml(`${origin}${localePath(language.code, suffix)}`)}" />`).join('\n');
    const fallback = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${origin}${localePath('id', suffix)}`)}" />`;
    return languages.map((language) => `  <url>\n    <loc>${escapeXml(`${origin}${localePath(language.code, suffix)}`)}</loc>\n${alternates}\n${fallback}\n    <changefreq>weekly</changefreq>\n    <priority>${groupIndex === 0 ? '1.0' : groupIndex === 1 ? '0.9' : '0.8'}</priority>\n  </url>`);
  }).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
