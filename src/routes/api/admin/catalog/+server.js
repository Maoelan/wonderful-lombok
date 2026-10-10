import { json } from '@sveltejs/kit';
import { updateCatalog } from '#lib/server/db.js';
import { validateCatalog } from '#lib/server/catalog-validation.js';

export async function PUT({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  let catalog;
  try { catalog = await request.json(); } catch { return json({ error: 'Format JSON tidak valid.' }, { status: 400 }); }
  const validationError = validateCatalog(catalog);
  if (validationError) return json({ error: validationError }, { status: 400 });
  await updateCatalog(catalog);
  return json({ ok: true });
}
