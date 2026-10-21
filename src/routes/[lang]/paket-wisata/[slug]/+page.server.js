import { error } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { alternateUrls, isLocale, localePath } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Halaman tidak ditemukan');
  const catalog = localizeCatalog(await getPublicCatalog(), params.lang);
  const item = catalog.packages.find((entry) => entry.slug === params.slug);
  if (!item) error(404, params.lang === 'en' ? 'Package not found' : 'Paket tidak ditemukan');
  const origin = getSiteOrigin(url.origin);
  return {
    locale: params.lang, catalog, item,
    canonicalUrl: `${origin}${localePath(params.lang, `/paket-wisata/${item.slug}`)}`,
    alternateUrls: alternateUrls(origin, `/paket-wisata/${item.slug}`),
    socialImageUrl: absoluteUrl(item.image, origin)
  };
}
