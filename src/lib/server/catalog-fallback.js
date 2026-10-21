import { error } from '@sveltejs/kit';
import { logServerError } from './diagnostics.js';

export const maintenanceMessages = Object.freeze({
  id: 'Katalog sedang tidak dapat dimuat. Silakan coba lagi beberapa saat lagi.',
  en: 'The catalog is temporarily unavailable. Please try again in a few moments.',
  'zh-cn': '目录暂时无法加载。请稍后再试。',
  'zh-tw': '目錄暫時無法載入。請稍後再試。',
  nl: 'De catalogus is tijdelijk niet beschikbaar. Probeer het over een paar momenten opnieuw.',
  fr: 'Le catalogue est temporairement indisponible. Veuillez réessayer dans quelques instants.',
  de: 'Der Katalog ist vorübergehend nicht verfügbar. Bitte versuchen Sie es in Kürze erneut.',
  ms: 'Katalog tidak tersedia buat sementara waktu. Sila cuba lagi sebentar lagi.'
});

export function maintenanceMessage(locale = 'id') {
  return maintenanceMessages[locale] || maintenanceMessages.id;
}

export async function loadCatalogOrMaintenance(loadCatalog, locale = 'id') {
  try {
    return await loadCatalog();
  } catch (cause) {
    logServerError('catalog_load_failed', cause, { locale });
    error(503, maintenanceMessage(locale));
  }
}
