import { json } from '@sveltejs/kit';
import { getBookingsPage } from '#lib/server/db.js';
import { logServerError } from '#lib/server/diagnostics.js';

export async function GET({ locals, url }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const cursor = url.searchParams.get('cursor');
  try {
    return json(await getBookingsPage(cursor || null));
  } catch (cause) {
    logServerError('admin_bookings_load_failed', cause, { operation: 'admin_bookings_page' });
    return json({ error: 'Pemesanan gagal dimuat.' }, { status: 503 });
  }
}
