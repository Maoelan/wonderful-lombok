import { PUBLIC_CONVEX_URL } from '$app/env/public';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { publicCatalog } from './public-catalog.js';
import { mergeCatalogData } from './catalog-merge.js';
import { fetchWithRetry } from './upstream.js';

// Convex mutations are not idempotent, so time out each call without retrying it.
const client = new ConvexHttpClient(PUBLIC_CONVEX_URL, {
  fetch: (input, init) => fetchWithRetry(input, init, { timeoutMs: 10_000, retries: 0 })
});
const ref = (name, type) => makeFunctionReference(name, type);
const authorized = (args) => {
  const serverSecret = process.env.CONVEX_SERVER_SECRET;
  if (!serverSecret) throw new Error('CONVEX_SERVER_SECRET belum dikonfigurasi.');
  return { ...args, serverSecret };
};
export const convexQuery = (name, args = {}) => client.query(ref(name, 'query'), authorized(args));
export const convexMutation = (name, args = {}) => client.mutation(ref(name, 'mutation'), authorized(args));

export async function getCatalog() {
  return mergeCatalogData(await convexQuery('catalog:get'));
}

export async function getCatalogState() {
  const state = await convexQuery('catalog:getWithRevision');
  return {
    catalog: mergeCatalogData(state?.data ?? null),
    revision: state?.revision ?? 0
  };
}

export async function getPublicCatalog() {
  return publicCatalog(await getCatalog(), process.env.PUBLIC_RENTAL_ENABLED === 'true');
}

export async function updateCatalog(data, expectedRevision) {
  return convexMutation('catalog:save', { data, expectedRevision });
}

export async function createBooking(data) {
  return convexMutation('bookings:create', { idempotencyKey: data.idempotencyKey, data: { serviceType: data.serviceType, serviceName: data.serviceName, travelDate: data.travelDate, people: data.people, customerName: data.name, whatsapp: data.whatsapp, details: data.details } });
}

export async function getBookingsPage(cursor = null) {
  return convexQuery('bookings:listPage', { cursor });
}

export async function getBookingsForExport() {
  const bookings = [];
  const seenCursors = new Set();
  let cursor = null;
  do {
    if (cursor && seenCursors.has(cursor)) throw new Error('Cursor ekspor pemesanan berulang.');
    if (cursor) seenCursors.add(cursor);
    const page = await convexQuery('bookings:exportPage', { cursor });
    if (page?.pageStatus === 'SplitRequired') throw new Error('Halaman ekspor pemesanan terlalu besar.');
    bookings.push(...(page?.bookings ?? []));
    cursor = page?.nextCursor ?? null;
  } while (cursor);
  return bookings;
}

export async function updateBookingStatus(id, status) {
  return convexMutation('bookings:setStatus', { id, status });
}

export async function deleteBooking(id) {
  return convexMutation('bookings:remove', { id });
}
