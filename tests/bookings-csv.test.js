import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingsToCsv, csvCell } from '../src/lib/server/bookings-csv.js';

const booking = {
  code: 'WL-TEST-1',
  created_at: 1_760_000_000_000,
  status: 'baru',
  service_type: 'travel',
  service_name: 'Paket Travel',
  travel_date: '2026-11-01',
  people: 2,
  customer_name: 'Siti "Nina"',
  whatsapp: '628123456789',
  details: { origin: 'Bandara', destination: 'Senggigi', notes: 'Pickup, terminal 2' }
};

test('formats CSV cells with quotes and formula-injection protection', () => {
  assert.equal(csvCell('plain'), '"plain"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('line\nbreak'), '"line\nbreak"');
  assert.equal(csvCell('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"');
  assert.equal(csvCell('+62812'), '"\'+62812"');
  assert.equal(csvCell('-8.7'), '"\'-8.7"');
  assert.equal(csvCell('@example'), '"\'@example"');
  assert.equal(csvCell(null), '""');
});

test('exports bookings with a BOM, stable headers, and escaped data', () => {
  const csv = bookingsToCsv([booking]);
  const [header, row] = csv.replace(/^\uFEFF/, '').trimEnd().split('\r\n');

  assert.equal(header, '"kode","dibuat","status","jenis_layanan","nama_layanan","tanggal_perjalanan","jumlah_peserta","nama_pelanggan","whatsapp","detail"');
  assert.match(row, /"WL-TEST-1"/);
  assert.match(row, /"Siti ""Nina"""/);
  assert.match(row, /"\{""origin"":""Bandara""/);
  assert.match(row, /"2026-11-01"/);
  assert.ok(csv.startsWith('\uFEFF'));
});
