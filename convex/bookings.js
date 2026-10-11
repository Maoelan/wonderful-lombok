import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';

export const create = mutation({
  args: { ...serverSecret, data: v.any() },
  handler: async (ctx, { serverSecret, data }) => {
    requireServerSecret(serverSecret);
    const code = `WL-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    await ctx.db.insert('bookings', { ...data, code, status: 'baru', createdAt: Date.now(), updatedAt: Date.now() });
    return code;
  }
});

export const list = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await ctx.db.query('bookings').withIndex('by_created_at').order('desc').take(200)).map((item) => ({ id: item._id, code: item.code, service_type: item.serviceType, service_name: item.serviceName, travel_date: item.travelDate, people: item.people, details: item.details, status: item.status, created_at: item.createdAt, customer_name: item.customerName, whatsapp: item.whatsapp })); } });

export const setStatus = mutation({ args: { ...serverSecret, id: v.id('bookings'), status: v.string() }, handler: async (ctx, { serverSecret, id, status }) => { requireServerSecret(serverSecret); await ctx.db.patch(id, { status, updatedAt: Date.now() }); return true; } });
