import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_REQUEST_BYTES,
  validateUploadContent,
  validateUploadRequestSize,
  validateUploadSize
} from '../src/lib/server/upload-validation.js';

const pad = (bytes, length = 16) => new Uint8Array([...bytes, ...Array(Math.max(0, length - bytes.length)).fill(0)]);

const jpeg = pad([0xff, 0xd8, 0xff, 0xe0]);
const png = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = pad([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

test('accepts JPEG, PNG, and WebP signatures with matching MIME types', () => {
  assert.equal(validateUploadContent('image/jpeg', jpeg).ok, true);
  assert.equal(validateUploadContent('image/png', png).ok, true);
  assert.equal(validateUploadContent('image/webp', webp).ok, true);
});

test('rejects a MIME type that does not match the file signature', () => {
  assert.equal(validateUploadContent('image/jpeg', png).ok, false);
  assert.equal(validateUploadContent('image/png', jpeg).ok, false);
  assert.equal(validateUploadContent('image/webp', png).ok, false);
  assert.equal(validateUploadContent('image/jpg', jpeg).ok, false);
});

test('rejects a WebP file without the WEBP suffix', () => {
  const riffOnly = pad([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x46]);
  assert.equal(validateUploadContent('image/webp', riffOnly).ok, false);
});

test('rejects truncated, empty, and non-byte content', () => {
  assert.equal(validateUploadContent('image/png', new Uint8Array([0x89, 0x50, 0x4e])).ok, false);
  assert.equal(validateUploadContent('image/png', new Uint8Array()).ok, false);
  assert.equal(validateUploadContent('image/png', null).ok, false);
  assert.equal(validateUploadContent('image/png', [...png]).ok, false);
});

test('enforces the per-file size limit', () => {
  assert.equal(validateUploadSize(1), null);
  assert.equal(validateUploadSize(MAX_UPLOAD_BYTES), null);
  assert.equal(validateUploadSize(0)?.status, 400);
  assert.equal(validateUploadSize(-1)?.status, 400);
  assert.equal(validateUploadSize(MAX_UPLOAD_BYTES + 1)?.status, 400);
  assert.equal(validateUploadSize(1.5)?.status, 400);
  assert.equal(validateUploadSize('1')?.status, 400);
});

test('keeps uploads below the Vercel function request limit', () => {
  assert.ok(MAX_UPLOAD_BYTES < MAX_UPLOAD_REQUEST_BYTES);
  assert.ok(MAX_UPLOAD_REQUEST_BYTES < 4.5 * 1024 * 1024);
});

test('enforces the larger multipart request limit', () => {
  assert.equal(validateUploadRequestSize(undefined), null);
  assert.equal(validateUploadRequestSize(''), null);
  assert.equal(validateUploadRequestSize(MAX_UPLOAD_REQUEST_BYTES), null);
  assert.equal(validateUploadRequestSize(MAX_UPLOAD_REQUEST_BYTES + 1)?.status, 413);
  assert.equal(validateUploadRequestSize(String(MAX_UPLOAD_REQUEST_BYTES + 1))?.status, 413);
});
