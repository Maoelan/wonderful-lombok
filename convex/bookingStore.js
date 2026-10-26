export function defaultBookingCode(now = Date.now()) {
  return `WL-${now.toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function bookingRequestFingerprint(data) {
  const serialized = stableStringify(data);
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  const hash = (value) => (value >>> 0).toString(16).padStart(8, '0');
  return `${serialized.length}:${hash(first)}${hash(second)}`;
}

export async function createIdempotentBooking(ctx, { idempotencyKey, data, now = Date.now(), generateCode = defaultBookingCode }) {
  const fingerprint = bookingRequestFingerprint(data);
  const existing = await ctx.db.query('bookingRequests').withIndex('by_key', (q) => q.eq('key', idempotencyKey)).first();
  if (existing) {
    if (existing.fingerprint && existing.fingerprint !== fingerprint) return { code: null, conflict: true };
    return { code: existing.code, conflict: false };
  }
  const code = generateCode(now);
  await ctx.db.insert('bookings', { ...data, idempotencyKey, code, status: 'baru', createdAt: now, updatedAt: now });
  await ctx.db.insert('bookingRequests', { key: idempotencyKey, code, fingerprint });
  return { code, conflict: false };
}
