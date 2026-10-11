import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { isLocale, localizeCatalog } from '#lib/i18n.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Halaman tidak ditemukan');
  const catalog = localizeCatalog(await getCatalog(), params.lang);
  const item = catalog.packages.find((entry) => entry.slug === params.slug);
  if (!item) error(404, params.lang === 'en' ? 'Package not found' : 'Paket tidak ditemukan');
  const origin = getSiteOrigin(url.origin);
  return {
    locale: params.lang, catalog, item,
    canonicalUrl: `${origin}/${params.lang}/paket-wisata/${item.slug}`,
    alternateUrls: { id: `${origin}/id/paket-wisata/${item.slug}`, en: `${origin}/en/paket-wisata/${item.slug}` },
    socialImageUrl: absoluteUrl(item.image, origin)
  };
}
