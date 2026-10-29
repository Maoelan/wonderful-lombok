import { slugify } from '../i18n.js';
import { CATALOG_SCHEMA_VERSION } from '../catalog-schema.js';
import { DESTINATION_REGION_KEYS } from '../catalog-display.js';
import { isDemoImage } from '../demo-images.js';

const optionalFlag = (value) => value === undefined || typeof value === 'boolean';
const optionalRegion = (value) => value === undefined || value === '' || DESTINATION_REGION_KEYS.includes(value);

const text = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
const optionalText = (value, max) => value === undefined || value === '' || text(value, 2, max);
export const validSlug = (value) => typeof value === 'string' && value.length > 0 && !/[^a-z0-9-]/.test(value) && !value.startsWith('-') && !value.endsWith('-') && !value.includes('--');
const optionalSlug = (value) => value === undefined || value === '' || (validSlug(value) && value.length <= 80);
const stringList = (value, maxItems = 30) => Array.isArray(value) && value.length <= maxItems && value.every((item) => text(item, 1, 500));
const validItinerary = (value) => Array.isArray(value) && value.length <= 14 && value.every((day) => text(day?.day, 1, 40) && text(day.title, 2, 200) && stringList(day.items || [], 30));

export function validUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !/[\u0000-\u001f\u007f'"\\]/.test(value);
  } catch {
    return false;
  }
}

export function isLocalConvexUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
}

