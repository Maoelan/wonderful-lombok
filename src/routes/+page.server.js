import { getPublicCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';

export async function load({ url }) {
  const catalog = await getPublicCatalog();
  const siteOrigin = getSiteOrigin(url.origin);
  return {
    catalog: localizeCatalog(catalog, 'id'),
    locale: 'id',
    rentalEnabled: process.env.PUBLIC_RENTAL_ENABLED === 'true',
    canonicalUrl: `${siteOrigin}/`,
    alternateUrls: alternateUrls(siteOrigin),
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
