export const fallbackSocialImage = '/wonderful-lombok-icon-192.png';

export function getSocialImageUrl(value, origin) {
  let fallback;
  try {
    fallback = new URL(fallbackSocialImage, origin).href;
  } catch {
    return fallbackSocialImage;
  }
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate || candidate === '/') return fallback;
  try {
    const resolved = new URL(candidate, origin);
    return ['http:', 'https:'].includes(resolved.protocol) ? resolved.href : fallback;
  } catch {
    return fallback;
  }
}
