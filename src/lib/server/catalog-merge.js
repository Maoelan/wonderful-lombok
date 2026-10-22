import { defaultCatalog } from '../catalog.js';
import { CATALOG_SCHEMA_VERSION } from '../catalog-schema.js';
import { normalizeDestinationSlugs } from '../catalog-relations.js';
import { destinationSlug, slugify } from '../i18n.js';
import { sanitizeCatalogRichText } from './rich-text.js';

export function mergeCatalogData(data = defaultCatalog) {
  const source = data || defaultCatalog;
  const destinationDefaults = new Map(defaultCatalog.destinations.map((item) => [destinationSlug(item), item]));
  const destinations = (source.destinations || defaultCatalog.destinations).map((item) => ({
    ...(destinationDefaults.get(destinationSlug(item)) || {}),
    images: [],
    ...item,
    slug: destinationSlug(item)
  }));

  const packageDefaults = new Map(defaultCatalog.packages.map((item) => [item.slug, item]));
  const mergePriceTiers = (item, fallback) => {
    const tiers = item.priceTiers?.length ? item.priceTiers : fallback.priceTiers || [];
    const fallbackTiers = new Map((fallback.priceTiers || []).map((tier) => [tier.key || slugify(tier.guests), tier]));
    return tiers.map((tier, index) => {
      const key = tier.key || fallback.priceTiers?.[index]?.key || slugify(tier.guests);
      return { ...(fallbackTiers.get(key) || {}), ...tier, key };
    });
  };
  const packages = (source.packages || defaultCatalog.packages).map((item) => {
    const slug = item.slug || slugify(item.name);
    const fallback = packageDefaults.get(slug) || {};
    const packageItem = {
      ...fallback,
      slug,
      category: item.category || fallback.category || 'Private tour',
      categoryEn: item.categoryEn || fallback.categoryEn || 'Private tour',
      duration: item.duration || fallback.duration || '1 hari',
      durationEn: item.durationEn || fallback.durationEn || '1 day',
      nameEn: item.nameEn || fallback.nameEn || item.name,
      routeEn: item.routeEn || fallback.routeEn || item.route,
      detail: '',
      detailEn: item.detailEn || fallback.detailEn || item.detail || '',
      unitEn: item.unitEn || fallback.unitEn || item.unit || '',
      images: item.images || [],
      ...item,
      itinerary: item.itinerary?.length ? item.itinerary : fallback.itinerary || [],
      itineraryEn: item.itineraryEn?.length ? item.itineraryEn : fallback.itineraryEn || [],
      includes: item.includes?.length ? item.includes : fallback.includes || [],
      includesEn: item.includesEn?.length ? item.includesEn : fallback.includesEn || [],
      excludes: item.excludes?.length ? item.excludes : fallback.excludes || [],
      excludesEn: item.excludesEn?.length ? item.excludesEn : fallback.excludesEn || [],
      priceTiers: mergePriceTiers(item, fallback)
    };
    return { ...packageItem, destinationSlugs: normalizeDestinationSlugs(item, destinations) };
  });

  const rentalDefaultsBySlug = new Map(defaultCatalog.rentals.map((item) => [item.slug, item]));
  const rentalDefaultsByName = new Map(defaultCatalog.rentals.map((item) => [item.name, item]));
  const faqDefaultsBySlug = new Map(defaultCatalog.faqs.map((item) => [item.slug, item]));
  const faqDefaultsByQuestion = new Map(defaultCatalog.faqs.map((item) => [item.question, item]));
  const defaultRental = (item) => rentalDefaultsBySlug.get(item?.slug) || rentalDefaultsByName.get(item?.name) || {};
  const defaultFaq = (item) => faqDefaultsBySlug.get(item?.slug) || faqDefaultsByQuestion.get(item?.question) || {};

  return sanitizeCatalogRichText({
    ...defaultCatalog,
    ...source,
    schemaVersion: source.schemaVersion ?? CATALOG_SCHEMA_VERSION,
    settings: { ...defaultCatalog.settings, ...source.settings },
    packages,
    destinations,
    rentals: (source.rentals || defaultCatalog.rentals).map((item) => {
      const fallback = defaultRental(item);
      return { ...fallback, ...item, slug: item?.slug || fallback.slug || slugify(item?.name) };
    }),
    faqs: (source.faqs || defaultCatalog.faqs).map((item) => {
      const fallback = defaultFaq(item);
      return { ...fallback, ...item, slug: item?.slug || fallback.slug || slugify(item?.question) };
    })
  });
}
