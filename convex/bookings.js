import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const code = `WL-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    await ctx.db.insert('bookings', { ...data, code, status: 'baru', createdAt: Date.now(), updatedAt: Date.now() });
    return code;
  }
});

export const list = query({ args: {}, handler: async (ctx) => (await ctx.db.query('bookings').withIndex('by_created_at').order('desc').take(200)).map((item) => ({ id: item._id, code: item.code, service_type: item.serviceType, service_name: item.serviceName, travel_date: item.travelDate, people: item.people, details: item.details, status: item.status, created_at: item.createdAt, customer_name: item.customerName, whatsapp: item.whatsapp })) });

export const setStatus = mutation({ args: { id: v.id('bookings'), status: v.string() }, handler: async (ctx, { id, status }) => { await ctx.db.patch(id, { status, updatedAt: Date.now() }); return true; } });
