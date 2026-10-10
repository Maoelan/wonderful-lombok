import { json } from '@sveltejs/kit';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { rateLimit } from '#lib/server/rate-limit.js';

const formats = [
  { type: 'image/jpeg', extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  { type: 'image/png', extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'image/webp', extension: 'webp', signature: [0x52, 0x49, 0x46, 0x46], suffix: [0x57, 0x45, 0x42, 0x50] }
];

export async function POST({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  if (!rateLimit(`upload:${locals.user.id}`, 30, 60 * 60_000)) return json({ error: 'Batas upload tercapai. Coba lagi nanti.' }, { status: 429 });
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 5_500_000) return json({ error: 'Ukuran gambar maksimal 5 MB.' }, { status: 413 });

  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0 || file.size > 5_000_000) return json({ error: 'Pilih gambar maksimal 5 MB.' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = formats.find((item) => item.type === file.type && item.signature.every((byte, index) => bytes[index] === byte) && (!item.suffix || item.suffix.every((byte, index) => bytes[index + 8] === byte)));
  if (!format) return json({ error: 'Format gambar harus JPG, PNG, atau WebP yang valid.' }, { status: 400 });

  const name = `${Date.now()}-${randomBytes(12).toString('hex')}.${format.extension}`;
  const directory = join(process.cwd(), 'uploads');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), bytes, { flag: 'wx' });
  return json({ url: `/uploads/${name}` }, { status: 201 });
}
