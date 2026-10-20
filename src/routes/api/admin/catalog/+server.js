import { json } from '@sveltejs/kit';
import { updateCatalog } from '#lib/server/db.js';
import { validateCatalog } from '#lib/server/catalog-validation.js';
import { sanitizeCatalogRichText } from '#lib/server/rich-text.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

export async function PUT({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`admin:catalog:${locals.user.id}`, 120, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Terlalu banyak perubahan katalog. Coba lagi nanti.', limit);
  let catalog;
  try { catalog = await request.json(); } catch { return json({ error: 'Format JSON tidak valid.' }, { status: 400 }); }
  catalog = sanitizeCatalogRichText(catalog);
  const validationError = validateCatalog(catalog);
  if (validationError) return json({ error: validationError }, { status: 400 });
  await updateCatalog(catalog);
  return json({ ok: true });
}
