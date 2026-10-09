import { json } from '@sveltejs/kit';
import { updateCatalog } from '#lib/server/db.js';

function validUrl(value) {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export async function PUT({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const catalog = await request.json();
  if (!Array.isArray(catalog.packages) || !Array.isArray(catalog.rentals)) return json({ error: 'Data katalog tidak lengkap.' }, { status: 400 });
  if (!Number.isFinite(Number(catalog.travelRate)) || Number(catalog.travelRate) < 1000) return json({ error: 'Tarif travel tidak valid.' }, { status: 400 });
  if (!/^62\d{8,13}$/.test(String(catalog.settings?.whatsapp || '').replace(/\D/g, ''))) return json({ error: 'Nomor WhatsApp harus memakai format internasional.' }, { status: 400 });
  if (!String(catalog.settings?.email || '').includes('@')) return json({ error: 'Email tidak valid.' }, { status: 400 });
  if (![catalog.settings.instagram, catalog.settings.tiktok, catalog.settings.facebook].every(validUrl)) return json({ error: 'Tautan media sosial tidak valid.' }, { status: 400 });
  await updateCatalog(catalog);
  return json({ ok: true });
}
