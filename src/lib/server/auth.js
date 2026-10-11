import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { convexMutation, convexQuery } from './db.js';

const sessionCookie = 'wl_admin_session';
const dummyHash = `scrypt:${'0'.repeat(32)}:${scryptSync('invalid-password', '0'.repeat(32), 64).toString('hex')}`;

export async function authenticate(username, password) {
  const user = await convexQuery('admin:findByUsername', { username });
  const storedHash = user?.password_hash || dummyHash;
  try {
    const [algorithm, salt, expectedHex] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(expectedHex)) return null;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return user && timingSafeEqual(expected, actual) ? user : null;
  } catch {
    return null;
  }
}

export async function createSession(userId, cookies) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const maxAge = 60 * 60 * 8;
  await convexMutation('admin:createSession', { tokenHash, adminId: userId, expiresAt: Date.now() + maxAge * 1000 });
  cookies.set(sessionCookie, token, { path: '/', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge });
}

export async function getSessionUser(cookies) {
  const token = cookies.get(sessionCookie);
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return await convexQuery('admin:sessionUser', { tokenHash });
}

export async function destroySession(cookies) {
  const token = cookies.get(sessionCookie);
  if (token) await convexMutation('admin:destroySession', { tokenHash: createHash('sha256').update(token).digest('hex') });
  cookies.delete(sessionCookie, { path: '/' });
}
