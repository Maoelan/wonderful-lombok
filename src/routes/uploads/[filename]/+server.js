import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const contentTypes = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export async function GET({ params }) {
  if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(params.filename)) error(404, 'Gambar tidak ditemukan.');
  try {
    const body = await readFile(join(process.cwd(), 'uploads', params.filename));
    return new Response(body, {
      headers: {
        'content-type': contentTypes[extname(params.filename)],
        'content-disposition': `inline; filename="${params.filename}"`,
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
        'cross-origin-resource-policy': 'same-origin'
      }
    });
  } catch {
    error(404, 'Gambar tidak ditemukan.');
  }
}
