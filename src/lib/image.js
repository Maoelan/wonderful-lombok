const WIKIMEDIA_UPLOAD = 'upload.wikimedia.org';
const VERCEL_IMAGE_QUALITY = 70;

function canUseVercelImages() {
  if (typeof process !== 'undefined' && process.env?.VERCEL) return true;
  if (typeof location === 'undefined') return false;
  return !['localhost', '127.0.0.1'].includes(location.hostname);
}

function resizedSource(source, width) {
  if (!source || !width) return source;
  if (/^\/images\/lombok-ai\/[a-z-]+-\d+\.webp$/.test(source)) {
    const size = [480, 720, 960, 1280, 1600].find(size => size >= width) || 1600;
    return source.replace(/-\d+\.webp$/, `-${size}.webp`);
  }
  try {
    const url = new URL(source);
    if (url.hostname === 'commons.wikimedia.org' && url.pathname.includes('/Special:Redirect/file/')) {
      url.searchParams.set('width', String(width));
      return url.toString();
    }
    if (url.hostname === WIKIMEDIA_UPLOAD && url.pathname.startsWith('/wikipedia/commons/') && !url.pathname.includes('/thumb/')) {
      const filename = decodeURIComponent(url.pathname.split('/').at(-1));
      return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}?width=${width}`;
    }
  } catch {
    return source;
  }
  return source;
}

export function imageUrl(source, width) {
  const resized = resizedSource(source, width);
  if (resized?.startsWith('/images/lombok-ai/')) return resized;
  if (!canUseVercelImages() || !resized) return resized;
  return `/_vercel/image?url=${encodeURIComponent(resized)}&w=${width}&q=${VERCEL_IMAGE_QUALITY}`;
}

export function imageSrcset(source, widths) {
  if (source?.startsWith('/images/lombok-ai/')) {
    const sizes = [...new Set(widths.map(width => [480, 720, 960, 1280, 1600].find(size => size >= width) || 1600))];
    return sizes.map(width => `${imageUrl(source, width)} ${width}w`).join(', ');
  }
  return widths.map((width) => `${imageUrl(source, width)} ${width}w`).join(', ');
}
