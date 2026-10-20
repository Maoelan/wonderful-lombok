export function defaultBookingCode(now = Date.now()) {
  return `WL-${now.toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function createIdempotentBooking(ctx, { idempotencyKey, data, now = Date.now(), generateCode = defaultBookingCode }) {
  const existing = await ctx.db.query('bookingRequests').withIndex('by_key', (q) => q.eq('key', idempotencyKey)).first();
  if (existing) return existing.code;
  const code = generateCode(now);
  await ctx.db.insert('bookings', { ...data, idempotencyKey, code, status: 'baru', createdAt: now, updatedAt: now });
  await ctx.db.insert('bookingRequests', { key: idempotencyKey, code });
  return code;
}
