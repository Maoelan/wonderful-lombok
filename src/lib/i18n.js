export const languages = [
  { code: 'en', name: 'English', flag: 'gb', hreflang: 'en' },
  { code: 'zh-cn', name: '中文（简体）', flag: 'cn', hreflang: 'zh-Hans' },
  { code: 'zh-tw', name: '中文（繁體）', flag: 'tw', hreflang: 'zh-Hant' },
  { code: 'nl', name: 'Nederlands', flag: 'nl', hreflang: 'nl' },
  { code: 'fr', name: 'Français', flag: 'fr', hreflang: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de', hreflang: 'de' },
  { code: 'id', name: 'Indonesia', flag: 'id', hreflang: 'id-ID' },
  { code: 'ms', name: 'Melayu', flag: 'my', hreflang: 'ms' }
];
export const supportedLocales = languages.map((item) => item.code);
export const localePath = (locale, suffix = '') => locale === 'id' && !suffix ? '/' : `/${locale}${suffix}`;
export const alternateUrls = (origin, suffix = '') => Object.fromEntries(languages.map(({ code }) => [code, `${origin}${localePath(code, suffix)}`]));

export function isLocale(value) {
  return supportedLocales.includes(value);
}

export function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'paket';
}

const localized = (item, field, locale) => locale !== 'id' && item?.[`${field}En`] ? item[`${field}En`] : item?.[field];

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
      itinerary: locale !== 'id' && item.itineraryEn?.length ? item.itineraryEn : item.itinerary || [],
      includes: locale !== 'id' && item.includesEn?.length ? item.includesEn : item.includes || [],
      excludes: locale !== 'id' && item.excludesEn?.length ? item.excludesEn : item.excludes || [],
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
  const translated = {
    'zh-cn': { tours: '旅游套餐', travel: '接送服务', rental: '租车', destinations: '目的地', consult: 'WhatsApp 咨询', heroLabel: '龙目岛私人旅行', heroPrimary: '选择旅行服务', heroSecondary: '查看旅游套餐', start: '从这里开始', choiceTitle: '您在计划假期还是寻找交通服务？', viewTours: '查看旅游套餐', calculate: '计算接送费用', viewRental: '查看租车选项', tourHeading: '精选路线，体验龙目岛。', tourIntro: '选择适合您时间的套餐，查看行程、包含项目和价格。', viewDetail: '查看套餐详情', bookTour: '立即预订', allTours: '查看全部套餐', destinationLabel: '龙目岛目的地', destinationHeading: '海滩、岛屿与山脉。', travelHeading: '点对点接送服务。', rentalLabel: '车辆租赁', rentalHeading: '在龙目岛旅行的车辆。', why: '为什么选择我们', consultTrip: '规划您的旅程', faq: '常见问题', faqHeading: '出发之前。', contact: '联系我们', catalogTitle: '龙目岛旅游套餐', catalogIntro: '按时间和体验选择套餐，并在预订前查看行程。', backHome: '返回首页', from: '起价', itinerary: '行程', prices: '价格选择', includes: '费用包含', excludes: '费用不含', bookWhatsapp: '通过 WhatsApp 预订' },
    'zh-tw': { tours: '旅遊套餐', travel: '接送服務', rental: '租車', destinations: '目的地', consult: 'WhatsApp 諮詢', heroLabel: '龍目島私人旅行', heroPrimary: '選擇旅行服務', heroSecondary: '查看旅遊套餐', start: '從這裡開始', choiceTitle: '您在規劃假期還是尋找交通服務？', viewTours: '查看旅遊套餐', calculate: '計算接送費用', viewRental: '查看租車選項', tourHeading: '精選路線，體驗龍目島。', tourIntro: '選擇適合您時間的套餐，查看行程、包含項目和價格。', viewDetail: '查看套餐詳情', bookTour: '立即預訂', allTours: '查看全部套餐', destinationLabel: '龍目島目的地', destinationHeading: '海灘、島嶼與山脈。', travelHeading: '點對點接送服務。', rentalLabel: '車輛租賃', rentalHeading: '在龍目島旅行的車輛。', why: '為什麼選擇我們', consultTrip: '規劃您的旅程', faq: '常見問題', faqHeading: '出發之前。', contact: '聯絡我們', catalogTitle: '龍目島旅遊套餐', catalogIntro: '按時間和體驗選擇套餐，並在預訂前查看行程。', backHome: '返回首頁', from: '起價', itinerary: '行程', prices: '價格選擇', includes: '費用包含', excludes: '費用不含', bookWhatsapp: '透過 WhatsApp 預訂' },
    nl: { tours: 'Reispakketten', travel: 'Transfers', rental: 'Verhuur', destinations: 'Bestemmingen', consult: 'WhatsApp-advies', heroLabel: 'Privéreizen op Lombok', heroPrimary: 'Kies een reisdienst', heroSecondary: 'Bekijk reispakketten', start: 'Begin hier', choiceTitle: 'Plan je een vakantie of zoek je vervoer?', viewTours: 'Bekijk reispakketten', calculate: 'Bereken transferprijs', viewRental: 'Bekijk verhuur', tourHeading: 'Geselecteerde routes om Lombok te beleven.', tourIntro: 'Kies een pakket dat bij je tijd past. Bekijk route, inbegrepen diensten en prijzen.', viewDetail: 'Bekijk pakketdetails', bookTour: 'Boek nu', allTours: 'Bekijk alle pakketten', destinationLabel: 'Bestemmingen op Lombok', destinationHeading: 'Stranden, eilanden en bergen.', travelHeading: 'Vervoer van deur tot deur.', rentalLabel: 'Voertuigverhuur', rentalHeading: 'Een voertuig voor je verblijf op Lombok.', why: 'Waarom Wonderful Lombok', consultTrip: 'Plan je reis', faq: 'Veelgestelde vragen', faqHeading: 'Voor vertrek.', contact: 'Contact', catalogTitle: 'Reispakketten Lombok', catalogIntro: 'Kies op duur en ervaring en bekijk de route voor je boekt.', backHome: 'Terug naar home', from: 'Vanaf', itinerary: 'Reisplan', prices: 'Prijsopties', includes: 'Inbegrepen', excludes: 'Niet inbegrepen', bookWhatsapp: 'Boek via WhatsApp' },
    fr: { tours: 'Circuits', travel: 'Transferts', rental: 'Location', destinations: 'Destinations', consult: 'Conseil WhatsApp', heroLabel: 'Voyages privés à Lombok', heroPrimary: 'Choisir un service', heroSecondary: 'Voir les circuits', start: 'Commencez ici', choiceTitle: 'Vous préparez des vacances ou cherchez un transport ?', viewTours: 'Voir les circuits', calculate: 'Calculer le transfert', viewRental: 'Voir les locations', tourHeading: 'Des itinéraires choisis pour découvrir Lombok.', tourIntro: 'Choisissez selon votre temps. Consultez itinéraire, prestations et prix.', viewDetail: 'Voir les détails', bookTour: 'Réserver', allTours: 'Voir tous les circuits', destinationLabel: 'Destinations à Lombok', destinationHeading: 'Plages, îles et montagnes.', travelHeading: 'Transfert de point à point.', rentalLabel: 'Location de véhicule', rentalHeading: 'Un véhicule pour votre séjour à Lombok.', why: 'Pourquoi Wonderful Lombok', consultTrip: 'Planifier votre voyage', faq: 'Questions fréquentes', faqHeading: 'Avant le départ.', contact: 'Contact', catalogTitle: 'Circuits à Lombok', catalogIntro: 'Choisissez par durée et expérience, puis consultez le programme.', backHome: 'Retour à l’accueil', from: 'À partir de', itinerary: 'Programme', prices: 'Tarifs', includes: 'Inclus', excludes: 'Non inclus', bookWhatsapp: 'Réserver sur WhatsApp' },
    de: { tours: 'Reisepakete', travel: 'Transfers', rental: 'Vermietung', destinations: 'Reiseziele', consult: 'WhatsApp-Beratung', heroLabel: 'Private Reisen auf Lombok', heroPrimary: 'Reiseservice wählen', heroSecondary: 'Reisepakete ansehen', start: 'Hier beginnen', choiceTitle: 'Planen Sie Urlaub oder suchen Sie einen Transfer?', viewTours: 'Reisepakete ansehen', calculate: 'Transferpreis berechnen', viewRental: 'Mietoptionen ansehen', tourHeading: 'Ausgewählte Routen, um Lombok zu erleben.', tourIntro: 'Wählen Sie passend zu Ihrer Zeit. Prüfen Sie Ablauf, Leistungen und Preise.', viewDetail: 'Paketdetails ansehen', bookTour: 'Jetzt buchen', allTours: 'Alle Pakete ansehen', destinationLabel: 'Reiseziele auf Lombok', destinationHeading: 'Strände, Inseln und Berge.', travelHeading: 'Transfer von Ort zu Ort.', rentalLabel: 'Fahrzeugvermietung', rentalHeading: 'Ein Fahrzeug für Ihre Zeit auf Lombok.', why: 'Warum Wonderful Lombok', consultTrip: 'Reise planen', faq: 'Häufige Fragen', faqHeading: 'Vor der Reise.', contact: 'Kontakt', catalogTitle: 'Lombok Reisepakete', catalogIntro: 'Nach Dauer und Erlebnis wählen und vor der Buchung den Ablauf ansehen.', backHome: 'Zur Startseite', from: 'Ab', itinerary: 'Reiseablauf', prices: 'Preisoptionen', includes: 'Inklusive', excludes: 'Nicht inklusive', bookWhatsapp: 'Über WhatsApp buchen' },
    ms: { tours: 'Pakej pelancongan', travel: 'Pakej Travel', rental: 'Sewa kenderaan', destinations: 'Destinasi', consult: 'Konsultasi WhatsApp', heroLabel: 'Perjalanan peribadi di Lombok', heroPrimary: 'Pilih perkhidmatan', heroSecondary: 'Lihat pakej pelancongan', start: 'Mula di sini', choiceTitle: 'Anda merancang percutian atau mencari kenderaan?', viewTours: 'Lihat pakej', calculate: 'Kira tambang travel', viewRental: 'Lihat sewaan', tourHeading: 'Laluan pilihan untuk menikmati Lombok.', tourIntro: 'Pilih pakej mengikut masa anda. Lihat jadual, kemudahan dan harga.', viewDetail: 'Lihat butiran pakej', bookTour: 'Tempah sekarang', allTours: 'Lihat semua pakej', destinationLabel: 'Destinasi Lombok', destinationHeading: 'Pantai, pulau dan pergunungan.', travelHeading: 'Pengangkutan mengikut lokasi perjalanan.', rentalLabel: 'Sewa kenderaan', rentalHeading: 'Kenderaan sepanjang anda di Lombok.', why: 'Mengapa Wonderful Lombok', consultTrip: 'Rancang perjalanan', faq: 'Soalan lazim', faqHeading: 'Sebelum bertolak.', contact: 'Hubungi kami', catalogTitle: 'Pakej Pelancongan Lombok', catalogIntro: 'Pilih mengikut tempoh dan pengalaman, kemudian semak jadual sebelum menempah.', backHome: 'Kembali ke laman utama', from: 'Bermula', itinerary: 'Jadual perjalanan', prices: 'Pilihan harga', includes: 'Termasuk', excludes: 'Tidak termasuk', bookWhatsapp: 'Tempah melalui WhatsApp' }
  };
  return locale === 'id' ? id : { ...en, ...(translated[locale] || {}) };
}
