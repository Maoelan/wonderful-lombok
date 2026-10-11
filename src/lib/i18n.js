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

const localizedSettings = {
  'zh-cn': { heroTitle: '按你的旅行方式，规划龙目岛。', heroDescription: '选择私人旅游、点对点接送或带司机的车辆。我们会根据你的时间安排合理路线。', aboutTitle: '一个联系人，安排你的龙目岛旅程。', aboutDescription: '从机场接机、海滩之间的接送到多日旅游，所有细节都会在出发前通过 WhatsApp 确认。' },
  'zh-tw': { heroTitle: '依你的旅行方式，規劃龍目島。', heroDescription: '選擇私人旅遊、點對點接送或附司機的車輛。我們會依照你的時間安排合適路線。', aboutTitle: '一個聯絡人，安排你的龍目島旅程。', aboutDescription: '從機場接送、海灘之間的交通到多日旅遊，所有細節都會在出發前透過 WhatsApp 確認。' },
  nl: { heroTitle: 'Lombok, gepland rond jouw manier van reizen.', heroDescription: 'Kies een privétour, transfer of voertuig met chauffeur. Wij maken een route die past bij de tijd die je hebt.', aboutTitle: 'Eén contactpersoon voor je reis op Lombok.', aboutDescription: 'Van aankomst op de luchthaven en strandtransfers tot meerdaagse tours: alle details worden vóór vertrek via WhatsApp bevestigd.' },
  fr: { heroTitle: 'Lombok, organisé selon votre façon de voyager.', heroDescription: 'Choisissez un circuit privé, un transfert ou un véhicule avec chauffeur. Nous créons un itinéraire adapté à votre temps.', aboutTitle: 'Un seul contact pour votre voyage à Lombok.', aboutDescription: 'De l’arrivée à l’aéroport aux transferts entre plages et aux circuits de plusieurs jours, chaque détail est confirmé sur WhatsApp avant le départ.' },
  de: { heroTitle: 'Lombok, passend zu Ihrer Art zu reisen.', heroDescription: 'Wählen Sie eine private Tour, einen Transfer oder ein Fahrzeug mit Fahrer. Wir planen eine Route passend zu Ihrer Zeit.', aboutTitle: 'Ein Kontakt für Ihre gesamte Lombok-Reise.', aboutDescription: 'Von der Abholung am Flughafen über Strandtransfers bis zu mehrtägigen Touren werden alle Details vor der Abfahrt über WhatsApp bestätigt.' },
  ms: { heroTitle: 'Lombok, dirancang mengikut cara anda mengembara.', heroDescription: 'Pilih lawatan peribadi, pemindahan terus atau kenderaan bersama pemandu. Kami menyusun laluan yang sesuai dengan masa anda.', aboutTitle: 'Satu hubungan untuk perjalanan anda di Lombok.', aboutDescription: 'Daripada ketibaan di lapangan terbang dan pemindahan antara pantai hingga lawatan beberapa hari, setiap butiran disahkan melalui WhatsApp sebelum bertolak.' }
};

