import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';

const bucket = v.object({ key: v.string(), limit: v.number(), resetAt: v.number() });

export const consume = mutation({
  args: { ...serverSecret, buckets: v.array(bucket), now: v.number() },
  handler: async (ctx, { serverSecret, buckets, now }) => {
    requireServerSecret(serverSecret);

    const expired = await ctx.db.query('mapRateLimits')
      .withIndex('by_reset_at', (q) => q.lt('resetAt', now))
      .take(100);
    await Promise.all(expired.map((item) => ctx.db.delete(item._id)));

    const states = [];
    for (const requested of buckets) {
      const existing = await ctx.db.query('mapRateLimits')
        .withIndex('by_key', (q) => q.eq('key', requested.key))
        .unique();
      const count = existing && existing.resetAt > now ? existing.count + 1 : 1;
      states.push({ existing, requested, count });
    }

    const blocked = states.find(({ count, requested }) => count > requested.limit);
    if (blocked) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((blocked.requested.resetAt - now) / 1000))
      };
    }

    for (const { existing, requested, count } of states) {
      if (existing) await ctx.db.patch(existing._id, { count, resetAt: requested.resetAt });
      else await ctx.db.insert('mapRateLimits', { key: requested.key, count, resetAt: requested.resetAt });
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
});
