import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({ args: {}, handler: async (ctx) => (await ctx.db.query('catalog').withIndex('by_key', (q) => q.eq('key', 'main')).unique())?.data ?? null });

export const save = mutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const current = await ctx.db.query('catalog').withIndex('by_key', (q) => q.eq('key', 'main')).unique();
    if (current) await ctx.db.patch(current._id, { data, updatedAt: Date.now() });
    else await ctx.db.insert('catalog', { key: 'main', data, updatedAt: Date.now() });
  }
});
