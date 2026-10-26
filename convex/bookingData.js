export async function updateBookingStatus(ctx, id, status, now = Date.now()) {
  const booking = await ctx.db.get(id);
  if (!booking) return false;
  await ctx.db.patch(id, { status, updatedAt: now });
  return true;
}

export async function removeBooking(ctx, id) {
  const booking = await ctx.db.get(id);
  if (!booking) return false;
  if (booking.idempotencyKey) {
    const request = await ctx.db.query('bookingRequests').withIndex('by_key', (q) => q.eq('key', booking.idempotencyKey)).first();
    if (request) await ctx.db.delete(request._id);
  }
  await ctx.db.delete(id);
  return true;
}
