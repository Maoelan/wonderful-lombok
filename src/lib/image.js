const WIKIMEDIA_UPLOAD = 'upload.wikimedia.org';

export function imageUrl(source, width) {
  if (!source || !width) return source;
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

export function imageSrcset(source, widths) {
  return widths.map((width) => `${imageUrl(source, width)} ${width}w`).join(', ');
}
