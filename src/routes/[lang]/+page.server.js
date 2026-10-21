import { error, redirect } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, isLocale, localePath } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Bahasa tidak tersedia.');
  if (params.lang === 'id') redirect(308, '/');
  const catalog = await loadCatalogOrMaintenance(() => getPublicCatalog(), params.lang);
  const siteOrigin = getSiteOrigin(url.origin);
  const canonicalUrl = `${siteOrigin}${localePath(params.lang)}`;
  return {
    catalog: localizeCatalog(catalog, params.lang), locale: params.lang, canonicalUrl,
    rentalEnabled: process.env.PUBLIC_RENTAL_ENABLED === 'true',
    alternateUrls: alternateUrls(siteOrigin),
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
