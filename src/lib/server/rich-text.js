import sanitizeHtml from 'sanitize-html';

const options = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  allowedAttributes: { a: ['href', 'target', 'rel'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] },
  allowedSchemes: ['https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }) }
};

export const sanitizeRichText = (value) => sanitizeHtml(String(value || ''), options).trim();

export function sanitizeCatalogRichText(catalog) {
  const clean = structuredClone(catalog);
  for (const item of clean.packages || []) item.detail = sanitizeRichText(item.detail);
  for (const item of clean.destinations || []) item.detail = sanitizeRichText(item.detail);
  for (const item of clean.rentals || []) item.detail = sanitizeRichText(item.detail);
  for (const item of clean.faqs || []) item.answer = sanitizeRichText(item.answer);
  if (clean.settings) {
    clean.settings.heroDescription = sanitizeRichText(clean.settings.heroDescription);
    clean.settings.aboutDescription = sanitizeRichText(clean.settings.aboutDescription);
  }
  return clean;
}
