import { getCatalog } from '#lib/server/db.js';

export async function load({ url }) {
  return { catalog: await getCatalog(), canonicalUrl: `${url.origin}/` };
}
