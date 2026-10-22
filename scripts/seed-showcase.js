import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { defaultCatalog } from '../src/lib/catalog.js';

if (!process.env.PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL belum diisi.');
if (!process.env.CONVEX_SERVER_SECRET) throw new Error('CONVEX_SERVER_SECRET belum diisi.');
const serverSecret = process.env.CONVEX_SERVER_SECRET;
const client = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL);
const state = await client.query(makeFunctionReference('catalog:getWithRevision', 'query'), { serverSecret });
const result = await client.mutation(makeFunctionReference('catalog:save', 'mutation'), { serverSecret, data: defaultCatalog, expectedRevision: state.revision });
if (!result?.ok) throw new Error('Katalog berubah saat proses seed. Jalankan ulang setelah tidak ada perubahan lain.');
console.log('Katalog showcase bersih tersimpan di Convex.');