const catalogTranslations = {
  'zh-cn': {
    packages: [
      { category: '文化与海滩', duration: '1天', name: '龙目岛南部与萨萨克文化', route: '萨德村、库塔曼达利卡、丹绒安、梅雷塞山', detail: '一日私人旅游，结合萨萨克村落生活与龙目岛中部的海滩和山丘。游览顺序会根据接送地点和现场情况调整。', unit: '每辆车' },
      { category: '海洋与浮潜', duration: '1天', name: '吉利群岛浮潜之旅', route: '吉利特拉旺安、吉利美诺、吉利艾尔', detail: '乘私人船前往三个吉利岛，并提供浮潜装备。游泳时间和登岛安排会在出发前共同确认。', unit: '每个套餐' },
      { category: '情侣之旅', duration: '2天1夜', name: '浪漫龙目岛 2天1夜', route: '圣吉吉、马林布、吉利群岛、海滨晚餐', detail: '为情侣设计的两日套餐，包括海岸旅程、一晚住宿和从容欣赏日落的时间。', unit: '每对情侣' }
    ],
    destinations: [
      { name: '库塔曼达利卡', note: '探索南部海岸的理想据点', detail: '从库塔曼达利卡可轻松前往丹绒安、塞格海滩、梅雷塞山及龙目岛中部的传统村落。' },
      { name: '丹绒安', note: '拥有浅色沙滩的宽阔海湾', detail: '这里有宽阔海岸线和碧绿色海水，通常与梅雷塞山和库塔曼达利卡一起游览。' },
      { name: '三个吉利岛', note: '浮潜与跳岛体验', detail: '吉利特拉旺安、吉利美诺和吉利艾尔各具特色，船程会依海况和停留时间调整。' },
      { name: '森巴伦', note: '山谷与林贾尼火山景观', detail: '龙目岛东部的高地，可欣赏公路风景、山丘观景点和当地农园。' },
      { name: '圣吉吉', note: '适合悠闲傍晚的西海岸据点', detail: '方便前往马林布、吉利岛港口，或轻松欣赏日落。' }
    ],
    rentals: [
      { name: '私人汽车与司机', detail: '配有空调，适合1至5名乘客在龙目岛出行。使用时间和服务范围会在出发前确认。', price: '10小时起价 IDR 450,000' },
      { name: '摩托车租赁', detail: '适合自由出行。车辆、头盔、证件要求、配送区域和租期将通过 WhatsApp 确认。', price: '24小时起价 IDR 75,000' }
    ],
    faqs: [
      { question: '可以调整套餐行程吗？', answer: '可以。请告知目的地、可用时间和住宿地点，团队会在确认最终价格前安排路线。' },
      { question: '所有行程都是私人的吗？', answer: '网站上的套餐为您的同行团队提供私人车辆。如有拼团服务，会在确认时说明。' },
      { question: '可以在机场或港口接送吗？', answer: '可以。龙目岛国际机场、伦巴尔、邦萨尔和酒店都可作为接送点。' },
      { question: '接送服务的估价是最终价格吗？', answer: '不是。计算器按公路路线和每公里 IDR 10,000 估算，团队会确认地点、时间和车辆后给出最终价格。' },
      { question: '如何预订？', answer: '选择服务并填写行程详情，再通过 WhatsApp 发送摘要。时间、价格和预付款确认后，预订才正式成立。' },
      { question: '天气不合适怎么办？', answer: '海上和山区活动可能根据天气及供应商政策改期、更改或取消。' },
      { question: '需要携带什么？', answer: '请携带身份证件、舒适鞋履、防晒用品、个人药品、水上活动替换衣物和适量现金。' }
    ]
  },
  'zh-tw': {
    packages: [
      { category: '文化與海灘', duration: '1天', name: '龍目島南部與薩薩克文化', route: '薩德村、庫塔曼達利卡、丹絨安、梅雷塞山', detail: '一日私人旅遊，結合薩薩克村落生活與龍目島中部的海灘和山丘。遊覽順序會依接送地點和現場狀況調整。', unit: '每輛車' },
      { category: '海洋與浮潛', duration: '1天', name: '吉利群島浮潛之旅', route: '吉利特拉旺安、吉利美諾、吉利艾爾', detail: '搭乘私人船前往三個吉利島，並提供浮潛裝備。游泳時間和登島安排會在出發前共同確認。', unit: '每個套裝' },
      { category: '情侶之旅', duration: '2天1夜', name: '浪漫龍目島 2天1夜', route: '聖吉吉、馬林布、吉利群島、海濱晚餐', detail: '為情侶設計的兩日套裝，包括海岸旅程、一晚住宿和從容欣賞日落的時間。', unit: '每對情侶' }
    ],
    destinations: [
      { name: '庫塔曼達利卡', note: '探索南部海岸的理想據點', detail: '從庫塔曼達利卡可輕鬆前往丹絨安、塞格海灘、梅雷塞山及龍目島中部的傳統村落。' },
      { name: '丹絨安', note: '擁有淺色沙灘的寬闊海灣', detail: '這裡有寬闊海岸線和碧綠色海水，通常與梅雷塞山和庫塔曼達利卡一起遊覽。' },
      { name: '三個吉利島', note: '浮潛與跳島體驗', detail: '吉利特拉旺安、吉利美諾和吉利艾爾各具特色，船程會依海況和停留時間調整。' },
      { name: '森巴倫', note: '山谷與林賈尼火山景觀', detail: '龍目島東部的高地，可欣賞公路風景、山丘觀景點和當地農園。' },
      { name: '聖吉吉', note: '適合悠閒傍晚的西海岸據點', detail: '方便前往馬林布、吉利島港口，或輕鬆欣賞日落。' }
    ],
    rentals: [
      { name: '私人汽車與司機', detail: '配有空調，適合1至5名乘客在龍目島出行。使用時間和服務範圍會在出發前確認。', price: '10小時起價 IDR 450,000' },
      { name: '摩托車租賃', detail: '適合自由出行。車輛、頭盔、證件要求、配送區域和租期將透過 WhatsApp 確認。', price: '24小時起價 IDR 75,000' }
    ],
    faqs: [
      { question: '可以調整套裝行程嗎？', answer: '可以。請告知目的地、可用時間和住宿地點，團隊會在確認最終價格前安排路線。' },
      { question: '所有行程都是私人嗎？', answer: '網站上的套裝為您的同行團體提供私人車輛。如有共乘服務，會在確認時說明。' },
      { question: '可以在機場或港口接送嗎？', answer: '可以。龍目島國際機場、倫巴爾、邦薩爾和飯店都可作為接送點。' },
      { question: '接送服務的估價是最終價格嗎？', answer: '不是。計算器依公路路線和每公里 IDR 10,000 估算，團隊確認地點、時間和車輛後才提供最終價格。' },
      { question: '如何預訂？', answer: '選擇服務並填寫行程詳情，再透過 WhatsApp 傳送摘要。時間、價格和預付款確認後，預訂才正式成立。' },
      { question: '天氣不合適怎麼辦？', answer: '海上和山區活動可能依天氣及供應商政策改期、更改或取消。' },
      { question: '需要攜帶什麼？', answer: '請攜帶身分證件、舒適鞋履、防曬用品、個人藥品、水上活動替換衣物和適量現金。' }
    ]
  }
};

