import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';

let muted = false;
const hiddenOutput = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk, encoding); callback(); } });
const terminal = createInterface({ input: stdin, output: hiddenOutput, terminal: true });
const username = (await terminal.question('Username admin: ')).trim();
stdout.write('Password admin (minimal 12 karakter): ');
muted = true;
const password = await terminal.question('');
muted = false;
stdout.write('\n');
terminal.close();

if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) throw new Error('Username harus 3-50 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau tanda hubung.');
if (password.length < 12 || password.length > 256) throw new Error('Password admin harus 12-256 karakter.');

const salt = randomBytes(16).toString('hex');
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, options: '-c search_path=wonderful_lombok' });
await client.connect();
await client.query(
  `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [username, passwordHash]
);
await client.end();
console.log(`Admin ${username} tersimpan di database.`);
