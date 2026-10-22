import { createHash } from 'node:crypto';
import { consumeRateLimit } from './rate-limit.js';

export const MAP_USAGE_POLICY = {
  geocode: { perMinute: 10, perHour: 30, globalPerMinute: 60, globalPerDay: 200 },
  route: { perMinute: 10, perHour: 60, globalPerMinute: 60, globalPerDay: 200 }
};

const WINDOWS = {
  minute: 60_000,
  hour: 60 * 60_000,
  day: 24 * 60 * 60_000
};

const windowBucket = (name, windowMs, now) => {
  const start = Math.floor(now / windowMs) * windowMs;
  return { name, start, resetAt: start + windowMs };
};

async function defaultDistributedConsume(buckets, now) {
  const { consumeDistributedMapLimit } = await import('./db.js');
  return consumeDistributedMapLimit(buckets, now);
}

export function mapLimitBuckets(action, clientAddress, now = Date.now()) {
  const policy = MAP_USAGE_POLICY[action];
  if (!policy) throw new Error('Unknown map action.');
  const identity = createHash('sha256').update(String(clientAddress || 'unknown')).digest('hex').slice(0, 24);
  const minute = windowBucket('minute', WINDOWS.minute, now);
  const hour = windowBucket('hour', WINDOWS.hour, now);
  const day = windowBucket('day', WINDOWS.day, now);
  return [
    { key: `maps:${action}:ip:${identity}:${minute.start}`, limit: policy.perMinute, resetAt: minute.resetAt },
    { key: `maps:${action}:ip:${identity}:${hour.start}`, limit: policy.perHour, resetAt: hour.resetAt },
    { key: `maps:${action}:global:${minute.start}`, limit: policy.globalPerMinute, resetAt: minute.resetAt },
    { key: `maps:${action}:global:${day.start}`, limit: policy.globalPerDay, resetAt: day.resetAt }
  ];
}

export async function consumeMapUsage(action, clientAddress, {
  now = Date.now(),
  production = process.env.NODE_ENV === 'production',
  distributedConsume = defaultDistributedConsume
} = {}) {
  const policy = MAP_USAGE_POLICY[action];
  const local = consumeRateLimit(`maps:${action}:${clientAddress}`, policy.perMinute, WINDOWS.minute, now);
  if (!local.allowed) return local;
  if (!production) return local;

  try {
    return await distributedConsume(mapLimitBuckets(action, clientAddress, now), now);
  } catch {
    return { allowed: false, remaining: 0, retryAfterSeconds: 60, reason: 'guard_unavailable' };
  }
}
