function canonicalBase(publicSiteUrl) {
  if (typeof publicSiteUrl !== 'string' || !publicSiteUrl) return null;
  try {
    const url = new URL(publicSiteUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

function decodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Build a redirect to the canonical origin without ever allowing the path to
 * replace that origin. A leading `//` or `/\` is interpreted by `URL` as a
 * protocol-relative URL, so reject those paths (and malformed escapes) first.
 */
export function canonicalRedirectTarget({ pathname, search = '', publicSiteUrl }) {
  const base = canonicalBase(publicSiteUrl);
  if (!base) return null;
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return { invalid: true };

  const decodedPath = decodePath(pathname);
  const decodedSearch = decodePath(search);
  if (decodedPath === null || decodedSearch === null) return { invalid: true };
  if (decodedPath.startsWith('//') || decodedPath.startsWith('/\\') || decodedPath.includes('\\')) return { invalid: true };
  if (/[\u0000-\u001f\u007f\\]/.test(decodedSearch)) return { invalid: true };

  let target;
  try {
    target = new URL(base.origin);
    target.pathname = pathname;
    target.search = search;
  } catch {
    return { invalid: true };
  }
  if (target.origin !== base.origin || target.username || target.password) return { invalid: true };
  return { origin: base.origin, location: target.href };
}
