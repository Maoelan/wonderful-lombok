import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { isLocale, localizeCatalog } from '#lib/i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Bahasa tidak tersedia.');
  const catalog = await getCatalog();
  const siteOrigin = getSiteOrigin(url.origin);
  const canonicalUrl = params.lang === 'id' ? `${siteOrigin}/` : `${siteOrigin}/en`;
  return {
    catalog: localizeCatalog(catalog, params.lang), locale: params.lang, canonicalUrl,
    alternateUrls: { id: `${siteOrigin}/`, en: `${siteOrigin}/en` },
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
