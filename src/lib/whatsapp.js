export const whatsappNumber = '6281916550731';

export function createWhatsAppUrl(message, number = whatsappNumber) {
  return `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
