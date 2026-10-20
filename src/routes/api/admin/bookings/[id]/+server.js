import { json } from '@sveltejs/kit';
import { updateBookingStatus } from '#lib/server/db.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

export async function PATCH({ locals, params, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`admin:booking-status:${locals.user.id}`, 240, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Terlalu banyak perubahan status. Coba lagi nanti.', limit);
  let status;
  try { ({ status } = await request.json()); } catch { return json({ error: 'Format JSON tidak valid.' }, { status: 400 }); }
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(params.id)) return json({ error: 'ID pemesanan tidak valid.' }, { status: 400 });
  if (!['baru', 'dikonfirmasi', 'selesai', 'dibatalkan'].includes(status)) return json({ error: 'Status tidak valid.' }, { status: 400 });
  return await updateBookingStatus(params.id, status) ? json({ ok: true }) : json({ error: 'Pemesanan tidak ditemukan.' }, { status: 404 });
}
