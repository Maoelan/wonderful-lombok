import { error, redirect } from '@sveltejs/kit';
import { getBookings, getCatalog } from '#lib/server/db.js';
import { loadCatalogOrMaintenance, maintenanceMessage } from '#lib/server/catalog-fallback.js';

export async function load({ locals }) {
  if (!locals.user) redirect(303, '/login');
  const catalog = await loadCatalogOrMaintenance(() => getCatalog(), 'id');
  let bookings;
  try {
    bookings = await getBookings();
  } catch {
    error(503, maintenanceMessage('id'));
  }
  return { catalog, bookings, user: locals.user };
}
