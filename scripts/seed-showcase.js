import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { defaultCatalog } from '../src/lib/catalog.js';

if (!process.env.PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL belum diisi.');
const client = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL);
await client.mutation(makeFunctionReference('catalog:save', 'mutation'), { data: defaultCatalog });
console.log('Katalog showcase bersih tersimpan di Convex.');
