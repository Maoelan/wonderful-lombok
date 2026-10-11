import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { localizeCatalog } from '#lib/i18n.js';

export async function load({ url }) {
  const catalog = await getCatalog();
  const siteOrigin = getSiteOrigin(url.origin);
  return {
    catalog: localizeCatalog(catalog, 'id'),
    locale: 'id',
    canonicalUrl: `${siteOrigin}/`,
    alternateUrls: { id: `${siteOrigin}/`, en: `${siteOrigin}/en` },
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
