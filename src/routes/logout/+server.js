import { redirect } from '@sveltejs/kit';
import { destroySession } from '#lib/server/auth.js';

export async function POST({ cookies }) {
  await destroySession(cookies);
  redirect(303, '/login');
}
