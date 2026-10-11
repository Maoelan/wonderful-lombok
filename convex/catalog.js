import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';

export const get = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await ctx.db.query('catalog').withIndex('by_key', (q) => q.eq('key', 'main')).unique())?.data ?? null; } });

export const save = mutation({
  args: { ...serverSecret, data: v.any() },
  handler: async (ctx, { serverSecret, data }) => {
    requireServerSecret(serverSecret);
    const current = await ctx.db.query('catalog').withIndex('by_key', (q) => q.eq('key', 'main')).unique();
    if (current) await ctx.db.patch(current._id, { data, updatedAt: Date.now() });
    else await ctx.db.insert('catalog', { key: 'main', data, updatedAt: Date.now() });
  }
});
