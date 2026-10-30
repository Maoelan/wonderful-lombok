// Display context only. The booking API still validates and stores its own request fields.
export function packageBooking({ name, price, unit, duration, image, route }) {
  return { type: 'wisata', name, price, unit, duration, image, route };
}
