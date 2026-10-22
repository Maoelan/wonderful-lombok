import { error } from '@sveltejs/kit';
import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls, isLocale, localePath } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';
import { normalizeMapProvider } from '#lib/map-provider.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Page not found');
  const catalog = localizeCatalog(await loadCatalogOrMaintenance(() => getPublicCatalog(), params.lang), params.lang);
  const origin = getSiteOrigin(url.origin);
  const suffix = '/travel-lombok';
  return {
    locale: params.lang,
    catalog,
    googleMapsKey: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mapProvider: normalizeMapProvider(process.env.MAP_PROVIDER),
    mapboxToken: process.env.PUBLIC_MAPBOX_TOKEN || '',
    canonicalUrl: `${origin}${localePath(params.lang, suffix)}`,
    alternateUrls: alternateUrls(origin, suffix),
    socialImageUrl: absoluteUrl(catalog.settings.heroImage, origin)
  };
}
