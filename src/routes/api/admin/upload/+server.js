import { json } from '@sveltejs/kit';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';
import { fetchWithRetry } from '#lib/server/upstream.js';
import { convexMutation } from '#lib/server/db.js';

const formats = [
  { type: 'image/jpeg', extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  { type: 'image/png', extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'image/webp', extension: 'webp', signature: [0x52, 0x49, 0x46, 0x46], suffix: [0x57, 0x45, 0x42, 0x50] }
];

export async function POST({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`upload:${locals.user.id}`, 30, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Batas upload tercapai. Coba lagi nanti.', limit);
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 5_500_000) return json({ error: 'Ukuran gambar maksimal 5 MB.' }, { status: 413 });

  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0 || file.size > 5_000_000) return json({ error: 'Pilih gambar maksimal 5 MB.' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = formats.find((item) => item.type === file.type && item.signature.every((byte, index) => bytes[index] === byte) && (!item.suffix || item.suffix.every((byte, index) => bytes[index + 8] === byte)));
  if (!format) return json({ error: 'Format gambar harus JPG, PNG, atau WebP yang valid.' }, { status: 400 });

  let uploadUrl;
  try {
    uploadUrl = await convexMutation('files:generateUploadUrl');
  } catch {
    return json({ error: 'Gambar gagal disimpan.' }, { status: 503 });
  }

  let uploadResponse;
  try {
    uploadResponse = await fetchWithRetry(uploadUrl, { method: 'POST', headers: { 'content-type': format.type }, body: bytes }, { timeoutMs: 20_000, retries: 0 });
  } catch {
    return json({ error: 'Gambar gagal disimpan.' }, { status: 502 });
  }
  if (!uploadResponse.ok) return json({ error: 'Gambar gagal disimpan.' }, { status: 502 });
  let storageId;
  try {
    ({ storageId } = await uploadResponse.json());
  } catch {
    return json({ error: 'Gambar gagal disimpan.' }, { status: 502 });
  }
  if (!storageId) return json({ error: 'Gambar gagal disimpan.' }, { status: 502 });

  let url;
  try {
    url = await convexMutation('files:getUrl', { storageId });
  } catch {
    return json({ error: 'Gambar gagal disimpan.' }, { status: 503 });
  }
  return json({ url }, { status: 201 });
}
