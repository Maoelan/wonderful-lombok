const HEADERS = [
  'kode',
  'dibuat',
  'status',
  'jenis_layanan',
  'nama_layanan',
  'tanggal_perjalanan',
  'jumlah_peserta',
  'nama_pelanggan',
  'whatsapp',
  'detail'
];

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function isoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function bookingsToCsv(bookings) {
  const rows = [
    HEADERS,
    ...bookings.map((booking) => [
      booking.code,
      isoDate(booking.created_at),
      booking.status,
      booking.service_type,
      booking.service_name,
      booking.travel_date,
      booking.people,
      booking.customer_name,
      booking.whatsapp,
      JSON.stringify(booking.details ?? {})
    ])
  ];

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
