import { error } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { alternateUrls, isLocale, localePath } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';
import { getSiteOrigin } from '#lib/server/site-url.js';
import { getSocialImageUrl } from '#lib/social-image.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Halaman tidak ditemukan');
  const catalog = localizeCatalog(await loadCatalogOrMaintenance(() => getPublicCatalog(), params.lang), params.lang);
  const origin = getSiteOrigin(url.origin);
  return {
    locale: params.lang,
    catalog,
    canonicalUrl: `${origin}${localePath(params.lang, '/destinasi')}`,
    alternateUrls: alternateUrls(origin, '/destinasi'),
    socialImageUrl: getSocialImageUrl(catalog.destinations[0]?.image, origin)
  };
}
