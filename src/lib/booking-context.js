// Display context only. The booking API still validates and stores its own request fields.
export function packageBooking({ name, price, unit, duration }) {
  return { type: 'wisata', name, price, unit, duration };
}