function isLocalConvexStorageImage(value, allowLocalConvexStorage) {
  if (!allowLocalConvexStorage) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:'
      && url.port !== ''
      && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
      && !url.username
      && !url.password
      && /^\/api\/storage\/[A-Za-z0-9_-]+$/.test(url.pathname)
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

export function validImage(value, { allowLocalConvexStorage = false } = {}) {
  if (!value) return true;
  if (isDemoImage(value)) return true;
  if (/^\/uploads\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(value || '')) return true;
  if (isLocalConvexStorageImage(value, allowLocalConvexStorage)) return true;
  if (!validUrl(value)) return false;
  const hostname = new URL(value).hostname.toLowerCase();
  return ['images.unsplash.com', 'commons.wikimedia.org', 'thumb.wikimedia.org', 'upload.wikimedia.org'].includes(hostname) || hostname.endsWith('.convex.cloud');
}

function validGallery(images, options) {
  return Array.isArray(images) && images.length <= 12 && images.every((image) => validImage(image, options));
}

export function validateCatalog(catalog, options = {}) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) return 'Data katalog tidak valid.';
  if (catalog.schemaVersion !== CATALOG_SCHEMA_VERSION) return 'Versi skema katalog tidak didukung.';
  if (!Array.isArray(catalog.packages) || !Array.isArray(catalog.destinations) || !Array.isArray(catalog.rentals) || !Array.isArray(catalog.faqs)) return 'Data katalog tidak lengkap.';
  if (catalog.packages.length > 30 || catalog.destinations.length > 50 || catalog.rentals.length > 30 || catalog.faqs.length > 30) return 'Jumlah item katalog terlalu banyak.';

  const destinationKeys = catalog.destinations.map((item) => item?.slug || slugify(item?.name));
  if (new Set(destinationKeys).size !== destinationKeys.length || destinationKeys.some((slug) => !validSlug(slug))) return 'Data destinasi tidak valid.';
  const knownDestinationSlugs = new Set(destinationKeys);
  const slugs = new Set();
  const packagesValid = catalog.packages.every((item) => {
    if (!validSlug(item?.slug) || slugs.has(item.slug)) return false;
    slugs.add(item.slug);
    const tiersValid = Array.isArray(item.priceTiers) && item.priceTiers.length <= 30 && item.priceTiers.every((tier) => text(tier?.guests, 1, 100) && text(tier.price, 1, 50) && text(tier.note, 1, 100) && optionalText(tier.guestsEn, 100) && optionalText(tier.noteEn, 100));
    const related = item.destinationSlugs;
    const relationsValid = Array.isArray(related) && related.length <= 50 && new Set(related).size === related.length && related.every((slug) => typeof slug === 'string' && knownDestinationSlugs.has(slug));
    return text(item.name, 2, 100) && text(item.route, 2, 500) && text(item.detail, 2, 2000) && text(item.price, 2, 50) && text(item.unit, 2, 50) && text(item.category, 2, 100) && text(item.duration, 2, 100) && optionalText(item.nameEn, 100) && optionalText(item.routeEn, 500) && optionalText(item.detailEn, 2000) && optionalText(item.unitEn, 50) && optionalText(item.categoryEn, 100) && optionalText(item.durationEn, 100) && validItinerary(item.itinerary || []) && validItinerary(item.itineraryEn || []) && stringList(item.includes || []) && stringList(item.includesEn || []) && stringList(item.excludes || []) && stringList(item.excludesEn || []) && tiersValid && relationsValid && optionalFlag(item.featured) && validImage(item.image, options) && validGallery(item.images || [], options);
  });
  if (!packagesValid) return 'Data Paket Wisata tidak valid.';

  const destinationSlugs = new Set();
  const destinationsValid = catalog.destinations.every((item) => {
    const slug = item?.slug || slugify(item?.name);
    if (!validSlug(slug) || destinationSlugs.has(slug)) return false;
    destinationSlugs.add(slug);
    return text(item?.name, 2, 100) && text(item.note, 2, 300) && text(item.detail, 2, 2000) && optionalText(item.nameEn, 100) && optionalText(item.noteEn, 300) && optionalText(item.detailEn, 2000) && optionalFlag(item.featured) && optionalRegion(item.region) && validImage(item.image, options) && validGallery(item.images || [], options);
  });
  if (!destinationsValid) return 'Data destinasi tidak valid.';

  const rentalSlugs = new Set();
  const rentalsValid = catalog.rentals.every((item) => {
    if (!optionalSlug(item?.slug)) return false;
    if (item.slug && rentalSlugs.has(item.slug)) return false;
    if (item.slug) rentalSlugs.add(item.slug);
    return text(item?.symbol, 1, 10) && text(item.name, 2, 100) && text(item.detail, 2, 500) && text(item.price, 2, 100) && optionalText(item.nameEn, 100) && optionalText(item.detailEn, 500) && optionalText(item.priceEn, 100);
  });
  if (!rentalsValid) return 'Data rental tidak valid.';

  const faqSlugs = new Set();
  const faqsValid = catalog.faqs.every((item) => {
    if (!optionalSlug(item?.slug)) return false;
    if (item.slug && faqSlugs.has(item.slug)) return false;
    if (item.slug) faqSlugs.add(item.slug);
    return text(item?.question, 5, 200) && text(item.answer, 5, 1500) && optionalText(item.questionEn, 200) && optionalText(item.answerEn, 1500);
  });
  if (!faqsValid) return 'Pertanyaan atau jawaban FAQ tidak valid.';

  if (!Number.isFinite(Number(catalog.travelRate)) || Number(catalog.travelRate) < 1000 || Number(catalog.travelRate) > 1_000_000) return 'Tarif travel tidak valid.';
  const settings = catalog.settings;
  if (!settings || !/^62\d{8,13}$/.test(String(settings.whatsapp || '').replace(/\D/g, ''))) return 'Nomor WhatsApp harus memakai format internasional.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(settings.email || '')) || String(settings.email).length > 254) return 'Email tidak valid.';
  if (![settings.location, settings.heroTitle, settings.heroDescription, settings.aboutTitle, settings.aboutDescription].every((value) => text(value, 2, 1000))) return 'Informasi website tidak valid.';
  if (![settings.heroTitleEn, settings.heroDescriptionEn, settings.aboutTitleEn, settings.aboutDescriptionEn].every((value) => optionalText(value, 1000))) return 'Konten bahasa Inggris tidak valid.';
  if (![settings.heroImage, settings.aboutImage].every((value) => validImage(value, options))) return 'Gambar latar website tidak valid.';
  if (!['classic', 'ocean'].includes(settings.colorTheme)) return 'Pilihan warna website tidak valid.';
  if (![settings.instagram, settings.tiktok, settings.facebook].every(validUrl)) return 'Tautan media sosial harus menggunakan HTTPS.';
  return null;
}
