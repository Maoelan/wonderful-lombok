import { destinationSlug } from './i18n.js';

const words = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .split(/[^a-z0-9]+/)
  .filter((word) => word.length >= 4);

export function inferDestinationSlugs(item, destinations) {
  const source = words(`${item?.name || ''} ${item?.route || ''}`).join(' ');
  return destinations
    .filter((destination) => words(destination?.name).some((word) => source.includes(word)))
    .map(destinationSlug);
}

export function normalizeDestinationSlugs(item, destinations) {
  const slugs = Array.isArray(item?.destinationSlugs)
    ? item.destinationSlugs
    : inferDestinationSlugs(item, destinations);
  return [...new Set(slugs)];
}