const packageDetailTranslations = {
  'zh-cn': [
    {
      itinerary: [
        { day: '上午', title: '接送与萨德村', items: ['从酒店或龙目岛国际机场接送', '参观萨德村及传统萨萨克房屋', '继续前往曼达利卡'] },
        { day: '下午', title: '南部海滩', items: ['在库塔曼达利卡享用午餐', '在丹绒安海滩自由活动', '时间允许时停留塞格海滩'] },
        { day: '傍晚', title: '梅雷塞山与返程', items: ['步行前往梅雷塞山观景点', '傍晚结束后返回酒店'] }
      ],
      includes: ['私人空调汽车与司机', '燃油与停车费', '矿泉水', '约定区域内接送'],
      excludes: ['餐饮', '门票或景点捐款', '个人消费与自选活动'],
      priceTiers: [{ guests: '1至5人', price: 'Rp1.250.000', note: '每辆车总价' }, { guests: '6至10人', price: '联系我们', note: '使用更大型车辆' }]
    },
    {
      itinerary: [
        { day: '上午', title: '前往港口', items: ['酒店接送', '前往港口', '行程说明与装备准备'] },
        { day: '下午', title: '浮潜与跳岛', items: ['根据海况安排浮潜', '停留吉利美诺与吉利艾尔', '自由午餐时间'] },
        { day: '傍晚', title: '吉利特拉旺安与返程', items: ['在吉利特拉旺安自由活动', '乘船返回龙目岛', '送回酒店'] }
      ],
      includes: ['私人陆路接送', '私人船只与船员', '面镜、呼吸管与救生衣', '矿泉水'],
      excludes: ['午餐', '当地费用', '水下摄影', '个人消费'],
      priceTiers: [{ guests: '1至2人', price: 'Rp1.450.000', note: '套餐总价' }, { guests: '3至5人', price: 'Rp1.950.000', note: '套餐总价' }]
    },
    {
      itinerary: [
        { day: '第1天', title: '西海岸与日落', items: ['私人接送', '停留马林布观景点', '入住圣吉吉地区酒店', '海滨地区双人晚餐'] },
        { day: '第2天', title: '吉利岛选项或悠闲早晨', items: ['酒店早餐', '选择吉利岛短途行程或自由活动', '退房与送行'] }
      ],
      includes: ['私人汽车与司机', '双人一晚酒店住宿', '酒店早餐', '双人晚餐'],
      excludes: ['机票', '自选海上活动', '未列明餐饮', '个人消费'],
      priceTiers: [{ guests: '1对情侣', price: 'Rp3.900.000', note: '套餐起价' }]
    }
  ],
  'zh-tw': [
    {
      itinerary: [
        { day: '上午', title: '接送與薩德村', items: ['從飯店或龍目島國際機場接送', '參觀薩德村與傳統薩薩克房屋', '繼續前往曼達利卡'] },
        { day: '下午', title: '南部海灘', items: ['在庫塔曼達利卡享用午餐', '在丹絨安海灘自由活動', '時間允許時停留塞格海灘'] },
        { day: '傍晚', title: '梅雷塞山與返程', items: ['步行前往梅雷塞山觀景點', '傍晚結束後返回飯店'] }
      ],
      includes: ['私人空調汽車與司機', '燃油與停車費', '礦泉水', '約定區域內接送'],
      excludes: ['餐飲', '門票或景點捐款', '個人消費與自選活動'],
      priceTiers: [{ guests: '1至5人', price: 'Rp1.250.000', note: '每輛車總價' }, { guests: '6至10人', price: '聯絡我們', note: '使用較大型車輛' }]
    },
    {
      itinerary: [
        { day: '上午', title: '前往港口', items: ['飯店接送', '前往港口', '行程說明與裝備準備'] },
        { day: '下午', title: '浮潛與跳島', items: ['依海況安排浮潛', '停留吉利美諾與吉利艾爾', '自由午餐時間'] },
        { day: '傍晚', title: '吉利特拉旺安與返程', items: ['在吉利特拉旺安自由活動', '搭船返回龍目島', '送回飯店'] }
      ],
      includes: ['私人陸路接送', '私人船隻與船員', '面鏡、呼吸管與救生衣', '礦泉水'],
      excludes: ['午餐', '當地費用', '水下攝影', '個人消費'],
      priceTiers: [{ guests: '1至2人', price: 'Rp1.450.000', note: '套裝總價' }, { guests: '3至5人', price: 'Rp1.950.000', note: '套裝總價' }]
    },
    {
      itinerary: [
        { day: '第1天', title: '西海岸與日落', items: ['私人接送', '停留馬林布觀景點', '入住聖吉吉地區飯店', '海濱地區雙人晚餐'] },
        { day: '第2天', title: '吉利島選項或悠閒早晨', items: ['飯店早餐', '選擇吉利島短途行程或自由活動', '退房與送行'] }
      ],
      includes: ['私人汽車與司機', '雙人一晚飯店住宿', '飯店早餐', '雙人晚餐'],
      excludes: ['機票', '自選海上活動', '未列明餐飲', '個人消費'],
      priceTiers: [{ guests: '1對情侶', price: 'Rp3.900.000', note: '套裝起價' }]
    }
  ]
};

