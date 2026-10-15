import { json } from '@sveltejs/kit';
import { getBookings } from '#lib/server/db.js';

export async function GET({ locals }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  return json({ bookings: await getBookings() });
}
