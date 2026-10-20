import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';

if (!process.env.PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL belum diisi.');
if (!process.env.CONVEX_SERVER_SECRET) throw new Error('CONVEX_SERVER_SECRET belum diisi.');
const username = process.env.ADMIN_USERNAME?.trim();
if (!username) throw new Error('ADMIN_USERNAME wajib diisi untuk mencabut admin.');
if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) throw new Error('Username harus 3-50 karakter.');

const client = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL);
const result = await client.mutation(makeFunctionReference('admin:remove', 'mutation'), { serverSecret: process.env.CONVEX_SERVER_SECRET, username });
if (!result.removed) throw new Error(`Admin ${username} tidak ditemukan.`);
console.log(`Admin ${username} dicabut. ${result.invalidatedSessions} sesi dihapus.`);
