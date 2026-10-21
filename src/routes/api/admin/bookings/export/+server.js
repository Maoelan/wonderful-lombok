import { json } from '@sveltejs/kit';
import { getBookingsForExport } from '#lib/server/db.js';
import { bookingsToCsv } from '#lib/server/bookings-csv.js';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';

export async function GET({ locals }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`admin:booking-export:${locals.user.id}`, 20, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Terlalu banyak unduhan. Coba lagi nanti.', limit);

  let bookings;
  try {
    bookings = await getBookingsForExport();
  } catch {
    return json({ error: 'Data pemesanan gagal dimuat.' }, { status: 503 });
  }

  const filename = `wonderful-lombok-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(bookingsToCsv(bookings), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store'
    }
  });
}
