import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, isLocale, localePath, localizeCatalog } from '#lib/i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Page not found');
  const catalog = localizeCatalog(await getCatalog(), params.lang);
  const origin = getSiteOrigin(url.origin);
  const suffix = '/travel-lombok';
  return {
    locale: params.lang,
    catalog,
    canonicalUrl: `${origin}${localePath(params.lang, suffix)}`,
    alternateUrls: alternateUrls(origin, suffix),
    socialImageUrl: absoluteUrl(catalog.settings.heroImage, origin)
  };
}
