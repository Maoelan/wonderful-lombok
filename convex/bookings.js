import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';
import { createIdempotentBooking } from './bookingStore';
import { removeBooking, updateBookingStatus } from './bookingData';

// Legacy contract: the production site still reads a plain booking code from this mutation.
export const create = mutation({
  args: { ...serverSecret, idempotencyKey: v.string(), data: v.any() },
  handler: async (ctx, { serverSecret, idempotencyKey, data }) => {
    requireServerSecret(serverSecret);
    const { code } = await createIdempotentBooking(ctx, { idempotencyKey, data, rejectConflicts: false });
    return code;
  }
});

export const createChecked = mutation({
  args: { ...serverSecret, idempotencyKey: v.string(), data: v.any() },
  handler: async (ctx, { serverSecret, idempotencyKey, data }) => {
    requireServerSecret(serverSecret);
    return await createIdempotentBooking(ctx, { idempotencyKey, data });
  }
});

const adminBooking = (item) => ({ id: item._id, code: item.code, service_type: item.serviceType, service_name: item.serviceName, travel_date: item.travelDate, people: item.people, details: item.details, status: item.status, created_at: item.createdAt, customer_name: item.customerName, whatsapp: item.whatsapp });

// Legacy reads kept until the production site moves to listPage/exportPage.
export const list = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await ctx.db.query('bookings').withIndex('by_created_at').order('desc').take(200)).map(adminBooking); } });

export const exportList = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await ctx.db.query('bookings').withIndex('by_created_at').order('desc').take(5000)).map(adminBooking); } });

const bookingPage = async (ctx, cursor, numItems) => {
  const result = await ctx.db.query('bookings').withIndex('by_created_at').order('desc').paginate({ cursor, numItems });
  return {
    bookings: result.page.map(adminBooking),
    nextCursor: result.isDone ? null : result.continueCursor,
    pageStatus: result.pageStatus ?? null
  };
};

export const listPage = query({
  args: { ...serverSecret, cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { serverSecret, cursor }) => {
    requireServerSecret(serverSecret);
    return bookingPage(ctx, cursor, 50);
  }
});

export const exportPage = query({
  args: { ...serverSecret, cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { serverSecret, cursor }) => {
    requireServerSecret(serverSecret);
    return bookingPage(ctx, cursor, 100);
  }
});

export const setStatus = mutation({ args: { ...serverSecret, id: v.id('bookings'), status: v.string() }, handler: async (ctx, { serverSecret, id, status }) => {
  requireServerSecret(serverSecret);
  return updateBookingStatus(ctx, id, status);
} });

export const remove = mutation({ args: { ...serverSecret, id: v.id('bookings') }, handler: async (ctx, { serverSecret, id }) => {
  requireServerSecret(serverSecret);
  return removeBooking(ctx, id);
} });
