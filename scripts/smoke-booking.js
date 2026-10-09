import pg from 'pg';

const base = process.env.APP_URL || 'http://127.0.0.1:5173';
const response = await fetch(`${base}/api/bookings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
  name: 'Smoke Test', whatsapp: '081234567890', serviceType: 'wisata', serviceName: 'Paket Test', travelDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), people: 2, details: { test: true }
}) });
const result = await response.json();
if (response.status !== 201 || !result.code) throw new Error(`Booking API gagal: ${response.status}.`);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, options: '-c search_path=wonderful_lombok' });
await client.connect();
await client.query('DELETE FROM bookings WHERE code = $1', [result.code]);
await client.query(`DELETE FROM customers WHERE whatsapp = '6281234567890' AND NOT EXISTS (SELECT 1 FROM bookings WHERE customer_id = customers.id)`);
await client.end();
console.log('Smoke test guest booking lulus dan data uji dibersihkan.');
