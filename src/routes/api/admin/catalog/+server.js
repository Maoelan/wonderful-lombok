import { json } from '@sveltejs/kit';
import { updateCatalog } from '#lib/server/db.js';
import { validateCatalog } from '#lib/server/catalog-validation.js';
import { sanitizeCatalogRichText } from '#lib/server/rich-text.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

const conflictMessage = 'Katalog telah diubah oleh sesi admin lain. Muat ulang halaman admin sebelum menyimpan lagi.';

export async function PUT({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`admin:catalog:${locals.user.id}`, 120, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Terlalu banyak perubahan katalog. Coba lagi nanti.', limit);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'Format JSON tidak valid.' }, { status: 400 }); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !payload.catalog) {
    return json({ error: 'Data katalog tidak valid.' }, { status: 400 });
  }
  const expectedRevision = payload.expectedRevision;
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    return json({ error: 'Muat ulang halaman admin sebelum menyimpan.', code: 'catalog_reload' }, { status: 428 });
  }
  const catalog = sanitizeCatalogRichText(payload.catalog);
  const validationError = validateCatalog(catalog);
  if (validationError) return json({ error: validationError }, { status: 400 });

  let result;
  try {
    result = await updateCatalog(catalog, expectedRevision);
  } catch {
    return json({ error: 'Katalog belum dapat disimpan. Coba lagi beberapa saat lagi.' }, { status: 503 });
  }
  if (result?.conflict) {
    return json({ error: conflictMessage, code: 'catalog_conflict' }, { status: 409 });
  }
  if (!result?.ok || !Number.isInteger(result.revision)) {
    return json({ error: 'Katalog belum dapat disimpan. Coba lagi beberapa saat lagi.' }, { status: 503 });
  }
  return json({ ok: true, revision: result.revision });
}
