const JPEG_APP1 = 0xe1;
const JPEG_APP12 = 0xec;
const JPEG_APP13 = 0xed;
const JPEG_COM = 0xfe;
const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const text = (bytes, start, length) => String.fromCharCode(...bytes.subarray(start, start + length));

function readU16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32BE(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readU32LE(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function writeU32LE(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

function concat(parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function readExifOrientation(payload) {
  if (payload.length < 14 || text(payload, 0, 6) !== 'Exif\0\0') return null;
  const tiff = payload.subarray(6);
  const littleEndian = tiff[0] === 0x49 && tiff[1] === 0x49;
  const bigEndian = tiff[0] === 0x4d && tiff[1] === 0x4d;
  if (!littleEndian && !bigEndian) return null;
  const read16 = littleEndian ? readU16LE : readU16BE;
  const read32 = littleEndian ? readU32LE : readU32BE;
  if (read16(tiff, 2) !== 42) return null;
  const ifdOffset = read32(tiff, 4);
  if (ifdOffset + 2 > tiff.length) return null;
  const count = read16(tiff, ifdOffset);
  for (let index = 0; index < count; index += 1) {
    const entry = ifdOffset + 2 + index * 12;
    if (entry + 12 > tiff.length) break;
    if (read16(tiff, entry) !== 0x0112) continue;
    if (read16(tiff, entry + 2) !== 3 || read16(tiff, entry + 4) < 1) return null;
    const orientation = read16(tiff, entry + 8);
    return orientation >= 1 && orientation <= 8 ? orientation : null;
  }
  return null;
}

function minimalExifSegment(orientation) {
  const payload = new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation & 0xff, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ]);
  const length = payload.length + 2;
  return new Uint8Array([0xff, 0xe1, (length >>> 8) & 0xff, length & 0xff, ...payload]);
}

function isApp0(part) {
  return part[0] === 0xff && part[1] === 0xe0;
}

function stripJpeg(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Invalid JPEG');
  const parts = [bytes.subarray(0, 2)];
  let orientation = null;
  let position = 2;

  while (position < bytes.length) {
    const markerStart = position;
    if (bytes[position] !== 0xff) throw new Error('Invalid JPEG marker');
    while (position < bytes.length && bytes[position] === 0xff) position += 1;
    if (position >= bytes.length) throw new Error('Truncated JPEG marker');
    const marker = bytes[position];
    position += 1;

    if (marker === 0xd9) {
      parts.push(bytes.subarray(markerStart, position));
      return finishJpeg(parts, orientation);
    }
    if (marker === 0xda) {
      if (position + 2 > bytes.length) throw new Error('Truncated JPEG scan');
      const scanLength = readU16BE(bytes, position);
      if (scanLength < 2 || position + scanLength > bytes.length) throw new Error('Invalid JPEG scan');
      parts.push(bytes.subarray(markerStart));
      return finishJpeg(parts, orientation);
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(bytes.subarray(markerStart, position));
      continue;
    }

    if (position + 2 > bytes.length) throw new Error('Truncated JPEG segment');
    const segmentLength = readU16BE(bytes, position);
    if (segmentLength < 2 || position + segmentLength > bytes.length) throw new Error('Invalid JPEG segment');
    const segmentEnd = position + segmentLength;

    if (marker === JPEG_APP1) {
      const found = readExifOrientation(bytes.subarray(position + 2, segmentEnd));
      if (found > 1) orientation = found;
    } else if (marker !== JPEG_APP12 && marker !== JPEG_APP13 && marker !== JPEG_COM) {
      parts.push(bytes.subarray(markerStart, segmentEnd));
    }
    position = segmentEnd;
  }

  throw new Error('JPEG has no end marker');
}

function finishJpeg(parts, orientation) {
  if (orientation && orientation > 1) {
    const insertAt = parts.length > 1 && isApp0(parts[1]) ? 2 : 1;
    parts.splice(insertAt, 0, minimalExifSegment(orientation));
  }
  return concat(parts);
}

function stripPng(bytes) {
  if (bytes.length < 8 || !PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error('Invalid PNG');
  const parts = [bytes.subarray(0, 8)];
  let position = 8;
  let sawEnd = false;

  while (position < bytes.length) {
    if (position + 12 > bytes.length) throw new Error('Truncated PNG chunk');
    const length = readU32BE(bytes, position);
    const end = position + 12 + length;
    if (end > bytes.length) throw new Error('Invalid PNG chunk');
    const type = text(bytes, position + 4, 4);
    if (!['eXIf', 'tEXt', 'iTXt', 'zTXt'].includes(type)) parts.push(bytes.subarray(position, end));
    if (type === 'IEND') {
      sawEnd = true;
      break;
    }
    position = end;
  }

  if (!sawEnd) throw new Error('PNG has no end chunk');
  return concat(parts);
}

function stripWebp(bytes) {
  if (bytes.length < 12 || text(bytes, 0, 4) !== 'RIFF' || text(bytes, 8, 4) !== 'WEBP') throw new Error('Invalid WebP');
  const parts = [bytes.subarray(0, 12)];
  let position = 12;
  let sawImage = false;

  while (position + 8 <= bytes.length) {
    const type = text(bytes, position, 4);
    const length = readU32LE(bytes, position + 4);
    const dataStart = position + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + (length % 2);
    if (dataEnd > bytes.length || chunkEnd > bytes.length) throw new Error('Invalid WebP chunk');

    if (type === 'VP8X' && length >= 10) {
      const data = bytes.slice(dataStart, dataEnd);
      data[0] &= ~0x0c;
      parts.push(bytes.subarray(position, dataStart), data, bytes.subarray(dataEnd, chunkEnd));
    } else if (type !== 'EXIF' && type !== 'XMP ') {
      parts.push(bytes.subarray(position, chunkEnd));
    }

    if (type === 'VP8 ' || type === 'VP8L' || type === 'ANMF') sawImage = true;
    position = chunkEnd;
  }

  if (position !== bytes.length) throw new Error('Truncated WebP chunk');
  if (!sawImage) throw new Error('WebP has no image data');
  const result = concat(parts);
  writeU32LE(result, 4, result.length - 8);
  return result;
}

export function stripImageMetadata(bytes, type) {
  if (!(bytes instanceof Uint8Array)) throw new Error('Image content must be bytes');
  if (type === 'image/jpeg') return stripJpeg(bytes);
  if (type === 'image/png') return stripPng(bytes);
  if (type === 'image/webp') return stripWebp(bytes);
  throw new Error('Unsupported image type');
}
