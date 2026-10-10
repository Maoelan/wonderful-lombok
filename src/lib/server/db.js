import { DATABASE_URL } from '$app/env/private';
import pg from 'pg';
import { randomBytes } from 'node:crypto';
import { defaultCatalog } from '../catalog.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL, max: 10, options: '-c search_path=wonderful_lombok' });

export function query(text, values) {
  return pool.query(text, values);
}

export async function getCatalog() {
  const result = await query('SELECT data FROM site_catalog WHERE id = 1');
  if (!result.rowCount) throw new Error('Katalog belum diinisialisasi. Jalankan npm run db:init.');
  const data = result.rows[0].data;
  return {
    ...defaultCatalog,
    ...data,
    settings: { ...defaultCatalog.settings, ...data.settings },
    packages: (data.packages || defaultCatalog.packages).map((item) => ({ detail: '', images: [], ...item })),
    destinations: (data.destinations || defaultCatalog.destinations).map((item) => ({ images: [], ...item })),
    faqs: data.faqs || defaultCatalog.faqs
  };
}

export async function updateCatalog(data) {
  await query('UPDATE site_catalog SET data = $1, updated_at = now() WHERE id = 1', [data]);
}

export async function createBooking(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const customer = await client.query(
      `INSERT INTO customers (name, whatsapp) VALUES ($1, $2)
       ON CONFLICT (whatsapp) DO UPDATE SET name = EXCLUDED.name, updated_at = now() RETURNING id`,
      [data.name, data.whatsapp]
    );
    const code = `WL-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    await client.query(
      `INSERT INTO bookings (code, customer_id, service_type, service_name, travel_date, people, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [code, customer.rows[0].id, data.serviceType, data.serviceName, data.travelDate, data.people, data.details]
    );
    await client.query('COMMIT');
    return code;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function getBookings() {
  const result = await query(`SELECT b.id, b.code, b.service_type, b.service_name, b.travel_date, b.people, b.details, b.status, b.created_at,
    c.name AS customer_name, c.whatsapp FROM bookings b JOIN customers c ON c.id = b.customer_id ORDER BY b.created_at DESC LIMIT 200`);
  return result.rows;
}

export async function updateBookingStatus(id, status) {
  const result = await query('UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2 RETURNING id', [status, id]);
  return result.rowCount === 1;
}
