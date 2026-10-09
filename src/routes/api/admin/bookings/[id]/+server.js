import { json } from '@sveltejs/kit';
import { updateBookingStatus } from '#lib/server/db.js';

export async function PATCH({ locals, params, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const { status } = await request.json();
  if (!['baru', 'dikonfirmasi', 'selesai', 'dibatalkan'].includes(status)) return json({ error: 'Status tidak valid.' }, { status: 400 });
  return await updateBookingStatus(params.id, status) ? json({ ok: true }) : json({ error: 'Pemesanan tidak ditemukan.' }, { status: 404 });
}
