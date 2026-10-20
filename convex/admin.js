import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';
import { findSessionUser, removeAdmin, upsertAdmin } from './adminStore';

export const findByUsername = query({ args: { ...serverSecret, username: v.string() }, handler: async (ctx, { serverSecret, username }) => { requireServerSecret(serverSecret); const user = await ctx.db.query('admins').withIndex('by_username', (q) => q.eq('username', username)).unique(); return user ? { id: user._id, username: user.username, password_hash: user.passwordHash } : null; } });
export const upsert = mutation({ args: { ...serverSecret, username: v.string(), passwordHash: v.string() }, handler: async (ctx, { serverSecret, username, passwordHash }) => { requireServerSecret(serverSecret); return upsertAdmin(ctx, { username, passwordHash }); } });
export const remove = mutation({ args: { ...serverSecret, username: v.string() }, handler: async (ctx, { serverSecret, username }) => { requireServerSecret(serverSecret); return removeAdmin(ctx, { username }); } });
export const createSession = mutation({ args: { ...serverSecret, tokenHash: v.string(), adminId: v.id('admins'), expiresAt: v.number() }, handler: async (ctx, { serverSecret, tokenHash, adminId, expiresAt }) => { requireServerSecret(serverSecret); const expired = await ctx.db.query('sessions').filter((q) => q.lt(q.field('expiresAt'), Date.now())).collect(); await Promise.all(expired.map((item) => ctx.db.delete(item._id))); return ctx.db.insert('sessions', { tokenHash, adminId, expiresAt }); } });
export const sessionUser = query({ args: { ...serverSecret, tokenHash: v.string() }, handler: async (ctx, { serverSecret, tokenHash }) => { requireServerSecret(serverSecret); return findSessionUser(ctx, { tokenHash }); } });
export const destroySession = mutation({ args: { ...serverSecret, tokenHash: v.string() }, handler: async (ctx, { serverSecret, tokenHash }) => { requireServerSecret(serverSecret); const session = await ctx.db.query('sessions').withIndex('by_token', (q) => q.eq('tokenHash', tokenHash)).unique(); if (session) await ctx.db.delete(session._id); } });
