import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, destinationSlug, isLocale, localePath, localizeCatalog } from '#lib/i18n.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Page not found');
  const sourceCatalog = await getCatalog();
  const index = sourceCatalog.destinations.findIndex((item) => destinationSlug(item) === params.slug);
  if (index < 0) error(404, 'Destination not found');
  const catalog = localizeCatalog(sourceCatalog, params.lang);
  const item = catalog.destinations[index];
  const tokens = sourceCatalog.destinations[index].name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 4);
  let relatedPackages = catalog.packages.filter((_, packageIndex) => {
    const source = `${sourceCatalog.packages[packageIndex]?.name || ''} ${sourceCatalog.packages[packageIndex]?.route || ''}`.toLowerCase();
    return tokens.some((token) => source.includes(token));
  });
  if (!relatedPackages.length) relatedPackages = catalog.packages.slice(0, 3);
  const origin = getSiteOrigin(url.origin);
  const suffix = `/destinasi/${params.slug}`;
  return {
    locale: params.lang, catalog, item, relatedPackages,
    canonicalUrl: `${origin}${localePath(params.lang, suffix)}`,
    alternateUrls: alternateUrls(origin, suffix),
    socialImageUrl: absoluteUrl(item.image, origin)
  };
}
