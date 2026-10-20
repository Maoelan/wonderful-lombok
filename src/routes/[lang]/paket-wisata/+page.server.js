import { error } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { alternateUrls, isLocale, localePath, localizeCatalog } from '#lib/i18n.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Halaman tidak ditemukan');
  const catalog = localizeCatalog(await getPublicCatalog(), params.lang);
  const origin = getSiteOrigin(url.origin);
  return {
    locale: params.lang,
    catalog,
    canonicalUrl: `${origin}${localePath(params.lang, '/paket-wisata')}`,
    alternateUrls: alternateUrls(origin, '/paket-wisata'),
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', origin)
  };
}
