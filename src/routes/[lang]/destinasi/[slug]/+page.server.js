import { error } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, destinationSlug, isLocale, localePath } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Page not found');
  const sourceCatalog = await loadCatalogOrMaintenance(() => getPublicCatalog(), params.lang);
  const index = sourceCatalog.destinations.findIndex((item) => destinationSlug(item) === params.slug);
  if (index < 0) error(404, 'Destination not found');
  const catalog = localizeCatalog(sourceCatalog, params.lang);
  const item = catalog.destinations[index];
  const relatedPackages = catalog.packages.filter((packageItem) => packageItem.destinationSlugs?.includes(params.slug));
  const origin = getSiteOrigin(url.origin);
  const suffix = `/destinasi/${params.slug}`;
  return {
    locale: params.lang, catalog, item, relatedPackages,
    canonicalUrl: `${origin}${localePath(params.lang, suffix)}`,
    alternateUrls: alternateUrls(origin, suffix),
    socialImageUrl: absoluteUrl(item.image, origin)
  };
}
