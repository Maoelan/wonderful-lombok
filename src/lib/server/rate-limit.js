const buckets = new Map();
let lastPruneAt = 0;
export const RATE_LIMIT_MAX_BUCKETS = 10_000;

export function clearRateLimits() {
  buckets.clear();
  lastPruneAt = 0;
}

function prune(now) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

/**
 * In-memory, per-instance limiter. When the table is full, new keys are
 * rejected instead of evicting active buckets, so flooding unique keys cannot
 * reset an existing limit. Global/WAF limits are still required for
 * multi-instance deployments.
 */
export function consumeRateLimit(key, limit, windowMs, now = Date.now()) {
  const normalizedKey = String(key || 'unknown').slice(0, 200);
  if (buckets.size >= RATE_LIMIT_MAX_BUCKETS && now - lastPruneAt >= 60_000) {
    prune(now);
    lastPruneAt = now;
  }

  let current = buckets.get(normalizedKey);
  if (current && current.resetAt <= now) {
    buckets.delete(normalizedKey);
    current = undefined;
  }
  if (!current) {
    if (buckets.size >= RATE_LIMIT_MAX_BUCKETS) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        resetAt: now + windowMs,
        reason: 'capacity'
      };
    }
    current = { count: 0, resetAt: now + windowMs };
    buckets.set(normalizedKey, current);
  }

  current.count += 1;
  const allowed = current.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    resetAt: current.resetAt
  };
}

export function rateLimit(key, limit, windowMs, now = Date.now()) {
  return consumeRateLimit(key, limit, windowMs, now).allowed;
}
