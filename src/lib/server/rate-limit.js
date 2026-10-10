const buckets = new Map();
const maxBuckets = 10_000;

function prune(now) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  if (buckets.size >= maxBuckets) buckets.delete(buckets.keys().next().value);
}

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (buckets.size >= maxBuckets) prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
