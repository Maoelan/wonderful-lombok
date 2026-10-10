import { getCatalog } from '#lib/server/db.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';

export async function load({ url }) {
  const catalog = await getCatalog();
  const siteOrigin = getSiteOrigin(url.origin);
  return {
    catalog,
    canonicalUrl: `${siteOrigin}/`,
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', siteOrigin)
  };
}