export function localizeCatalog(catalog, locale) {
  const translation = catalogTranslations[locale];
  const settings = { ...catalog.settings };
  for (const field of ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription']) settings[field] = localizedSettings[locale]?.[field] || localized(settings, field, locale);
  return {
    ...catalog,
    settings,
    packages: catalog.packages.map((item, index) => ({
      ...item,
      slug: item.slug || slugify(item.name),
      name: localized(item, 'name', locale), route: localized(item, 'route', locale), detail: localized(item, 'detail', locale),
      category: localized(item, 'category', locale), duration: localized(item, 'duration', locale), unit: localized(item, 'unit', locale),
      itinerary: locale !== 'id' && item.itineraryEn?.length ? item.itineraryEn : item.itinerary || [],
      includes: locale !== 'id' && item.includesEn?.length ? item.includesEn : item.includes || [],
      excludes: locale !== 'id' && item.excludesEn?.length ? item.excludesEn : item.excludes || [],
      priceTiers: (item.priceTiers || []).map((tier) => ({ ...tier, guests: localized(tier, 'guests', locale), note: localized(tier, 'note', locale) })),
      ...(translation?.packages[index] || {}),
      ...(packageDetailTranslations[locale]?.[index] || {})
    })),
    destinations: catalog.destinations.map((item, index) => ({ ...item, name: localized(item, 'name', locale), note: localized(item, 'note', locale), detail: localized(item, 'detail', locale), ...(translation?.destinations[index] || {}) })),
    rentals: catalog.rentals.map((item, index) => ({ ...item, name: localized(item, 'name', locale), detail: localized(item, 'detail', locale), price: localized(item, 'price', locale), ...(translation?.rentals[index] || {}) })),
    faqs: catalog.faqs.map((item, index) => ({ ...item, question: localized(item, 'question', locale), answer: localized(item, 'answer', locale), ...(translation?.faqs[index] || {}) }))
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
  catalogTitle: 'Paket Wisata Lombok', catalogIntro: 'Pilih berdasarkan durasi dan pengalaman, lalu buka detail itinerary sebelum memesan.', backHome: 'Kembali ke beranda', home: 'Beranda', highlights: 'Highlight perjalanan', from: 'Mulai', detail: 'Detail paket', itinerary: 'Itinerary', itineraryHeading: 'Rangkaian perjalananmu', prices: 'Pilihan harga', priceHeading: 'Harga berdasarkan jumlah tamu', guests: 'Jumlah tamu', price: 'Harga', note: 'Keterangan', includes: 'Sudah termasuk', excludes: 'Belum termasuk', bookWhatsapp: 'Pesan paket via WhatsApp', otherTours: 'Paket lainnya', readyTitle: 'Siap menjelajahi Lombok?', customItinerary: 'Butuh itinerary khusus?', image: 'gambar', viewImage: 'Lihat gambar'
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
  catalogTitle: 'Lombok Tour Packages', catalogIntro: 'Choose by duration and experience, then review the itinerary before booking.', backHome: 'Back to home', home: 'Home', highlights: 'Trip highlights', from: 'From', detail: 'Package details', itinerary: 'Itinerary', itineraryHeading: 'Your trip itinerary', prices: 'Price options', priceHeading: 'Prices by group size', guests: 'Guests', price: 'Price', note: 'Notes', includes: 'Included', excludes: 'Not included', bookWhatsapp: 'Book via WhatsApp', otherTours: 'Other packages', readyTitle: 'Ready to explore Lombok?', customItinerary: 'Need a custom itinerary?', image: 'image', viewImage: 'View image'
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
  const supplemental = {
    'zh-cn': { language: '语言', menu: '打开导航', tourChoice: '适合希望行程、景点和交通都已安排好的旅客。', travelChoice: '提供机场、港口、酒店和景点之间的接送。', rentalChoice: '在龙目岛期间租用带司机的汽车或摩托车。', destinationIntro: '以这些目的地作为灵感，Wonderful Lombok 可以帮您规划行程。', travelIntro: '选择接送地点和目的地，费用按公路距离估算。', suitable: '适合', suitableValue: '机场、港口、酒店和景点', ordering: '预订方式', orderingValue: '通过 WhatsApp 直接确认', travelCalc: '接送费用计算器', travelCalcHeading: '输入接送地点和目的地。', travelCalcIntro: '查看预估费用，然后将行程详情发送给 Wonderful Lombok。', rentalIntro: '如果一天内需要前往多个地点，请选择日租服务。', bookRental: '预订车辆', benefits: ['私人定制行程', '当地司机', '灵活行程', 'WhatsApp 咨询'], localPartner: '您在龙目岛旅行的当地伙伴。', highlights: '行程亮点', detail: '套餐详情', guests: '人数', price: '价格', note: '备注', otherTours: '其他套餐' },
    'zh-tw': { language: '語言', menu: '開啟導覽', tourChoice: '適合希望行程、景點和交通都已安排好的旅客。', travelChoice: '提供機場、港口、飯店和景點之間的接送。', rentalChoice: '在龍目島期間租用附司機的汽車或摩托車。', destinationIntro: '以這些目的地作為靈感，Wonderful Lombok 可以協助規劃行程。', travelIntro: '選擇接送地點和目的地，費用依公路距離估算。', suitable: '適合', suitableValue: '機場、港口、飯店和景點', ordering: '預訂方式', orderingValue: '透過 WhatsApp 直接確認', travelCalc: '接送費用計算器', travelCalcHeading: '輸入接送地點和目的地。', travelCalcIntro: '查看預估費用，再將行程詳情傳送給 Wonderful Lombok。', rentalIntro: '若一天內需要前往多個地點，請選擇日租服務。', bookRental: '預訂車輛', benefits: ['私人客製行程', '當地司機', '彈性行程', 'WhatsApp 諮詢'], localPartner: '您在龍目島旅行的當地夥伴。', highlights: '行程亮點', detail: '套裝詳情', guests: '人數', price: '價格', note: '備註', otherTours: '其他套裝' },
    nl: { language: 'Taal', menu: 'Navigatie openen', tourChoice: 'Voor reizigers die route, bestemmingen en vervoer geregeld willen hebben.', travelChoice: 'Voor transfers tussen luchthaven, haven, hotel en bezienswaardigheden.', rentalChoice: 'Voor een auto met chauffeur of scooter tijdens je verblijf.', destinationIntro: 'Gebruik deze bestemmingen als inspiratie. Wonderful Lombok helpt er een route van te maken.', travelIntro: 'Kies vertrekpunt en bestemming. De prijs volgt de afstand over de weg.', suitable: 'Geschikt voor', suitableValue: 'Luchthavens, havens, hotels en bezienswaardigheden', ordering: 'Boeken', orderingValue: 'Rechtstreeks bevestigen via WhatsApp', travelCalc: 'Transferprijs berekenen', travelCalcHeading: 'Vul vertrekpunt en bestemming in.', travelCalcIntro: 'Bekijk de schatting en stuur je reisgegevens naar Wonderful Lombok.', rentalIntro: 'Kies dagverhuur wanneer je op één dag meerdere bestemmingen bezoekt.', bookRental: 'Voertuig boeken', benefits: ['Privé- en maatwerkreizen', 'Lokale chauffeurs', 'Flexibele routes', 'Advies via WhatsApp'], localPartner: 'Je lokale reispartner op Lombok.', highlights: 'Hoogtepunten', detail: 'Pakketdetails', guests: 'Reizigers', price: 'Prijs', note: 'Opmerking', otherTours: 'Andere pakketten' },
    fr: { language: 'Langue', menu: 'Ouvrir la navigation', tourChoice: 'Pour les voyageurs qui souhaitent un itinéraire, des étapes et un transport organisés.', travelChoice: 'Pour les transferts entre aéroport, port, hôtel et sites touristiques.', rentalChoice: 'Pour louer une voiture avec chauffeur ou un scooter pendant le séjour.', destinationIntro: 'Inspirez-vous de ces destinations. Wonderful Lombok vous aide à créer votre itinéraire.', travelIntro: 'Choisissez le départ et la destination. Le tarif suit la distance routière.', suitable: 'Idéal pour', suitableValue: 'Aéroports, ports, hôtels et sites touristiques', ordering: 'Réservation', orderingValue: 'Confirmation directe sur WhatsApp', travelCalc: 'Calculateur de transfert', travelCalcHeading: 'Saisissez le départ et la destination.', travelCalcIntro: 'Consultez l’estimation puis envoyez vos informations à Wonderful Lombok.', rentalIntro: 'Choisissez une location à la journée pour visiter plusieurs lieux le même jour.', bookRental: 'Réserver le véhicule', benefits: ['Voyages privés et sur mesure', 'Chauffeurs locaux', 'Itinéraires flexibles', 'Conseil par WhatsApp'], localPartner: 'Votre partenaire local pour voyager à Lombok.', highlights: 'Temps forts', detail: 'Détails du circuit', guests: 'Voyageurs', price: 'Prix', note: 'Remarque', otherTours: 'Autres circuits' },
    de: { language: 'Sprache', menu: 'Navigation öffnen', tourChoice: 'Für Reisende, die Route, Ziele und Transport vorbereitet wünschen.', travelChoice: 'Für Transfers zwischen Flughafen, Hafen, Hotel und Sehenswürdigkeiten.', rentalChoice: 'Für ein Auto mit Fahrer oder einen Roller während des Aufenthalts.', destinationIntro: 'Nutzen Sie diese Ziele als Inspiration. Wonderful Lombok plant daraus Ihre Route.', travelIntro: 'Wählen Sie Abholort und Ziel. Der Preis richtet sich nach der Straßenentfernung.', suitable: 'Geeignet für', suitableValue: 'Flughäfen, Häfen, Hotels und Sehenswürdigkeiten', ordering: 'Buchung', orderingValue: 'Direkte Bestätigung über WhatsApp', travelCalc: 'Transferpreis berechnen', travelCalcHeading: 'Abholort und Ziel eingeben.', travelCalcIntro: 'Schätzung ansehen und Reisedaten an Wonderful Lombok senden.', rentalIntro: 'Wählen Sie eine Tagesmiete für mehrere Ziele an einem Tag.', bookRental: 'Fahrzeug buchen', benefits: ['Private Reisen nach Maß', 'Lokale Fahrer', 'Flexible Routen', 'Beratung über WhatsApp'], localPartner: 'Ihr lokaler Reisepartner auf Lombok.', highlights: 'Höhepunkte', detail: 'Paketdetails', guests: 'Reisende', price: 'Preis', note: 'Hinweis', otherTours: 'Weitere Pakete' },
    ms: { language: 'Bahasa', menu: 'Buka navigasi', tourChoice: 'Untuk pelancong yang mahukan jadual, destinasi dan pengangkutan disediakan.', travelChoice: 'Untuk pemindahan antara lapangan terbang, pelabuhan, hotel dan tempat tarikan.', rentalChoice: 'Untuk menyewa kereta bersama pemandu atau motosikal sepanjang penginapan.', destinationIntro: 'Gunakan destinasi ini sebagai inspirasi. Wonderful Lombok boleh membantu menyusun jadual perjalanan.', travelIntro: 'Pilih lokasi jemput dan destinasi. Anggaran mengikut jarak jalan raya.', suitable: 'Sesuai untuk', suitableValue: 'Lapangan terbang, pelabuhan, hotel dan tempat tarikan', ordering: 'Tempahan', orderingValue: 'Sahkan terus melalui WhatsApp', travelCalc: 'Kalkulator tambang travel', travelCalcHeading: 'Masukkan lokasi jemput dan destinasi.', travelCalcIntro: 'Lihat anggaran dan hantar butiran perjalanan kepada Wonderful Lombok.', rentalIntro: 'Pilih sewaan harian jika anda menuju ke beberapa destinasi dalam sehari.', bookRental: 'Tempah kenderaan', benefits: ['Perjalanan peribadi dan tersuai', 'Pemandu tempatan', 'Jadual fleksibel', 'Konsultasi WhatsApp'], localPartner: 'Rakan tempatan untuk perjalanan anda di Lombok.', highlights: 'Sorotan perjalanan', detail: 'Butiran pakej', guests: 'Tetamu', price: 'Harga', note: 'Catatan', otherTours: 'Pakej lain' }
  };
  const detailTranslations = {
    'zh-cn': { home: '首页', itineraryHeading: '您的旅行行程', priceHeading: '按人数选择价格', readyTitle: '准备探索龙目岛了吗？', customItinerary: '需要定制行程吗？', image: '图片', viewImage: '查看图片' },
    'zh-tw': { home: '首頁', itineraryHeading: '您的旅行行程', priceHeading: '依人數選擇價格', readyTitle: '準備探索龍目島了嗎？', customItinerary: '需要客製行程嗎？', image: '圖片', viewImage: '查看圖片' },
    nl: { home: 'Home', itineraryHeading: 'Uw reisprogramma', priceHeading: 'Prijzen per groepsgrootte', readyTitle: 'Klaar om Lombok te ontdekken?', customItinerary: 'Een route op maat nodig?', image: 'afbeelding', viewImage: 'Afbeelding bekijken' },
    fr: { home: 'Accueil', itineraryHeading: 'Votre itinéraire', priceHeading: 'Tarifs selon la taille du groupe', readyTitle: 'Prêt à découvrir Lombok ?', customItinerary: 'Besoin d’un itinéraire sur mesure ?', image: 'image', viewImage: 'Voir l’image' },
    de: { home: 'Startseite', itineraryHeading: 'Ihr Reiseablauf', priceHeading: 'Preise nach Gruppengröße', readyTitle: 'Bereit, Lombok zu entdecken?', customItinerary: 'Benötigen Sie eine individuelle Route?', image: 'Bild', viewImage: 'Bild ansehen' },
    ms: { home: 'Laman utama', itineraryHeading: 'Jadual perjalanan anda', priceHeading: 'Harga mengikut bilangan tetamu', readyTitle: 'Bersedia meneroka Lombok?', customItinerary: 'Perlukan jadual khas?', image: 'gambar', viewImage: 'Lihat gambar' }
  };
  return locale === 'id' ? id : { ...en, ...(translated[locale] || {}), ...(supplemental[locale] || {}), ...(detailTranslations[locale] || {}) };
}

const formId = { pickup: 'Lokasi jemput', destination: 'Tujuan', address: 'Ketik alamat, lalu tekan Enter', searching: 'Mencari…', useLocation: 'Gunakan lokasi saya', locating: 'Mencari GPS…', popular: 'Atau pilih lokasi populer', guidance: 'Ketik alamat lalu tekan Enter, pilih lokasi populer, atau klik langsung pada peta.', loadingMap: 'Memuat peta Lombok', findingRoute: 'Mencari rute jalan', estimate: 'Estimasi perjalanan', calculating: 'Menghitung…', rate: 'Tarif per km rute jalan', from: 'Dari', to: 'Ke', notSelected: 'Belum dipilih', customer: 'Nama pemesan', fullName: 'Nama lengkap', whatsapp: 'Nomor WhatsApp', date: 'Tanggal', time: 'Waktu', passengers: 'Jumlah penumpang', bookTravel: 'Pesan Paket Travel via WhatsApp', estimateNote: 'Harga merupakan perkiraan. Tim Wonderful Lombok akan mengonfirmasi detail perjalanan melalui WhatsApp.', bookNow: 'Pesan Sekarang', close: 'Tutup', booking: 'Permintaan pemesanan', bookingIntro: 'Isi data singkat berikut, lalu lanjutkan konfirmasi melalui WhatsApp.', travelDate: 'Tanggal perjalanan', guests: 'Jumlah peserta', notes: 'Catatan opsional', notesPlaceholder: 'Permintaan khusus atau lokasi penjemputan', saveContinue: 'Simpan dan lanjut ke WhatsApp', saving: 'Menyimpan…', destinationDetails: 'Detail destinasi', previousImage: 'Gambar sebelumnya', nextImage: 'Gambar berikutnya' };
const formEn = { pickup: 'Pick-up location', destination: 'Destination', address: 'Type an address, then press Enter', searching: 'Searching…', useLocation: 'Use my location', locating: 'Locating…', popular: 'Or choose a popular location', guidance: 'Type an address and press Enter, choose a popular location, or click the map.', loadingMap: 'Loading Lombok map', findingRoute: 'Finding road route', estimate: 'Trip estimate', calculating: 'Calculating…', rate: 'Rate per road kilometre', from: 'From', to: 'To', notSelected: 'Not selected', customer: 'Customer name', fullName: 'Full name', whatsapp: 'WhatsApp number', date: 'Date', time: 'Time', passengers: 'Passengers', bookTravel: 'Book Travel Service via WhatsApp', estimateNote: 'This is an estimate. Wonderful Lombok will confirm the trip details through WhatsApp.', bookNow: 'Book Now', close: 'Close', booking: 'Booking request', bookingIntro: 'Enter your details, then continue the confirmation through WhatsApp.', travelDate: 'Travel date', guests: 'Number of guests', notes: 'Optional notes', notesPlaceholder: 'Special requests or pick-up location', saveContinue: 'Save and continue to WhatsApp', saving: 'Saving…', destinationDetails: 'Destination details', previousImage: 'Previous image', nextImage: 'Next image' };
const formTranslations = {
  'zh-cn': { pickup: '接送地点', destination: '目的地', address: '输入地址，然后按回车键', searching: '搜索中…', useLocation: '使用我的位置', locating: '定位中…', popular: '或选择热门地点', guidance: '输入地址并按回车键、选择热门地点，或直接点击地图。', loadingMap: '正在加载龙目岛地图', findingRoute: '正在查找公路路线', estimate: '行程估价', calculating: '计算中…', rate: '每公里公路费用', from: '出发地', to: '目的地', notSelected: '尚未选择', customer: '预订人姓名', fullName: '完整姓名', whatsapp: 'WhatsApp 号码', date: '日期', time: '时间', passengers: '乘客人数', bookTravel: '通过 WhatsApp 预订接送', estimateNote: '此价格为估算，Wonderful Lombok 将通过 WhatsApp 确认行程详情。', bookNow: '立即预订', close: '关闭', booking: '预订申请', bookingIntro: '填写以下资料，然后通过 WhatsApp 继续确认。', travelDate: '旅行日期', guests: '人数', notes: '选填备注', notesPlaceholder: '特殊要求或接送地点', saveContinue: '保存并前往 WhatsApp', saving: '保存中…', destinationDetails: '目的地详情', previousImage: '上一张图片', nextImage: '下一张图片' },
  'zh-tw': { pickup: '接送地點', destination: '目的地', address: '輸入地址，然後按 Enter', searching: '搜尋中…', useLocation: '使用我的位置', locating: '定位中…', popular: '或選擇熱門地點', guidance: '輸入地址並按 Enter、選擇熱門地點，或直接點選地圖。', loadingMap: '正在載入龍目島地圖', findingRoute: '正在查找公路路線', estimate: '行程估價', calculating: '計算中…', rate: '每公里公路費用', from: '出發地', to: '目的地', notSelected: '尚未選擇', customer: '預訂人姓名', fullName: '完整姓名', whatsapp: 'WhatsApp 號碼', date: '日期', time: '時間', passengers: '乘客人數', bookTravel: '透過 WhatsApp 預訂接送', estimateNote: '此價格為估算，Wonderful Lombok 將透過 WhatsApp 確認行程詳情。', bookNow: '立即預訂', close: '關閉', booking: '預訂申請', bookingIntro: '填寫以下資料，再透過 WhatsApp 繼續確認。', travelDate: '旅行日期', guests: '人數', notes: '選填備註', notesPlaceholder: '特殊需求或接送地點', saveContinue: '儲存並前往 WhatsApp', saving: '儲存中…', destinationDetails: '目的地詳情', previousImage: '上一張圖片', nextImage: '下一張圖片' },
  nl: { pickup: 'Ophaallocatie', destination: 'Bestemming', address: 'Typ een adres en druk op Enter', searching: 'Zoeken…', useLocation: 'Gebruik mijn locatie', locating: 'Locatie zoeken…', popular: 'Of kies een populaire locatie', guidance: 'Typ een adres, kies een populaire locatie of klik op de kaart.', loadingMap: 'Kaart van Lombok laden', findingRoute: 'Route zoeken', estimate: 'Reisschatting', calculating: 'Berekenen…', rate: 'Tarief per wegkilometer', from: 'Van', to: 'Naar', notSelected: 'Niet gekozen', customer: 'Naam boeker', fullName: 'Volledige naam', whatsapp: 'WhatsApp-nummer', date: 'Datum', time: 'Tijd', passengers: 'Passagiers', bookTravel: 'Transfer boeken via WhatsApp', estimateNote: 'Dit is een schatting. Wonderful Lombok bevestigt de reisdetails via WhatsApp.', bookNow: 'Boek nu', close: 'Sluiten', booking: 'Boekingsaanvraag', bookingIntro: 'Vul je gegevens in en ga verder via WhatsApp.', travelDate: 'Reisdatum', guests: 'Aantal reizigers', notes: 'Optionele opmerkingen', notesPlaceholder: 'Speciale wensen of ophaallocatie', saveContinue: 'Opslaan en doorgaan naar WhatsApp', saving: 'Opslaan…', destinationDetails: 'Bestemmingsdetails', previousImage: 'Vorige foto', nextImage: 'Volgende foto' },
  fr: { pickup: 'Lieu de prise en charge', destination: 'Destination', address: 'Saisissez une adresse puis appuyez sur Entrée', searching: 'Recherche…', useLocation: 'Utiliser ma position', locating: 'Localisation…', popular: 'Ou choisissez un lieu populaire', guidance: 'Saisissez une adresse, choisissez un lieu populaire ou cliquez sur la carte.', loadingMap: 'Chargement de la carte de Lombok', findingRoute: 'Recherche de l’itinéraire', estimate: 'Estimation du trajet', calculating: 'Calcul…', rate: 'Tarif par kilomètre routier', from: 'Départ', to: 'Arrivée', notSelected: 'Non sélectionné', customer: 'Nom du client', fullName: 'Nom complet', whatsapp: 'Numéro WhatsApp', date: 'Date', time: 'Heure', passengers: 'Passagers', bookTravel: 'Réserver le transfert sur WhatsApp', estimateNote: 'Ceci est une estimation. Wonderful Lombok confirmera les détails sur WhatsApp.', bookNow: 'Réserver', close: 'Fermer', booking: 'Demande de réservation', bookingIntro: 'Renseignez vos coordonnées puis poursuivez la confirmation sur WhatsApp.', travelDate: 'Date du voyage', guests: 'Nombre de voyageurs', notes: 'Notes facultatives', notesPlaceholder: 'Demandes spéciales ou lieu de prise en charge', saveContinue: 'Enregistrer et continuer sur WhatsApp', saving: 'Enregistrement…', destinationDetails: 'Détails de la destination', previousImage: 'Image précédente', nextImage: 'Image suivante' },
  de: { pickup: 'Abholort', destination: 'Ziel', address: 'Adresse eingeben und Enter drücken', searching: 'Suchen…', useLocation: 'Meinen Standort verwenden', locating: 'Standort wird gesucht…', popular: 'Oder beliebten Ort wählen', guidance: 'Adresse eingeben, beliebten Ort wählen oder auf die Karte klicken.', loadingMap: 'Lombok-Karte wird geladen', findingRoute: 'Straßenroute wird gesucht', estimate: 'Reiseschätzung', calculating: 'Berechnung…', rate: 'Preis pro Straßenkilometer', from: 'Von', to: 'Nach', notSelected: 'Nicht gewählt', customer: 'Name des Buchenden', fullName: 'Vollständiger Name', whatsapp: 'WhatsApp-Nummer', date: 'Datum', time: 'Uhrzeit', passengers: 'Fahrgäste', bookTravel: 'Transfer über WhatsApp buchen', estimateNote: 'Dies ist eine Schätzung. Wonderful Lombok bestätigt die Reisedetails über WhatsApp.', bookNow: 'Jetzt buchen', close: 'Schließen', booking: 'Buchungsanfrage', bookingIntro: 'Daten eingeben und die Bestätigung über WhatsApp fortsetzen.', travelDate: 'Reisedatum', guests: 'Anzahl der Gäste', notes: 'Optionale Hinweise', notesPlaceholder: 'Sonderwünsche oder Abholort', saveContinue: 'Speichern und zu WhatsApp', saving: 'Speichern…', destinationDetails: 'Details zum Reiseziel', previousImage: 'Vorheriges Bild', nextImage: 'Nächstes Bild' },
  ms: { pickup: 'Lokasi jemput', destination: 'Destinasi', address: 'Taip alamat, kemudian tekan Enter', searching: 'Mencari…', useLocation: 'Gunakan lokasi saya', locating: 'Mencari lokasi…', popular: 'Atau pilih lokasi popular', guidance: 'Taip alamat, pilih lokasi popular atau klik pada peta.', loadingMap: 'Memuatkan peta Lombok', findingRoute: 'Mencari laluan jalan', estimate: 'Anggaran perjalanan', calculating: 'Mengira…', rate: 'Kadar setiap kilometer jalan', from: 'Dari', to: 'Ke', notSelected: 'Belum dipilih', customer: 'Nama penempah', fullName: 'Nama penuh', whatsapp: 'Nombor WhatsApp', date: 'Tarikh', time: 'Masa', passengers: 'Penumpang', bookTravel: 'Tempah Travel melalui WhatsApp', estimateNote: 'Ini ialah anggaran. Wonderful Lombok akan mengesahkan butiran melalui WhatsApp.', bookNow: 'Tempah Sekarang', close: 'Tutup', booking: 'Permintaan tempahan', bookingIntro: 'Isi butiran anda, kemudian teruskan pengesahan melalui WhatsApp.', travelDate: 'Tarikh perjalanan', guests: 'Bilangan tetamu', notes: 'Catatan pilihan', notesPlaceholder: 'Permintaan khas atau lokasi jemput', saveContinue: 'Simpan dan teruskan ke WhatsApp', saving: 'Menyimpan…', destinationDetails: 'Butiran destinasi', previousImage: 'Gambar sebelumnya', nextImage: 'Gambar seterusnya' }
};

export function getFormCopy(locale) {
  return locale === 'id' ? formId : { ...formEn, ...(formTranslations[locale] || {}) };
}
