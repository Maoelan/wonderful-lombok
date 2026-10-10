import { fail, redirect } from '@sveltejs/kit';
import { authenticate, createSession } from '#lib/server/auth.js';
import { rateLimit } from '#lib/server/rate-limit.js';

export function load({ locals }) {
  if (locals.user) redirect(303, '/admin');
}

export const actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    if (!rateLimit(`login:${getClientAddress()}`, 10, 15 * 60_000)) return fail(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
    const data = await request.formData();
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    if (!username || !password) return fail(400, { error: 'Isi username dan password.', username });
    if (username.length > 50 || password.length > 256) return fail(400, { error: 'Username atau password tidak valid.' });
    const user = await authenticate(username, password);
    if (!user) return fail(401, { error: 'Username atau password salah.', username });
    await createSession(user.id, cookies);
    redirect(303, '/admin');
  }
};
