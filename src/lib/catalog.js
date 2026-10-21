import { CATALOG_SCHEMA_VERSION } from './catalog-schema.js';

const commons = (file) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file).replace(/'/g, '%27')}?width=1600`;
const p = {
  aan: commons('Tanjung Aan, Lombok.jpg'), aan2: commons('PANTAI TANJUNG AAN.jpg'), seger: commons('PANTAI SEGER.jpg'),
  sade: commons('Traditional Sasak Village Sade houses.JPG'), trawangan: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Gili_Trawangan.jpeg',
  meno: commons('Gili Meno, the smallest of the Gili Islands (16769118007).jpg'), water: commons('The beautiful turquoise water surrounding the Gili Islands (16975598051).jpg'),
  giliSunset: commons('Gili Trawangan Island, View of Bali and Agung Volcano, Sunset over Lombok Strait, Indonesia.jpg'),
  senggigi: commons('Senggigi Beach on 2019.jpg'), senggigiSunset: commons('Senja di Pantai Senggigi, Lombok.jpg'),
  agung: commons("Bali's Mighty Volcanic Mount Agung seen from Senggigi Beach, Lombok.jpg"), rinjani: commons('Mount Rinjani.jpg'),
  sembalun: commons('Pemandangan Taman Nasional Sembalun di Kaki Gunung Rinjani, Menghadap Pemukiman Baru Korban Gempa Lombok Timur.jpg'),
  trail: commons('Track ke plawangan sembalun dari segara anak, TN Gunung Rinjani.jpg')
};

export const defaultCatalog = {
  schemaVersion: CATALOG_SCHEMA_VERSION,
  travelRate: 10_000,
  settings: {
    whatsapp: '6281916550731', email: 'hello@wonderfullombok.com', location: 'Lombok, Nusa Tenggara Barat', instagram: '', tiktok: '', facebook: '',
    heroImage: p.aan2, aboutImage: p.sembalun, colorTheme: 'classic',
    heroTitle: 'Lombok, dirancang sesuai caramu bepergian.', heroTitleEn: 'Lombok, planned around the way you travel.',
    heroDescription: 'Pilih tur privat, antar-jemput antarlokasi, atau kendaraan dengan driver. Kami membantu merangkai rute yang masuk akal untuk waktu liburanmu.',
    heroDescriptionEn: 'Choose a private tour, point-to-point transfer, or a vehicle with a driver. We help shape a route that fits the time you have.',
    aboutTitle: 'Satu kontak untuk perjalananmu di Lombok.', aboutTitleEn: 'One contact for your Lombok journey.',
    aboutDescription: 'Mulai dari kedatangan di bandara, perjalanan antarpantai, hingga tur beberapa hari, setiap detail dikonfirmasi melalui WhatsApp sebelum keberangkatan.',
    aboutDescriptionEn: 'From airport arrival and beach transfers to multi-day tours, every detail is confirmed through WhatsApp before departure.'
  },
  packages: [
    {
      slug: 'lombok-selatan-budaya-sasak', category: 'Budaya & Pantai', categoryEn: 'Culture & Beaches', duration: '1 hari', durationEn: '1 day',
      name: 'Lombok Selatan & Budaya Sasak', nameEn: 'South Lombok & Sasak Culture', route: 'Desa Sade, Kuta Mandalika, Tanjung Aan, Bukit Merese', routeEn: 'Sade Village, Kuta Mandalika, Tanjung Aan, Merese Hill',
      destinationSlugs: ['kuta-mandalika', 'tanjung-aan'],
      detail: 'Tur privat sehari yang menggabungkan kehidupan masyarakat Sasak dengan pantai dan perbukitan Lombok Tengah. Urutan kunjungan menyesuaikan lokasi penjemputan dan kondisi lapangan.',
      detailEn: 'A private day tour combining Sasak village life with the beaches and hills of Central Lombok. The visiting order adapts to your pick-up point and local conditions.',
      price: 'Rp1.250.000', unit: 'per kendaraan', unitEn: 'per vehicle', image: p.aan2, images: [p.sade, p.seger],
      itinerary: [{ day: 'Pagi', title: 'Penjemputan dan Desa Sade', items: ['Penjemputan di hotel atau Bandara Internasional Lombok', 'Berjalan di Desa Sade dan melihat rumah tradisional Sasak', 'Perjalanan menuju Mandalika'] }, { day: 'Siang', title: 'Pantai selatan', items: ['Makan siang di area Kuta Mandalika', 'Waktu santai di Pantai Tanjung Aan', 'Singgah di Pantai Seger bila waktu memungkinkan'] }, { day: 'Sore', title: 'Bukit Merese dan kembali', items: ['Berjalan singkat menuju titik pandang Bukit Merese', 'Kembali ke hotel setelah menikmati sore'] }],
      itineraryEn: [{ day: 'Morning', title: 'Pick-up and Sade Village', items: ['Pick-up from a hotel or Lombok International Airport', 'Walk through Sade Village and see traditional Sasak houses', 'Continue to Mandalika'] }, { day: 'Afternoon', title: 'Southern beaches', items: ['Lunch in Kuta Mandalika', 'Leisure time at Tanjung Aan Beach', 'Stop at Seger Beach if time allows'] }, { day: 'Evening', title: 'Merese Hill and return', items: ['Short walk to a Merese Hill viewpoint', 'Return to your hotel after the late afternoon'] }],
      includes: ['Mobil privat ber-AC dan driver', 'BBM dan parkir', 'Air mineral', 'Penjemputan dan pengantaran dalam area yang disepakati'], includesEn: ['Private air-conditioned car and driver', 'Fuel and parking', 'Mineral water', 'Pick-up and drop-off within the agreed area'],
      excludes: ['Makan dan minuman', 'Tiket masuk atau donasi destinasi', 'Pengeluaran pribadi dan aktivitas tambahan'], excludesEn: ['Meals and drinks', 'Entrance fees or destination donations', 'Personal expenses and optional activities'],
      priceTiers: [{ guests: '1-5 orang', guestsEn: '1-5 people', price: 'Rp1.250.000', note: 'total per kendaraan', noteEn: 'total per vehicle' }, { guests: '6-10 orang', guestsEn: '6-10 people', price: 'Hubungi kami', note: 'kendaraan lebih besar', noteEn: 'larger vehicle' }]
    },
    {
      slug: 'gili-snorkeling-escape', category: 'Laut & Snorkeling', categoryEn: 'Sea & Snorkeling', duration: '1 hari', durationEn: '1 day',
      name: 'Gili Snorkeling Escape', nameEn: 'Gili Snorkeling Escape', route: 'Gili Trawangan, Gili Meno, Gili Air', routeEn: 'Gili Trawangan, Gili Meno, Gili Air',
      destinationSlugs: ['tiga-gili'],
      detail: 'Perjalanan privat menuju tiga Gili dengan perahu dan perlengkapan snorkeling. Waktu berenang dan singgah di pulau disusun bersama sebelum keberangkatan.', detailEn: 'A private trip to the three Gilis with a boat and snorkeling equipment. Swimming time and island stops are arranged before departure.',
      price: 'Rp1.450.000', unit: 'per paket', unitEn: 'per package', image: p.trawangan, images: [p.water, p.meno, p.giliSunset],
      itinerary: [{ day: 'Pagi', title: 'Menuju pelabuhan', items: ['Penjemputan di hotel', 'Perjalanan menuju pelabuhan', 'Briefing dan persiapan perlengkapan'] }, { day: 'Siang', title: 'Snorkeling dan island hopping', items: ['Snorkeling sesuai kondisi laut', 'Singgah di Gili Meno dan Gili Air', 'Waktu bebas untuk makan siang'] }, { day: 'Sore', title: 'Gili Trawangan dan kembali', items: ['Waktu santai di Gili Trawangan', 'Perahu kembali ke Lombok', 'Pengantaran ke hotel'] }],
      itineraryEn: [{ day: 'Morning', title: 'Transfer to the harbour', items: ['Hotel pick-up', 'Transfer to the harbour', 'Briefing and equipment preparation'] }, { day: 'Afternoon', title: 'Snorkeling and island hopping', items: ['Snorkeling based on sea conditions', 'Stops at Gili Meno and Gili Air', 'Free time for lunch'] }, { day: 'Evening', title: 'Gili Trawangan and return', items: ['Leisure time on Gili Trawangan', 'Boat back to Lombok', 'Transfer to your hotel'] }],
      includes: ['Transportasi darat privat', 'Perahu privat dan kru', 'Masker, snorkel, dan pelampung', 'Air mineral'], includesEn: ['Private land transfer', 'Private boat and crew', 'Mask, snorkel, and life jacket', 'Mineral water'],
      excludes: ['Makan siang', 'Retribusi lokal', 'Dokumentasi bawah air', 'Pengeluaran pribadi'], excludesEn: ['Lunch', 'Local fees', 'Underwater documentation', 'Personal expenses'],
      priceTiers: [{ guests: '1-2 orang', guestsEn: '1-2 people', price: 'Rp1.450.000', note: 'total paket', noteEn: 'package total' }, { guests: '3-5 orang', guestsEn: '3-5 people', price: 'Rp1.950.000', note: 'total paket', noteEn: 'package total' }]
    },
    {
      slug: 'romantic-lombok-2h1m', category: 'Perjalanan Pasangan', categoryEn: 'Couples Journey', duration: '2 hari 1 malam', durationEn: '2 days 1 night',
      name: 'Romantic Lombok 2H1M', nameEn: 'Romantic Lombok 2D1N', route: 'Senggigi, Malimbu, Gili, makan malam tepi pantai', routeEn: 'Senggigi, Malimbu, the Gilis, beachfront dinner',
      destinationSlugs: ['tiga-gili', 'senggigi'],
      detail: 'Paket dua hari untuk pasangan dengan perjalanan pesisir, satu malam menginap, dan waktu menikmati matahari terbenam tanpa rute yang terburu-buru.', detailEn: 'A two-day couple package with a coastal journey, one overnight stay, and time to enjoy the sunset without a rushed itinerary.',
      price: 'Rp3.900.000', unit: 'per pasangan', unitEn: 'per couple', image: p.senggigiSunset, images: [p.agung, p.giliSunset, p.meno],
      itinerary: [{ day: 'Hari 1', title: 'Pesisir barat dan matahari terbenam', items: ['Penjemputan privat', 'Singgah di titik pandang Malimbu', 'Check-in hotel area Senggigi', 'Makan malam pasangan di area tepi pantai'] }, { day: 'Hari 2', title: 'Pilihan Gili atau pagi santai', items: ['Sarapan di hotel', 'Pilihan perjalanan singkat ke Gili atau waktu bebas', 'Check-out dan pengantaran'] }],
      itineraryEn: [{ day: 'Day 1', title: 'West coast and sunset', items: ['Private pick-up', 'Stop at a Malimbu viewpoint', 'Check in at a Senggigi area hotel', 'Dinner for two in a beachfront area'] }, { day: 'Day 2', title: 'Gili option or a slow morning', items: ['Hotel breakfast', 'Choose a short Gili trip or free time', 'Check out and transfer'] }],
      includes: ['Mobil privat dan driver', 'Hotel satu malam untuk dua orang', 'Sarapan hotel', 'Makan malam untuk dua orang'], includesEn: ['Private car and driver', 'One-night hotel stay for two', 'Hotel breakfast', 'Dinner for two'],
      excludes: ['Tiket pesawat', 'Aktivitas laut opsional', 'Makan di luar yang disebutkan', 'Pengeluaran pribadi'], excludesEn: ['Flights', 'Optional sea activities', 'Meals not listed', 'Personal expenses'],
      priceTiers: [{ guests: '1 pasangan', guestsEn: '1 couple', price: 'Rp3.900.000', note: 'total paket mulai dari', noteEn: 'package total from' }]
    }
  ],
  destinations: [
    { name: 'Kuta Mandalika', nameEn: 'Kuta Mandalika', note: 'Basis perjalanan pantai selatan', noteEn: 'A base for the southern coast', detail: 'Kuta Mandalika menjadi titik praktis untuk menjangkau Tanjung Aan, Pantai Seger, Bukit Merese, dan desa tradisional di Lombok Tengah.', detailEn: 'Kuta Mandalika is a practical base for Tanjung Aan, Seger Beach, Merese Hill, and traditional villages in Central Lombok.', image: p.aan2, images: [p.seger, p.sade] },
    { name: 'Tanjung Aan', nameEn: 'Tanjung Aan', note: 'Teluk luas dengan pasir terang', noteEn: 'A broad bay with pale sand', detail: 'Garis pantai yang lebar dan air biru kehijauan. Kunjungan biasanya dipadukan dengan Bukit Merese dan Kuta Mandalika.', detailEn: 'A broad shoreline with turquoise water. A visit is often paired with Merese Hill and Kuta Mandalika.', image: p.aan2, images: [p.aan, p.seger] },
    { name: 'Tiga Gili', nameEn: 'The Three Gilis', note: 'Snorkeling dan perjalanan antarpulau', noteEn: 'Snorkeling and island hopping', detail: 'Gili Trawangan, Gili Meno, dan Gili Air memiliki suasana berbeda. Rute perahu menyesuaikan kondisi laut dan waktu di setiap pulau.', detailEn: 'Gili Trawangan, Gili Meno, and Gili Air each have a different atmosphere. The boat route adapts to sea conditions and your preferred island time.', image: p.trawangan, images: [p.water, p.meno, p.giliSunset] },
    { name: 'Sembalun', nameEn: 'Sembalun', note: 'Lembah dan panorama Rinjani', noteEn: 'Valleys and Rinjani views', detail: 'Kawasan pegunungan Lombok Timur yang dapat dinikmati melalui perjalanan darat, titik pandang perbukitan, dan kebun warga.', detailEn: 'An East Lombok highland area enjoyed through scenic drives, hill viewpoints, and local farms.', image: p.sembalun, images: [p.rinjani, p.trail] },
    { name: 'Senggigi', nameEn: 'Senggigi', note: 'Pesisir barat untuk sore santai', noteEn: 'A west-coast base for slow evenings', detail: 'Basis yang nyaman untuk perjalanan pesisir ke Malimbu, pelabuhan menuju Gili, atau menikmati matahari terbenam.', detailEn: 'A convenient base for coastal drives to Malimbu, transfers to a Gili harbour, or a relaxed sunset.', image: p.senggigi, images: [p.senggigiSunset, p.agung] }
  ],
  faqs: [
    { question: 'Apakah itinerary paket dapat diubah?', questionEn: 'Can I change a package itinerary?', answer: 'Bisa. Sampaikan destinasi, durasi, dan lokasi menginap. Tim akan menyusun urutan rute sebelum harga akhir dikonfirmasi.', answerEn: 'Yes. Share your destinations, available time, and accommodation. The team will arrange the route before confirming the final price.' },
    { question: 'Apakah semua perjalanan bersifat privat?', questionEn: 'Are all trips private?', answer: 'Paket pada situs ini menggunakan kendaraan privat untuk rombongan pemesan. Layanan bersama, bila ada, akan dijelaskan saat konfirmasi.', answerEn: 'Packages use a private vehicle for your party. Any shared service will be explained during confirmation.' },
    { question: 'Bisakah dijemput di bandara atau pelabuhan?', questionEn: 'Can I be picked up at the airport or harbour?', answer: 'Bisa. Bandara Internasional Lombok, Lembar, Bangsal, dan hotel dapat dipilih sebagai titik jemput.', answerEn: 'Yes. Lombok International Airport, Lembar, Bangsal, and hotels can be used as pick-up points.' },
    { question: 'Apakah estimasi Paket Travel sudah final?', questionEn: 'Is the Travel Package estimate final?', answer: 'Belum. Kalkulator memakai jarak rute jalan dan tarif Rp10.000 per kilometer. Tim memeriksa titik, waktu, dan kendaraan sebelum mengonfirmasi harga.', answerEn: 'Not yet. The calculator uses the driving route at IDR 10,000 per kilometre. The team checks the locations, timing, and vehicle before confirming the price.' },
    { question: 'Bagaimana cara memesan?', questionEn: 'How do I make a booking?', answer: 'Pilih layanan, isi detail perjalanan, lalu kirim ringkasannya melalui WhatsApp. Pesanan tercatat setelah jadwal, harga, dan pembayaran awal dikonfirmasi.', answerEn: 'Choose a service, complete the trip details, then send the summary through WhatsApp. A booking is recorded after the schedule, price, and initial payment are confirmed.' },
    { question: 'Bagaimana jika cuaca tidak mendukung?', questionEn: 'What if the weather is unsuitable?', answer: 'Aktivitas laut dan pegunungan dapat dijadwalkan ulang, diubah, atau dibatalkan sesuai kondisi dan kebijakan penyedia aktivitas.', answerEn: 'Sea and mountain activities may be rescheduled, changed, or cancelled based on conditions and the activity provider policy.' },
    { question: 'Apa yang perlu dibawa?', questionEn: 'What should I bring?', answer: 'Bawa identitas, alas kaki nyaman, pelindung matahari, obat pribadi, pakaian ganti untuk aktivitas air, dan uang tunai secukupnya.', answerEn: 'Bring identification, comfortable footwear, sun protection, personal medication, a change of clothes for water activities, and some cash.' }
  ],
  rentals: [
    { symbol: '🚗', name: 'Mobil Privat + Driver', nameEn: 'Private Car + Driver', detail: 'Mobil ber-AC untuk perjalanan di Lombok, cocok untuk 1-5 penumpang. Durasi dan area penggunaan dikonfirmasi sebelum berangkat.', detailEn: 'An air-conditioned car for travel within Lombok, suitable for 1-5 passengers. Usage hours and coverage are confirmed before departure.', price: 'Mulai Rp450.000 per 10 jam', priceEn: 'From IDR 450,000 per 10 hours' },
    { symbol: '🛵', name: 'Rental Motor', nameEn: 'Motorbike Rental', detail: 'Untuk perjalanan mandiri. Unit, helm, syarat identitas, area pengantaran, dan durasi sewa dikonfirmasi melalui WhatsApp.', detailEn: 'For independent travel. Bike availability, helmets, identification, delivery area, and rental period are confirmed through WhatsApp.', price: 'Mulai Rp75.000 per 24 jam', priceEn: 'From IDR 75,000 per 24 hours' }
  ]
};
