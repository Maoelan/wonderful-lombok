import { json } from '@sveltejs/kit';
import { consumeRateLimit } from '#lib/server/rate-limit.js';
import { tooManyRequests } from '#lib/server/http.js';
import { fetchWithRetry } from '#lib/server/upstream.js';
import { convexMutation } from '#lib/server/db.js';
import { stripImageMetadata } from '#lib/server/image-metadata.js';
import { validateUploadContent, validateUploadRequestSize, validateUploadSize } from '#lib/server/upload-validation.js';

async function removeUploadedFile(storageId) {
  try {
    await convexMutation('files:remove', { storageId });
  } catch {
    // Best effort: a failed cleanup must not mask the original upload error.
  }
}

export async function POST({ locals, request }) {
  if (!locals.user) return json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  const limit = consumeRateLimit(`upload:${locals.user.id}`, 30, 60 * 60_000);
  if (!limit.allowed) return tooManyRequests('Batas upload tercapai. Coba lagi nanti.', limit);
  const requestSizeError = validateUploadRequestSize(request.headers.get('content-length'));
  if (requestSizeError) return json({ error: requestSizeError.error }, { status: requestSizeError.status });

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Data upload tidak valid atau gambar terlalu besar. Maksimal 4 MB.' }, { status: 400 });
  }
  const file = form.get('image');
  if (!(file instanceof File)) return json({ error: 'Pilih gambar maksimal 4 MB.' }, { status: 400 });
  const sizeError = validateUploadSize(file.size);
  if (sizeError) return json({ error: sizeError.error }, { status: sizeError.status });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const content = validateUploadContent(file.type, bytes);
  if (!content.ok) return json({ error: content.error }, { status: content.status });
  const format = content.format;

  let sanitized;
  try {
    sanitized = stripImageMetadata(bytes, format.type);
  } catch {
    return json({ error: 'Gambar tidak dapat diproses.' }, { status: 400 });
  }

  let uploadUrl;
  try {
    uploadUrl = await convexMutation('files:generateUploadUrl');
  } catch {
    return json({ error: 'Gambar gagal disimpan.' }, { status: 503 });
  }

  let uploadResponse;
  try {
    uploadResponse = await fetchWithRetry(uploadUrl, { method: 'POST', headers: { 'content-type': format.type }, body: sanitized }, { timeoutMs: 20_000, retries: 0 });
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
    await removeUploadedFile(storageId);
    return json({ error: 'Gambar gagal disimpan.' }, { status: 503 });
  }
  if (!url) {
    await removeUploadedFile(storageId);
    return json({ error: 'Gambar gagal disimpan.' }, { status: 503 });
  }
  return json({ url }, { status: 201 });
}
