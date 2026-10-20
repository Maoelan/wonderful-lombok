import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  catalog: defineTable({ key: v.string(), data: v.any(), updatedAt: v.number() }).index('by_key', ['key']),
  admins: defineTable({ username: v.string(), passwordHash: v.string(), updatedAt: v.number() }).index('by_username', ['username']),
  sessions: defineTable({ tokenHash: v.string(), adminId: v.id('admins'), expiresAt: v.number() }).index('by_token', ['tokenHash']).index('by_admin', ['adminId']),
  bookings: defineTable({
    code: v.string(), idempotencyKey: v.optional(v.string()), serviceType: v.string(), serviceName: v.string(), travelDate: v.string(), people: v.number(),
    customerName: v.string(), whatsapp: v.string(), details: v.any(), status: v.string(), createdAt: v.number(), updatedAt: v.number()
  }).index('by_created_at', ['createdAt']),
  bookingRequests: defineTable({ key: v.string(), code: v.string() }).index('by_key', ['key'])
});
