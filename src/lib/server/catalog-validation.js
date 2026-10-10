const text = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;

export function validUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !/[\u0000-\u001f\u007f'"\\]/.test(value);
  } catch {
    return false;
  }
}

export function validImage(value) {
  return /^\/uploads\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(value || '') || validUrl(value);
}

function validGallery(images) {
  return Array.isArray(images) && images.length <= 12 && images.every(validImage);
}

export function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) return 'Data katalog tidak valid.';
  if (!Array.isArray(catalog.packages) || !Array.isArray(catalog.destinations) || !Array.isArray(catalog.rentals) || !Array.isArray(catalog.faqs)) return 'Data katalog tidak lengkap.';
  if (catalog.packages.length > 30 || catalog.destinations.length > 50 || catalog.rentals.length > 30 || catalog.faqs.length > 30) return 'Jumlah item katalog terlalu banyak.';

  const packagesValid = catalog.packages.every((item) => text(item?.name, 2, 100) && text(item.route, 2, 500) && text(item.detail, 2, 2000) && text(item.price, 2, 50) && text(item.unit, 2, 50) && validImage(item.image) && validGallery(item.images || []));
  if (!packagesValid) return 'Data Paket Wisata tidak valid.';

  const destinationsValid = catalog.destinations.every((item) => text(item?.name, 2, 100) && text(item.note, 2, 300) && text(item.detail, 2, 2000) && validImage(item.image) && validGallery(item.images || []));
  if (!destinationsValid) return 'Data destinasi tidak valid.';

  const rentalsValid = catalog.rentals.every((item) => text(item?.symbol, 1, 10) && text(item.name, 2, 100) && text(item.detail, 2, 500) && text(item.price, 2, 100));
  if (!rentalsValid) return 'Data rental tidak valid.';

  const faqsValid = catalog.faqs.every((item) => text(item?.question, 5, 200) && text(item.answer, 5, 1500));
  if (!faqsValid) return 'Pertanyaan atau jawaban FAQ tidak valid.';

  if (!Number.isFinite(Number(catalog.travelRate)) || Number(catalog.travelRate) < 1000 || Number(catalog.travelRate) > 1_000_000) return 'Tarif travel tidak valid.';
  const settings = catalog.settings;
  if (!settings || !/^62\d{8,13}$/.test(String(settings.whatsapp || '').replace(/\D/g, ''))) return 'Nomor WhatsApp harus memakai format internasional.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(settings.email || '')) || String(settings.email).length > 254) return 'Email tidak valid.';
  if (![settings.location, settings.heroTitle, settings.heroDescription, settings.aboutTitle, settings.aboutDescription].every((value) => text(value, 2, 1000))) return 'Informasi website tidak valid.';
  if (![settings.instagram, settings.tiktok, settings.facebook].every(validUrl)) return 'Tautan media sosial harus menggunakan HTTPS.';
  return null;
}
