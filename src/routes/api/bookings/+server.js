import { json } from '@sveltejs/kit';
import { createBooking, getCatalog } from '#lib/server/db.js';
import { createBookingRequest } from '#lib/server/booking-request.js';
import { rateLimit } from '#lib/server/rate-limit.js';

const failure = (message, status = 400) => json({ error: message }, { status });

export async function POST({ request, getClientAddress, fetch }) {
  if (!rateLimit(`booking:${getClientAddress()}`, 8, 60 * 60_000)) return failure('Terlalu banyak permintaan. Coba lagi nanti.', 429);
  if (Number(request.headers.get('content-length') || 0) > 20_000) return failure('Data pemesanan terlalu besar.', 413);

  let raw;
  try { raw = await request.text(); } catch { return failure('Format JSON tidak valid.'); }
  if (new TextEncoder().encode(raw).length > 20_000) return failure('Data pemesanan terlalu besar.', 413);
  let body;
  try { body = JSON.parse(raw); } catch { return failure('Format JSON tidak valid.'); }

  const result = await createBookingRequest({
    body,
    idempotencyKey: request.headers.get('idempotency-key')?.trim(),
    fetchImpl: fetch,
    loadCatalog: getCatalog,
    saveBooking: createBooking,
    rentalEnabled: process.env.PUBLIC_RENTAL_ENABLED === 'true'
  });
  return json(result.body, { status: result.status });
}
