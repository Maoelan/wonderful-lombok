import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import { randomBytes, scryptSync } from 'node:crypto';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';

if (!process.env.PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL belum diisi.');
if (!process.env.CONVEX_SERVER_SECRET) throw new Error('CONVEX_SERVER_SECRET belum diisi.');
let username = process.env.ADMIN_USERNAME?.trim();
let password = process.env.ADMIN_PASSWORD;
if (!username || !password) {
  let muted = false;
  const hiddenOutput = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk, encoding); callback(); } });
  const terminal = createInterface({ input: stdin, output: hiddenOutput, terminal: true });
  username = (await terminal.question('Username admin: ')).trim();
  stdout.write('Password admin (minimal 12 karakter): '); muted = true;
  password = await terminal.question(''); muted = false; stdout.write('\n'); terminal.close();
}
if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) throw new Error('Username harus 3-50 karakter.');
if (password.length < 12 || password.length > 256) throw new Error('Password admin harus 12-256 karakter.');
const salt = randomBytes(16).toString('hex');
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
const client = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL);
const result = await client.mutation(makeFunctionReference('admin:upsert', 'mutation'), { serverSecret: process.env.CONVEX_SERVER_SECRET, username, passwordHash });
console.log(`Admin ${username} tersimpan di Convex.`);
if (result?.created === false) console.log(`Sesi lama admin ${username} dicabut: ${result.invalidatedSessions}.`);
