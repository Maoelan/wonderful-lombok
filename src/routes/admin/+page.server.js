import { redirect } from '@sveltejs/kit';
import { getBookings, getCatalog } from '#lib/server/db.js';

export async function load({ locals }) {
  if (!locals.user) redirect(303, '/login');
  return { catalog: await getCatalog(), bookings: await getBookings(), user: locals.user };
}
