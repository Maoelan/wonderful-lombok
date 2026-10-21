import { error, redirect } from '@sveltejs/kit';
import { getBookings, getCatalogState } from '#lib/server/db.js';
import { loadCatalogOrMaintenance, maintenanceMessage } from '#lib/server/catalog-fallback.js';

export async function load({ locals }) {
  if (!locals.user) redirect(303, '/login');
  const { catalog, revision } = await loadCatalogOrMaintenance(() => getCatalogState(), 'id');
  let bookings;
  try {
    bookings = await getBookings();
  } catch {
    error(503, maintenanceMessage('id'));
  }
  return { catalog, catalogRevision: revision, bookings, user: locals.user };
}
