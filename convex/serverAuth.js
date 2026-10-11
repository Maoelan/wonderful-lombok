import { v } from 'convex/values';

export const serverSecret = { serverSecret: v.string() };

export function requireServerSecret(value) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || value !== expected) throw new Error('Unauthorized');
}
