export const supportedLocales = ['id', 'en'];

export function isLocale(value) {
  return supportedLocales.includes(value);
}

export function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'paket';
}

const localized = (item, field, locale) => locale === 'en' && item?.[`${field}En`] ? item[`${field}En`] : item?.[field];

export function localizeCatalog(catalog, locale) {
  const settings = { ...catalog.settings };
  for (const field of ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription']) settings[field] = localized(settings, field, locale);
  return {
    ...catalog,
    settings,
    packages: catalog.packages.map((item) => ({
      ...item,
      slug: item.slug || slugify(item.name),
      name: localized(item, 'name', locale), route: localized(item, 'route', locale), detail: localized(item, 'detail', locale),
      category: localized(item, 'category', locale), duration: localized(item, 'duration', locale), unit: localized(item, 'unit', locale),
      itinerary: locale === 'en' && item.itineraryEn?.length ? item.itineraryEn : item.itinerary || [],
      includes: locale === 'en' && item.includesEn?.length ? item.includesEn : item.includes || [],
      excludes: locale === 'en' && item.excludesEn?.length ? item.excludesEn : item.excludes || [],
      priceTiers: (item.priceTiers || []).map((tier) => ({ ...tier, guests: localized(tier, 'guests', locale), note: localized(tier, 'note', locale) }))
    })),
    destinations: catalog.destinations.map((item) => ({ ...item, name: localized(item, 'name', locale), note: localized(item, 'note', locale), detail: localized(item, 'detail', locale) })),
    rentals: catalog.rentals.map((item) => ({ ...item, name: localized(item, 'name', locale), detail: localized(item, 'detail', locale), price: localized(item, 'price', locale) })),
    faqs: catalog.faqs.map((item) => ({ ...item, question: localized(item, 'question', locale), answer: localized(item, 'answer', locale) }))
  };
}

const id = {
  language: 'Bahasa', menu: 'Buka navigasi', tours: 'Paket wisata', travel: 'Paket Travel', rental: 'Rental', destinations: 'Destinasi', consult: 'Konsultasi WhatsApp',
  heroLabel: 'Private trip di Lombok', heroPrimary: 'Pilih kebutuhan perjalanan', heroSecondary: 'Lihat paket wisata', start: 'Mulai dari sini', choiceTitle: 'Kamu sedang merencanakan liburan atau mencari kendaraan?',
  tourChoice: 'Untuk kamu yang ingin itinerary, destinasi, dan perjalanan sudah disiapkan.', viewTours: 'Lihat pilihan paket', travelChoice: 'Untuk antar-jemput dari bandara, pelabuhan, hotel, atau kawasan wisata.', calculate: 'Hitung biaya travel', rentalChoice: 'Untuk menyewa mobil dengan driver atau motor selama berada di Lombok.', viewRental: 'Lihat pilihan rental',
  tourHeading: 'Rute pilihan untuk menikmati Lombok.', tourIntro: 'Pilih paket yang sesuai dengan waktumu. Buka detail untuk melihat itinerary, fasilitas, dan harga.', viewDetail: 'Lihat detail paket', bookTour: 'Pesan paket wisata', allTours: 'Lihat semua paket',
  destinationLabel: 'Destinasi Lombok', destinationHeading: 'Pantai, pulau kecil, dan pegunungan.', destinationIntro: 'Gunakan destinasi ini sebagai inspirasi. Tim Wonderful Lombok dapat membantu menyusunnya menjadi itinerary.',
  travelHeading: 'Antar-jemput sesuai titik perjalananmu.', travelIntro: 'Pilih lokasi jemput dan tujuan. Biaya dihitung berdasarkan perkiraan jarak perjalanan.', suitable: 'Cocok untuk', suitableValue: 'Bandara, pelabuhan, hotel, dan destinasi', ordering: 'Pemesanan', orderingValue: 'Konfirmasi langsung melalui WhatsApp', travelCalc: 'Hitung Paket Travel', travelCalcHeading: 'Masukkan titik jemput dan tujuanmu.', travelCalcIntro: 'Lihat perkiraan biaya, lalu kirim detail perjalanan kepada tim Wonderful Lombok.',
  rentalLabel: 'Rental kendaraan', rentalHeading: 'Kendaraan untuk dipakai selama di Lombok.', rentalIntro: 'Pilih rental harian jika kamu membutuhkan kendaraan untuk beberapa tujuan dalam satu hari.', bookRental: 'Pesan rental',
  why: 'Mengapa Wonderful Lombok', benefits: ['Private dan custom trip', 'Driver lokal', 'Itinerary fleksibel', 'Konsultasi melalui WhatsApp'], consultTrip: 'Konsultasikan perjalanan', faq: 'Pertanyaan umum', faqHeading: 'Sebelum berangkat.', localPartner: 'Partner lokal untuk perjalananmu di Lombok.', contact: 'Hubungi kami',
  catalogTitle: 'Paket Wisata Lombok', catalogIntro: 'Pilih berdasarkan durasi dan pengalaman, lalu buka detail itinerary sebelum memesan.', backHome: 'Kembali ke beranda', highlights: 'Highlight perjalanan', from: 'Mulai', detail: 'Detail paket', itinerary: 'Itinerary', prices: 'Pilihan harga', guests: 'Jumlah tamu', price: 'Harga', note: 'Keterangan', includes: 'Sudah termasuk', excludes: 'Belum termasuk', bookWhatsapp: 'Pesan paket via WhatsApp', otherTours: 'Paket lainnya'
};

const en = {
  language: 'Language', menu: 'Open navigation', tours: 'Tour Packages', travel: 'Travel Service', rental: 'Rental', destinations: 'Destinations', consult: 'WhatsApp Consultation',
  heroLabel: 'Private trips in Lombok', heroPrimary: 'Choose a travel service', heroSecondary: 'View tour packages', start: 'Start here', choiceTitle: 'Are you planning a holiday or looking for transport?',
  tourChoice: 'For travellers who want the itinerary, destinations, and transport prepared.', viewTours: 'View tour packages', travelChoice: 'For transfers from airports, harbours, hotels, or attractions.', calculate: 'Calculate travel cost', rentalChoice: 'For renting a car with driver or a motorbike during your stay.', viewRental: 'View rental options',
  tourHeading: 'Selected routes for experiencing Lombok.', tourIntro: 'Choose a package that fits your time. Open the details for itinerary, inclusions, and prices.', viewDetail: 'View package details', bookTour: 'Book this tour', allTours: 'View all packages',
  destinationLabel: 'Lombok destinations', destinationHeading: 'Beaches, islands, and mountains.', destinationIntro: 'Use these destinations as inspiration. Wonderful Lombok can help shape them into an itinerary.',
  travelHeading: 'Point-to-point travel for your journey.', travelIntro: 'Choose your pick-up point and destination. The estimate follows the road distance.', suitable: 'Suitable for', suitableValue: 'Airports, harbours, hotels, and attractions', ordering: 'Booking', orderingValue: 'Confirm directly through WhatsApp', travelCalc: 'Travel Cost Calculator', travelCalcHeading: 'Enter your pick-up point and destination.', travelCalcIntro: 'See the estimated cost, then send your trip details to Wonderful Lombok.',
  rentalLabel: 'Vehicle rental', rentalHeading: 'A vehicle for your time in Lombok.', rentalIntro: 'Choose a daily rental when you need transport for several destinations in one day.', bookRental: 'Book rental',
  why: 'Why Wonderful Lombok', benefits: ['Private and custom trips', 'Local drivers', 'Flexible itineraries', 'WhatsApp consultation'], consultTrip: 'Plan your journey', faq: 'Frequently asked questions', faqHeading: 'Before you travel.', localPartner: 'Your local partner for travelling around Lombok.', contact: 'Contact us',
  catalogTitle: 'Lombok Tour Packages', catalogIntro: 'Choose by duration and experience, then review the itinerary before booking.', backHome: 'Back to home', highlights: 'Trip highlights', from: 'From', detail: 'Package details', itinerary: 'Itinerary', prices: 'Price options', guests: 'Guests', price: 'Price', note: 'Notes', includes: 'Included', excludes: 'Not included', bookWhatsapp: 'Book via WhatsApp', otherTours: 'Other packages'
};

export function getCopy(locale) {
  return locale === 'en' ? en : id;
}
