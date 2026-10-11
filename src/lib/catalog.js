export const defaultCatalog = {
  travelRate: 10_000,
  settings: {
    whatsapp: '6281916550731',
    email: 'hello@wonderfullombok.com',
    location: 'Lombok, Nusa Tenggara Barat',
    instagram: '',
    tiktok: '',
    facebook: '',
    heroTitle: 'Lombok, dengan perjalanan yang terasa milikmu.',
    heroTitleEn: 'Lombok, with a journey that feels like your own.',
    heroDescription: 'Paket wisata untuk liburan, Paket Travel untuk antar-jemput, dan rental kendaraan untuk perjalanan harian.',
    heroDescriptionEn: 'Private tours, point-to-point travel, and vehicle rental for your time in Lombok.',
    aboutTitle: 'Lebih fleksibel, lebih dekat dengan Lombok.',
    aboutTitleEn: 'More flexible, closer to Lombok.',
    aboutDescription: 'Kami membantu menyusun perjalanan sesuai waktu, tujuan, dan cara liburanmu. Mulai dari penjemputan sampai rute wisata.',
    aboutDescriptionEn: 'We shape your journey around your time, destinations, and travel style, from pick-up to a complete tour route.'
  },
  packages: [
    {
      slug: 'lombok-kabur', category: 'Budaya & Pantai', categoryEn: 'Culture & Beach', duration: '1 hari', durationEn: '1 day',
      name: 'Lombok Kabur', nameEn: 'Lombok Escape', route: 'Mandalika, Kuta, Tanjung Aan, Bukit Merese, Desa Sade', routeEn: 'Mandalika, Kuta, Tanjung Aan, Merese Hill, Sade Village',
      detail: 'Jelajahi pesisir Lombok Tengah dan desa tradisional dalam satu perjalanan privat.', detailEn: 'Explore South Lombok beaches and a traditional Sasak village in one private journey.',
      price: 'Rp1.250.000', unit: 'per orang', unitEn: 'per person', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Tanjung_Aan%2C_Lombok.jpg/1280px-Tanjung_Aan%2C_Lombok.jpg', images: [],
      itinerary: [{ day: 'Hari 1', title: 'Budaya Sasak dan pesisir selatan', items: ['Penjemputan di hotel atau bandara', 'Desa Sade', 'Pantai Tanjung Aan', 'Matahari terbenam di Bukit Merese'] }],
      itineraryEn: [{ day: 'Day 1', title: 'Sasak culture and the southern coast', items: ['Hotel or airport pick-up', 'Sade Village', 'Tanjung Aan Beach', 'Sunset at Merese Hill'] }],
      includes: ['Kendaraan privat dan driver', 'BBM dan parkir', 'Air mineral'], includesEn: ['Private vehicle and driver', 'Fuel and parking', 'Mineral water'],
      excludes: ['Makan pribadi', 'Tiket pesawat', 'Pengeluaran pribadi'], excludesEn: ['Personal meals', 'Flights', 'Personal expenses'],
      priceTiers: [{ guests: '1-2 orang', guestsEn: '1-2 people', price: 'Rp1.250.000', note: 'per orang', noteEn: 'per person' }]
    },
    {
      slug: 'gili-getaway', category: 'Laut & Snorkeling', categoryEn: 'Sea & Snorkeling', duration: '1 hari', durationEn: '1 day',
      name: 'Gili Getaway', nameEn: 'Gili Getaway', route: 'Gili Trawangan, snorkeling, sunset, island hopping', routeEn: 'Gili Trawangan, snorkeling, sunset, island hopping',
      detail: 'Perjalanan laut dan aktivitas santai untuk menikmati kawasan Gili.', detailEn: 'A relaxed island journey with snorkeling and time to enjoy the Gilis.',
      price: 'Rp1.450.000', unit: 'per orang', unitEn: 'per person', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Gili_Trawangan.jpeg', images: [],
      itinerary: [{ day: 'Hari 1', title: 'Island hopping tiga Gili', items: ['Penjemputan dan perjalanan ke pelabuhan', 'Snorkeling Gili Meno dan Gili Air', 'Waktu bebas di Gili Trawangan', 'Kembali ke hotel'] }],
      itineraryEn: [{ day: 'Day 1', title: 'Three Gili island hopping', items: ['Pick-up and transfer to the harbour', 'Snorkeling around Gili Meno and Gili Air', 'Free time on Gili Trawangan', 'Return to hotel'] }],
      includes: ['Transportasi darat', 'Perahu privat', 'Peralatan snorkeling'], includesEn: ['Land transfer', 'Private boat', 'Snorkeling equipment'],
      excludes: ['Makan pribadi', 'Dokumentasi bawah air', 'Pengeluaran pribadi'], excludesEn: ['Personal meals', 'Underwater documentation', 'Personal expenses'],
      priceTiers: [{ guests: '1-2 orang', guestsEn: '1-2 people', price: 'Rp1.450.000', note: 'per orang', noteEn: 'per person' }]
    },
    {
      slug: 'romantic-lombok', category: 'Pasangan', categoryEn: 'Couples', duration: '2 hari 1 malam', durationEn: '2 days 1 night',
      name: 'Romantic Lombok', nameEn: 'Romantic Lombok', route: 'Private tour, hotel, sunset dinner, couple experience', routeEn: 'Private tour, hotel, sunset dinner, couple experience',
      detail: 'Paket privat untuk pasangan dengan itinerary yang dapat disesuaikan.', detailEn: 'A private couple experience with a flexible itinerary.',
      price: 'Rp3.900.000', unit: 'per pasangan', unitEn: 'per couple', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Gili_Trawangan_Island%2C_View_of_Bali_and_Agung_Volcano%2C_Sunset_over_Lombok_Strait%2C_Indonesia.jpg/1280px-Gili_Trawangan_Island%2C_View_of_Bali_and_Agung_Volcano%2C_Sunset_over_Lombok_Strait%2C_Indonesia.jpg', images: [],
      itinerary: [{ day: 'Hari 1', title: 'Pantai dan makan malam sunset', items: ['Penjemputan privat', 'Pantai pilihan di Lombok Selatan', 'Makan malam saat sunset'] }, { day: 'Hari 2', title: 'Pagi santai dan pengantaran', items: ['Sarapan di hotel', 'Waktu bebas', 'Pengantaran ke tujuan berikutnya'] }],
      itineraryEn: [{ day: 'Day 1', title: 'Beach and sunset dinner', items: ['Private pick-up', 'Selected South Lombok beach', 'Sunset dinner'] }, { day: 'Day 2', title: 'A relaxed morning and transfer', items: ['Hotel breakfast', 'Free time', 'Transfer to your next destination'] }],
      includes: ['Kendaraan privat', 'Hotel 1 malam', 'Makan malam pasangan'], includesEn: ['Private vehicle', 'One-night hotel stay', 'Dinner for two'],
      excludes: ['Tiket pesawat', 'Aktivitas tambahan', 'Pengeluaran pribadi'], excludesEn: ['Flights', 'Additional activities', 'Personal expenses'],
      priceTiers: [{ guests: '1 pasangan', guestsEn: '1 couple', price: 'Rp3.900.000', note: 'total paket', noteEn: 'package total' }]
    }
  ],
  destinations: [
    { name: 'Mandalika', nameEn: 'Mandalika', note: 'Pantai dan petualangan', noteEn: 'Beaches and adventure', detail: 'Kawasan pesisir Lombok Tengah dengan pantai, bukit, dan akses menuju sirkuit.', detailEn: 'A coastal area with beaches, hills, and easy access to the Mandalika circuit.', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Tanjung_Aan%2C_Lombok.jpg/1280px-Tanjung_Aan%2C_Lombok.jpg', images: [] },
    { name: 'Tanjung Aan', nameEn: 'Tanjung Aan', note: 'Pasir putih dan laut tenang', noteEn: 'White sand and calm water', detail: 'Pantai berpasir putih yang cocok untuk bersantai dan menikmati pemandangan.', detailEn: 'A white-sand beach for swimming, relaxing, and enjoying the coast.', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Tanjung_Aan%2C_Lombok.jpg/1280px-Tanjung_Aan%2C_Lombok.jpg', images: [] },
    { name: 'Gili Islands', nameEn: 'Gili Islands', note: 'Snorkeling dan island hopping', noteEn: 'Snorkeling and island hopping', detail: 'Pilihan pulau kecil untuk snorkeling, berenang, dan menikmati matahari terbenam.', detailEn: 'Small islands for snorkeling, swimming, and watching the sunset.', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Gili_Trawangan.jpeg', images: [] },
    { name: 'Sembalun', nameEn: 'Sembalun', note: 'Pegunungan dan udara sejuk', noteEn: 'Mountain views and cool air', detail: 'Lembah pegunungan dengan jalur alam, perkebunan, dan panorama Rinjani.', detailEn: 'A mountain valley with nature trails, farms, and views of Mount Rinjani.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=82', images: [] },
    { name: 'Senggigi', nameEn: 'Senggigi', note: 'Pesisir untuk melihat sunset', noteEn: 'A coast made for sunsets', detail: 'Kawasan pantai di Lombok Barat dengan banyak pilihan penginapan dan kuliner.', detailEn: 'A West Lombok beach area with hotels, restaurants, and sunset views.', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=82', images: [] }
  ],
  faqs: [
    { question: 'Apakah itinerary bisa disesuaikan?', questionEn: 'Can the itinerary be customized?', answer: 'Bisa. Destinasi, durasi, aktivitas, dan transportasi dapat disesuaikan dengan kebutuhan perjalanan.', answerEn: 'Yes. Destinations, duration, activities, and transport can be adjusted to your trip.' },
    { question: 'Apakah tersedia perjalanan privat?', questionEn: 'Are private trips available?', answer: 'Tersedia untuk pasangan, keluarga, maupun grup. Sampaikan jumlah peserta saat konsultasi.', answerEn: 'Yes, for couples, families, and groups. Tell us your group size when you contact us.' },
    { question: 'Apakah travel bisa menjemput di bandara?', questionEn: 'Can the travel service pick me up at the airport?', answer: 'Bisa. Pilih Bandara Internasional Lombok sebagai titik jemput pada kalkulator untuk melihat estimasinya.', answerEn: 'Yes. Select Lombok International Airport as your pick-up point to see an estimate.' }
  ],
  rentals: [
    { symbol: '🚗', name: 'Mobil + Driver', nameEn: 'Car + Driver', detail: 'Untuk keluarga, grup, atau perjalanan privat.', detailEn: 'For families, groups, or private journeys.', price: 'Mulai Rp450.000 per hari', priceEn: 'From IDR 450,000 per day' },
    { symbol: '🛵', name: 'Rental Motor', nameEn: 'Motorbike Rental', detail: 'Untuk perjalanan mandiri yang lebih fleksibel.', detailEn: 'For flexible, independent travel.', price: 'Mulai Rp75.000 per hari', priceEn: 'From IDR 75,000 per day' }
  ]
};
