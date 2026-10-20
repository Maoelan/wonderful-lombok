import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';
import { createIdempotentBooking } from './bookingStore';

export const create = mutation({
  args: { ...serverSecret, idempotencyKey: v.string(), data: v.any() },
  handler: async (ctx, { serverSecret, idempotencyKey, data }) => {
    requireServerSecret(serverSecret);
    return await createIdempotentBooking(ctx, { idempotencyKey, data });
  }
});

export const list = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await ctx.db.query('bookings').withIndex('by_created_at').order('desc').take(200)).map((item) => ({ id: item._id, code: item.code, service_type: item.serviceType, service_name: item.serviceName, travel_date: item.travelDate, people: item.people, details: item.details, status: item.status, created_at: item.createdAt, customer_name: item.customerName, whatsapp: item.whatsapp })); } });

export const setStatus = mutation({ args: { ...serverSecret, id: v.id('bookings'), status: v.string() }, handler: async (ctx, { serverSecret, id, status }) => { requireServerSecret(serverSecret); await ctx.db.patch(id, { status, updatedAt: Date.now() }); return true; } });
