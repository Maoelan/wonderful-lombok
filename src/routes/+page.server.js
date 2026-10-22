import { getPublicCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance } from '#lib/server/catalog-fallback.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';
import { alternateUrls } from '#lib/i18n.js';
import { localizeCatalog } from '#lib/server/catalog-i18n.js';
import { normalizeMapProvider } from '#lib/map-provider.js';

export async function load({ url }) {
  const catalog = await loadCatalogOrMaintenance(() => getPublicCatalog(), 'id');
  const siteOrigin = getSiteOrigin(url.origin);
  return {
    catalog: localizeCatalog(catalog, 'id'),
    locale: 'id',
    rentalEnabled: process.env.PUBLIC_RENTAL_ENABLED === 'true',
    googleMapsKey: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mapProvider: normalizeMapProvider(process.env.MAP_PROVIDER),
    mapboxToken: process.env.PUBLIC_MAPBOX_TOKEN || '',
    canonicalUrl: `${siteOrigin}/`,
    alternateUrls: alternateUrls(siteOrigin),
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
