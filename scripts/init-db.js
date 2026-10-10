import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { defaultCatalog } from '../src/lib/catalog.js';

const { Client } = pg;
const databaseUrl = new URL(process.env.DATABASE_URL);
const databaseName = databaseUrl.pathname.slice(1);
const maintenanceUrl = new URL(databaseUrl);
maintenanceUrl.pathname = '/postgres';

if (databaseName !== 'postgres') {
  const maintenance = new Client({ connectionString: maintenanceUrl.toString() });
  await maintenance.connect();
  const exists = await maintenance.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
  if (!exists.rowCount) await maintenance.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`);
  await maintenance.end();
}

const client = new Client({ connectionString: databaseUrl.toString() });
await client.connect();
await client.query('CREATE SCHEMA IF NOT EXISTS wonderful_lombok');
await client.query('SET search_path TO wonderful_lombok');
await client.query(await readFile(new URL('../migrations/001_init.sql', import.meta.url), 'utf8'));
await client.query(await readFile(new URL('../migrations/002_bookings.sql', import.meta.url), 'utf8'));
await client.query('INSERT INTO site_catalog (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [defaultCatalog]);

await client.end();
console.log(`Database ${databaseName} siap. Jalankan npm run admin:create untuk membuat akun admin.`);
