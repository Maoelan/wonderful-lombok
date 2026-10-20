import { PUBLIC_CONVEX_URL } from '$app/env/public';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { defaultCatalog } from '../catalog.js';
import { destinationSlug, slugify } from '../i18n.js';
import { publicCatalog } from './public-catalog.js';
import { sanitizeCatalogRichText } from './rich-text.js';

const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
const ref = (name, type) => makeFunctionReference(name, type);
const authorized = (args) => {
  const serverSecret = process.env.CONVEX_SERVER_SECRET;
  if (!serverSecret) throw new Error('CONVEX_SERVER_SECRET belum dikonfigurasi.');
  return { ...args, serverSecret };
};
export const convexQuery = (name, args = {}) => client.query(ref(name, 'query'), authorized(args));
export const convexMutation = (name, args = {}) => client.mutation(ref(name, 'mutation'), authorized(args));

export async function getCatalog() {
  const data = await convexQuery('catalog:get') || defaultCatalog;
  return sanitizeCatalogRichText({
    ...defaultCatalog,
    ...data,
    settings: { ...defaultCatalog.settings, ...data.settings },
    packages: (data.packages || defaultCatalog.packages).map((item, index) => ({
      ...(defaultCatalog.packages[index] || {}), slug: item.slug || slugify(item.name), category: item.category || defaultCatalog.packages[index]?.category || 'Private tour', categoryEn: item.categoryEn || defaultCatalog.packages[index]?.categoryEn || 'Private tour', duration: item.duration || defaultCatalog.packages[index]?.duration || '1 hari', durationEn: item.durationEn || defaultCatalog.packages[index]?.durationEn || '1 day', nameEn: item.nameEn || defaultCatalog.packages[index]?.nameEn || item.name, routeEn: item.routeEn || defaultCatalog.packages[index]?.routeEn || item.route, detail: '', detailEn: item.detailEn || defaultCatalog.packages[index]?.detailEn || item.detail || '', unitEn: item.unitEn || defaultCatalog.packages[index]?.unitEn || item.unit || '', images: [],
      images: item.images || [], ...item,
      itinerary: item.itinerary?.length ? item.itinerary : defaultCatalog.packages[index]?.itinerary || [],
      itineraryEn: item.itineraryEn?.length ? item.itineraryEn : defaultCatalog.packages[index]?.itineraryEn || [],
      includes: item.includes?.length ? item.includes : defaultCatalog.packages[index]?.includes || [],
      includesEn: item.includesEn?.length ? item.includesEn : defaultCatalog.packages[index]?.includesEn || [],
      excludes: item.excludes?.length ? item.excludes : defaultCatalog.packages[index]?.excludes || [],
      excludesEn: item.excludesEn?.length ? item.excludesEn : defaultCatalog.packages[index]?.excludesEn || [],
      priceTiers: item.priceTiers?.length ? item.priceTiers : defaultCatalog.packages[index]?.priceTiers || []
    })),
    destinations: (data.destinations || defaultCatalog.destinations).map((item, index) => ({ ...(defaultCatalog.destinations[index] || {}), images: [], ...item, slug: destinationSlug(item) })),
    rentals: (data.rentals || defaultCatalog.rentals).map((item, index) => ({ ...(defaultCatalog.rentals[index] || {}), ...item })),
    faqs: (data.faqs || defaultCatalog.faqs).map((item, index) => ({ ...(defaultCatalog.faqs[index] || {}), ...item }))
  });
}

export async function getPublicCatalog() {
  return publicCatalog(await getCatalog(), process.env.PUBLIC_RENTAL_ENABLED === 'true');
}

export async function updateCatalog(data) {
  await convexMutation('catalog:save', { data });
}

export async function createBooking(data) {
  return convexMutation('bookings:create', { idempotencyKey: data.idempotencyKey, data: { serviceType: data.serviceType, serviceName: data.serviceName, travelDate: data.travelDate, people: data.people, customerName: data.name, whatsapp: data.whatsapp, details: data.details } });
}

export async function getBookings() {
  return convexQuery('bookings:list');
}

export async function updateBookingStatus(id, status) {
  return convexMutation('bookings:setStatus', { id, status });
}
