import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { getSiteOrigin } from '#lib/server/site-url.js';
import { getSocialImageUrl } from '#lib/social-image.js';
import { alternateUrls } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';

export async function load({ url }) {
  const catalog = await loadCatalogOrMaintenance(() => getPublicCatalog(), 'id');
  const siteOrigin = getSiteOrigin(url.origin);
  return {
    catalog: localizeCatalog(catalog, 'id'),
    locale: 'id',
    rentalEnabled: process.env.PUBLIC_RENTAL_ENABLED === 'true',
    canonicalUrl: `${siteOrigin}/`,
    alternateUrls: alternateUrls(siteOrigin),
    socialImageUrl: getSocialImageUrl(catalog.packages[0]?.image, siteOrigin)
  };
}
