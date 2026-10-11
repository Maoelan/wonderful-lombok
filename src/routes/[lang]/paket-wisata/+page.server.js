import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/db.js';
import { isLocale, localizeCatalog } from '#lib/i18n.js';
import { absoluteUrl, getSiteOrigin } from '#lib/server/site-url.js';

export async function load({ params, url }) {
  if (!isLocale(params.lang)) error(404, 'Halaman tidak ditemukan');
  const catalog = localizeCatalog(await getCatalog(), params.lang);
  const origin = getSiteOrigin(url.origin);
  return {
    locale: params.lang,
    catalog,
    canonicalUrl: `${origin}/${params.lang}/paket-wisata`,
    alternateUrls: { id: `${origin}/id/paket-wisata`, en: `${origin}/en/paket-wisata` },
    socialImageUrl: absoluteUrl(catalog.packages[0]?.image || '/', origin)
  };
}
