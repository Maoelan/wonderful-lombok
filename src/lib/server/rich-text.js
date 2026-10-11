import { FilterXSS } from 'xss';

const filter = new FilterXSS({
  whiteList: {
    p: [], br: [], strong: [], b: [], em: [], i: [], u: [], h2: [], h3: [],
    ul: [], ol: [], li: [], a: ['href'], blockquote: [], table: [], thead: [],
    tbody: [], tr: [], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan']
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style']
});

export const sanitizeRichText = (value) => filter.process(String(value || '')).trim();

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
