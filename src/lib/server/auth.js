import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { query } from './db.js';

const sessionCookie = 'wl_admin_session';
const dummyHash = `scrypt:${'0'.repeat(32)}:${scryptSync('invalid-password', '0'.repeat(32), 64).toString('hex')}`;

export async function authenticate(username, password) {
  const result = await query('SELECT id, username, password_hash FROM admin_users WHERE username = $1', [username]);
  const user = result.rows[0];
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
  await query('DELETE FROM admin_sessions WHERE expires_at < now()');
  await query('INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval \'8 hours\')', [tokenHash, userId]);
  cookies.set(sessionCookie, token, { path: '/', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge });
}

export async function getSessionUser(cookies) {
  const token = cookies.get(sessionCookie);
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const result = await query(
    'SELECT u.id, u.username FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()',
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function destroySession(cookies) {
  const token = cookies.get(sessionCookie);
  if (token) await query('DELETE FROM admin_sessions WHERE token_hash = $1', [createHash('sha256').update(token).digest('hex')]);
  cookies.delete(sessionCookie, { path: '/' });
}
