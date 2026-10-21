import test from 'node:test';
import assert from 'node:assert/strict';
import { stripImageMetadata } from '../src/lib/server/image-metadata.js';

const JPEG = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD50ooor8MP9Uz/2Q==';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/jPwPAfAAUAAf+mXJtdAAAAAElFTkSuQmCC';
const WEBP = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

const bytes = (base64) => new Uint8Array(Buffer.from(base64, 'base64'));
const ascii = (value) => Uint8Array.from(value, (character) => character.charCodeAt(0));
const concat = (parts) => {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};
const u32be = (value) => new Uint8Array([(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]);
const u32le = (value) => new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]);
const readU32le = (value, offset) => value[offset] | (value[offset + 1] << 8) | (value[offset + 2] << 16) | (value[offset + 3] << 24);
const includesAscii = (value, needle) => Buffer.from(value).includes(Buffer.from(needle));
const findSequence = (value, sequence) => {
  outer: for (let index = 0; index <= value.length - sequence.length; index += 1) {
    for (let offset = 0; offset < sequence.length; offset += 1) if (value[index + offset] !== sequence[offset]) continue outer;
    return index;
  }
  return -1;
};

function pngChunk(type, data) {
  return concat([u32be(data.length), ascii(type), data, new Uint8Array(4)]);
}

function webpChunk(type, data) {
  return concat([ascii(type), u32le(data.length), data, new Uint8Array(data.length % 2)]);
}

function jpegExif(orientation, canary = 'GPS-CANARY') {
  const tiff = concat([
    new Uint8Array([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00]),
    new Uint8Array([0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00]),
    new Uint8Array([0x00, 0x00, 0x00, 0x00]),
    ascii(canary)
  ]);
  const payload = concat([ascii('Exif\u0000\u0000'), tiff]);
  const length = payload.length + 2;
  return concat([new Uint8Array([0xff, 0xe1, (length >>> 8) & 0xff, length & 0xff]), payload]);
}

test('strips JPEG EXIF/GPS but preserves orientation and image data', () => {
  const original = bytes(JPEG);
  const withMetadata = concat([original.subarray(0, 2), jpegExif(6), original.subarray(2)]);
  const result = stripImageMetadata(withMetadata, 'image/jpeg');

  assert.equal(includesAscii(result, 'GPS-CANARY'), false);
  assert.ok(result.length < withMetadata.length);
  assert.equal(result[2], 0xff);
  assert.equal(result[3], 0xe0);
  assert.notEqual(findSequence(result, new Uint8Array([0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 6, 0x00])), -1);

  const originalScan = findSequence(original, new Uint8Array([0xff, 0xda]));
  const resultScan = findSequence(result, new Uint8Array([0xff, 0xda]));
  assert.ok(originalScan > 0 && resultScan > 0);
  assert.deepEqual(result.subarray(resultScan), original.subarray(originalScan));
});

test('leaves a clean JPEG unchanged and drops orientation 1 metadata', () => {
  const original = bytes(JPEG);
  assert.deepEqual(stripImageMetadata(original, 'image/jpeg'), original);

  const withMetadata = concat([original.subarray(0, 2), jpegExif(1), original.subarray(2)]);
  assert.deepEqual(stripImageMetadata(withMetadata, 'image/jpeg'), original);
});

test('strips PNG eXIf and text chunks without changing the image chunks', () => {
  const original = bytes(PNG);
  const withMetadata = concat([
    original.subarray(0, 33),
    pngChunk('eXIf', ascii('GPS-CANARY')),
    pngChunk('tEXt', ascii('Author\u0000Secret')),
    original.subarray(33)
  ]);
  const result = stripImageMetadata(withMetadata, 'image/png');

  assert.deepEqual(result, original);
  assert.equal(includesAscii(result, 'GPS-CANARY'), false);
});

test('strips WebP EXIF and XMP chunks and restores the RIFF size', () => {
  const original = bytes(WEBP);
  const withMetadata = concat([
    original.subarray(0, 12),
    webpChunk('EXIF', ascii('GPS-CANARY')),
    webpChunk('XMP ', ascii('XMP-CANARY')),
    original.subarray(12)
  ]);
  withMetadata.set(u32le(withMetadata.length - 8), 4);

  const result = stripImageMetadata(withMetadata, 'image/webp');

  assert.deepEqual(result, original);
  assert.equal(readU32le(result, 4), result.length - 8);
  assert.equal(includesAscii(result, 'GPS-CANARY'), false);
  assert.equal(includesAscii(result, 'XMP-CANARY'), false);
});

test('clears WebP VP8X metadata flags', () => {
  const vp8x = new Uint8Array([0x0c, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00]);
  const chunks = concat([
    webpChunk('VP8X', vp8x),
    webpChunk('EXIF', ascii('GPS-CANARY')),
    webpChunk('VP8 ', new Uint8Array([1, 2, 3, 4]))
  ]);
  const file = concat([ascii('RIFF'), u32le(chunks.length + 4), ascii('WEBP'), chunks]);
  const result = stripImageMetadata(file, 'image/webp');
  const chunkStart = 12 + 8;

  assert.equal(includesAscii(result, 'GPS-CANARY'), false);
  assert.equal(readU32le(result, 4), result.length - 8);
  assert.equal(result[chunkStart], 0x00);
});

test('fails closed on malformed images and unsupported types', () => {
  assert.throws(() => stripImageMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]), 'image/jpeg'));
  assert.throws(() => stripImageMetadata(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), 'image/png'));
  assert.throws(() => stripImageMetadata(bytes(WEBP), 'image/gif'));
});
