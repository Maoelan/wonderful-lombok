export const whatsappNumber = '6281916550731';

export function createWhatsAppUrl(message, number = whatsappNumber) {
  return `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function formatWhatsAppNumber(number) {
  const digits = String(number ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('62') ? digits : digits.startsWith('0') ? `62${digits.slice(1)}` : `62${digits}`;
  const local = normalized.slice(2);
  if (!local) return '+62';
  const grouped = local.length > 8
    ? `${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`
    : local.replace(/(\d{4})(?=\d)/g, '$1-');
  return `+62 ${grouped}`;
}
