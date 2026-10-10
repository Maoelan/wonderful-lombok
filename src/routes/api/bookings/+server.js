import { json } from '@sveltejs/kit';
import { createBooking } from '#lib/server/db.js';
import { rateLimit } from '#lib/server/rate-limit.js';

export async function POST({ request, getClientAddress }) {
  if (!rateLimit(`booking:${getClientAddress()}`, 8, 60 * 60_000)) return json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
  if (Number(request.headers.get('content-length') || 0) > 20_000) return json({ error: 'Data pemesanan terlalu besar.' }, { status: 413 });
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Format JSON tidak valid.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Data pemesanan tidak valid.' }, { status: 400 });
  const whatsapp = String(body.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
  const allowed = ['wisata', 'travel', 'rental'];
  if (!String(body.name || '').trim() || String(body.name).length > 100 || !/^62\d{8,13}$/.test(whatsapp)) return json({ error: 'Nama dan nomor WhatsApp belum valid.' }, { status: 400 });
  if (!allowed.includes(body.serviceType) || !String(body.serviceName || '').trim() || String(body.serviceName).length > 120) return json({ error: 'Jenis layanan tidak valid.' }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.travelDate || '') || body.travelDate < new Date().toISOString().slice(0, 10)) return json({ error: 'Tanggal perjalanan tidak valid.' }, { status: 400 });
  const people = Number(body.people);
  if (!Number.isInteger(people) || people < 1 || people > 50) return json({ error: 'Jumlah peserta tidak valid.' }, { status: 400 });
  const details = body.details && typeof body.details === 'object' && !Array.isArray(body.details) ? body.details : {};
  if (JSON.stringify(details).length > 4000) return json({ error: 'Detail pemesanan terlalu panjang.' }, { status: 400 });
  const code = await createBooking({ serviceType: body.serviceType, serviceName: body.serviceName.trim(), travelDate: body.travelDate, name: body.name.trim(), whatsapp, people, details });
  return json({ code }, { status: 201 });
}
