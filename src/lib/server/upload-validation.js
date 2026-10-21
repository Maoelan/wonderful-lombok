export const MAX_UPLOAD_BYTES = 5_000_000;
export const MAX_UPLOAD_REQUEST_BYTES = 5_500_000;

export const uploadFormats = [
  { type: 'image/jpeg', extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  { type: 'image/png', extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'image/webp', extension: 'webp', signature: [0x52, 0x49, 0x46, 0x46], suffix: [0x57, 0x45, 0x42, 0x50] }
];

export function validateUploadSize(size) {
  if (!Number.isInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    return { error: 'Pilih gambar maksimal 5 MB.', status: 400 };
  }
  return null;
}

export function validateUploadRequestSize(contentLength) {
  if (Number(contentLength || 0) > MAX_UPLOAD_REQUEST_BYTES) {
    return { error: 'Ukuran gambar maksimal 5 MB.', status: 413 };
  }
  return null;
}

export function validateUploadContent(type, bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 12) {
    return { ok: false, error: 'Format gambar harus JPG, PNG, atau WebP yang valid.', status: 400 };
  }
  const format = uploadFormats.find((item) =>
    item.type === type
    && item.signature.every((byte, index) => bytes[index] === byte)
    && (!item.suffix || item.suffix.every((byte, index) => bytes[index + 8] === byte))
  );
  if (!format) return { ok: false, error: 'Format gambar harus JPG, PNG, atau WebP yang valid.', status: 400 };
  return { ok: true, format };
}
