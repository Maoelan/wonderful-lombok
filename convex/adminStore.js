export async function invalidateAdminSessions(ctx, adminId) {
  const sessions = await ctx.db.query('sessions').withIndex('by_admin', (q) => q.eq('adminId', adminId)).collect();
  await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
  return sessions.length;
}

export async function upsertAdmin(ctx, { username, passwordHash, now = Date.now() }) {
  const user = await ctx.db.query('admins').withIndex('by_username', (q) => q.eq('username', username)).unique();
  if (user) {
    await ctx.db.patch(user._id, { passwordHash, updatedAt: now });
    const invalidatedSessions = await invalidateAdminSessions(ctx, user._id);
    return { id: user._id, created: false, invalidatedSessions };
  }
  const id = await ctx.db.insert('admins', { username, passwordHash, updatedAt: now });
  return { id, created: true, invalidatedSessions: 0 };
}

export async function removeAdmin(ctx, { username }) {
  const user = await ctx.db.query('admins').withIndex('by_username', (q) => q.eq('username', username)).unique();
  if (!user) return { removed: false, invalidatedSessions: 0 };
  const invalidatedSessions = await invalidateAdminSessions(ctx, user._id);
  await ctx.db.delete(user._id);
  return { removed: true, invalidatedSessions };
}

export async function findSessionUser(ctx, { tokenHash, now = Date.now() }) {
  const session = await ctx.db.query('sessions').withIndex('by_token', (q) => q.eq('tokenHash', tokenHash)).unique();
  if (!session || session.expiresAt <= now) return null;
  const user = await ctx.db.get(session.adminId);
  return user ? { id: user._id, username: user.username } : null;
}
