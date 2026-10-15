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
  for (const item of clean.packages || []) for (const field of ['detail', 'detailEn']) item[field] = sanitizeRichText(item[field]);
  for (const item of clean.destinations || []) for (const field of ['detail', 'detailEn']) item[field] = sanitizeRichText(item[field]);
  for (const item of clean.rentals || []) for (const field of ['detail', 'detailEn']) item[field] = sanitizeRichText(item[field]);
  for (const item of clean.faqs || []) for (const field of ['answer', 'answerEn']) item[field] = sanitizeRichText(item[field]);
  if (clean.settings) {
    for (const field of ['heroDescription', 'heroDescriptionEn', 'aboutDescription', 'aboutDescriptionEn']) clean.settings[field] = sanitizeRichText(clean.settings[field]);
  }
  return clean;
}
