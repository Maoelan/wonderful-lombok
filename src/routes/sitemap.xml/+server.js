import { getSiteOrigin } from '#lib/server/site-url.js';
import { getCatalog } from '#lib/server/db.js';
import { languages, localePath } from '#lib/i18n.js';

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);

export async function GET({ url }) {
  const origin = getSiteOrigin(url.origin);
  const catalog = await getCatalog();
  const paths = languages.flatMap(({ code }) => [localePath(code), localePath(code, '/paket-wisata')]);
  for (const item of catalog.packages) for (const { code } of languages) paths.push(localePath(code, `/paket-wisata/${item.slug}`));
  const entries = paths.map((path, index) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc><changefreq>weekly</changefreq><priority>${index === 0 ? '1.0' : '0.8'}</priority></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
