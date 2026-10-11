import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, isLocale, localePath, localizeCatalog } from '#lib/i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Bahasa tidak tersedia.');
  const catalog = await getCatalog();
  const siteOrigin = getSiteOrigin(url.origin);
  const canonicalUrl = `${siteOrigin}${localePath(params.lang)}`;
  return {
    catalog: localizeCatalog(catalog, params.lang), locale: params.lang, canonicalUrl,
    alternateUrls: alternateUrls(siteOrigin),
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
