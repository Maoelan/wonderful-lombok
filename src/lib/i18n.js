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
export const localeTags = { id: 'id-ID', en: 'en-US', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', nl: 'nl-NL', fr: 'fr-FR', de: 'de-DE', ms: 'ms-MY' };
export const localeTag = (locale) => localeTags[locale] || localeTags.en;
export const nominatimLanguage = (locale) => ({ ...localeTags, id: 'id', en: 'en', nl: 'nl', fr: 'fr', de: 'de', ms: 'ms' })[locale] || 'en';

export function isLocale(value) {
  return supportedLocales.includes(value);
}

export function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'paket';
}

export const destinationSlug = (item) => item?.slug || slugify(item?.name).replace(/^paket$/, 'destinasi');

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

Object.assign(catalogTranslations, {
  nl: {
    packages: [
      { category: 'Cultuur & stranden', duration: '1 dag', name: 'Zuid-Lombok & Sasakcultuur', route: 'Sade-dorp, Kuta Mandalika, Tanjung Aan, Merese-heuvel', detail: 'Een privé-dagtocht langs het dorpsleven van de Sasak en de stranden en heuvels van Centraal-Lombok. De volgorde wordt aangepast aan je ophaallocatie en de lokale omstandigheden.', unit: 'per voertuig' },
      { category: 'Zee & snorkelen', duration: '1 dag', name: 'Snorkeltocht langs de Gili-eilanden', route: 'Gili Trawangan, Gili Meno, Gili Air', detail: 'Een privétocht naar de drie Gili-eilanden met boot en snorkeluitrusting. Zwemtijd en eilandstops worden voor vertrek afgestemd.', unit: 'per pakket' },
      { category: 'Reis voor stellen', duration: '2 dagen 1 nacht', name: 'Romantisch Lombok 2D1N', route: 'Senggigi, Malimbu, de Gili-eilanden, diner aan het strand', detail: 'Een tweedaags pakket voor stellen met een kustrit, één overnachting en rustig de tijd voor zonsondergang.', unit: 'per stel' }
    ],
    destinations: [
      { name: 'Kuta Mandalika', note: 'Uitvalsbasis voor de zuidkust', detail: 'Kuta Mandalika is een praktische uitvalsbasis voor Tanjung Aan, Seger Beach, Merese Hill en traditionele dorpen in Centraal-Lombok.' },
      { name: 'Tanjung Aan', note: 'Een brede baai met licht zand', detail: 'Een brede kustlijn met turquoise water, vaak gecombineerd met Merese Hill en Kuta Mandalika.' },
      { name: 'De drie Gili-eilanden', note: 'Snorkelen en eilandhoppen', detail: 'Gili Trawangan, Gili Meno en Gili Air hebben elk hun eigen sfeer. De bootroute wordt aangepast aan de zee en de gewenste verblijfsduur.' },
      { name: 'Sembalun', note: 'Valleien en uitzicht op Rinjani', detail: 'Een hooglandgebied in Oost-Lombok met schilderachtige autoritten, uitzichtpunten en lokale boerderijen.' },
      { name: 'Senggigi', note: 'Westkust voor rustige avonden', detail: 'Een prettige uitvalsbasis voor de kustrit naar Malimbu, de haven naar de Gili-eilanden of een ontspannen zonsondergang.' }
    ],
    rentals: [
      { name: 'Privéauto met chauffeur', detail: 'Auto met airconditioning voor 1 tot 5 passagiers. Gebruiksduur en werkgebied worden vooraf bevestigd.', price: 'Vanaf IDR 450.000 per 10 uur' },
      { name: 'Scooterverhuur', detail: 'Voor zelfstandig reizen. Beschikbaarheid, helm, identiteitsvoorwaarden, bezorggebied en huurduur worden via WhatsApp bevestigd.', price: 'Vanaf IDR 75.000 per 24 uur' }
    ],
    faqs: [
      { question: 'Kan ik de route van een pakket aanpassen?', answer: 'Ja. Deel je bestemmingen, beschikbare tijd en accommodatie. Het team stelt de route samen voordat de definitieve prijs wordt bevestigd.' },
      { question: 'Zijn alle reizen privé?', answer: 'De pakketten gebruiken een privévoertuig voor jouw gezelschap. Een gedeelde dienst wordt bij de bevestiging duidelijk vermeld.' },
      { question: 'Kan ik bij de luchthaven of haven worden opgehaald?', answer: 'Ja. Lombok International Airport, Lembar, Bangsal en hotels kunnen als ophaalpunt worden gebruikt.' },
      { question: 'Is de schatting voor de transferservice definitief?', answer: 'Nog niet. De calculator gebruikt de rijroute en IDR 10.000 per kilometer. Het team controleert locatie, tijd en voertuig voor de definitieve prijs.' },
      { question: 'Hoe boek ik?', answer: 'Kies een dienst, vul de reisgegevens in en stuur de samenvatting via WhatsApp. De boeking staat vast na bevestiging van planning, prijs en aanbetaling.' },
      { question: 'Wat gebeurt er bij slecht weer?', answer: 'Activiteiten op zee en in de bergen kunnen afhankelijk van de omstandigheden en het beleid van de aanbieder worden verplaatst, gewijzigd of geannuleerd.' },
      { question: 'Wat moet ik meenemen?', answer: 'Neem identificatie, comfortabele schoenen, zonbescherming, persoonlijke medicatie, droge kleding voor wateractiviteiten en wat contant geld mee.' }
    ]
  },
  fr: {
    packages: [
      { category: 'Culture & plages', duration: '1 jour', name: 'Sud de Lombok & culture sasak', route: 'Village de Sade, Kuta Mandalika, Tanjung Aan, colline de Merese', detail: 'Une excursion privée d’une journée entre vie villageoise sasak, plages et collines du centre de Lombok. L’ordre des visites s’adapte au lieu de prise en charge et aux conditions locales.', unit: 'par véhicule' },
      { category: 'Mer & plongée libre', duration: '1 jour', name: 'Escapade snorkeling aux îles Gili', route: 'Gili Trawangan, Gili Meno, Gili Air', detail: 'Une sortie privée vers les trois îles Gili avec bateau et équipement de snorkeling. Les temps de baignade et les escales sont convenus avant le départ.', unit: 'par forfait' },
      { category: 'Voyage en couple', duration: '2 jours 1 nuit', name: 'Lombok romantique 2J1N', route: 'Senggigi, Malimbu, îles Gili, dîner en bord de mer', detail: 'Un forfait de deux jours pour les couples avec route côtière, une nuit d’hôtel et du temps pour profiter du coucher de soleil.', unit: 'par couple' }
    ],
    destinations: [
      { name: 'Kuta Mandalika', note: 'Point de départ pour la côte sud', detail: 'Kuta Mandalika permet de rejoindre facilement Tanjung Aan, la plage de Seger, la colline de Merese et les villages traditionnels du centre de Lombok.' },
      { name: 'Tanjung Aan', note: 'Une grande baie au sable clair', detail: 'Un vaste littoral aux eaux turquoise, généralement associé à la colline de Merese et à Kuta Mandalika.' },
      { name: 'Les trois îles Gili', note: 'Snorkeling et excursion entre les îles', detail: 'Gili Trawangan, Gili Meno et Gili Air ont chacune leur ambiance. Le trajet en bateau s’adapte à la mer et au temps souhaité sur chaque île.' },
      { name: 'Sembalun', note: 'Vallées et vues sur le Rinjani', detail: 'Une région d’altitude à l’est de Lombok avec routes panoramiques, belvédères et fermes locales.' },
      { name: 'Senggigi', note: 'La côte ouest pour une soirée tranquille', detail: 'Un point de départ pratique pour la route de Malimbu, le port des Gili ou un coucher de soleil détendu.' }
    ],
    rentals: [
      { name: 'Voiture privée avec chauffeur', detail: 'Voiture climatisée pour 1 à 5 passagers. La durée et la zone d’utilisation sont confirmées avant le départ.', price: 'À partir de 450 000 IDR pour 10 heures' },
      { name: 'Location de scooter', detail: 'Pour voyager en autonomie. Disponibilité, casque, pièce d’identité, livraison et durée sont confirmés sur WhatsApp.', price: 'À partir de 75 000 IDR pour 24 heures' }
    ],
    faqs: [
      { question: 'Puis-je modifier l’itinéraire d’un forfait ?', answer: 'Oui. Indiquez les destinations, le temps disponible et votre hébergement. L’équipe organise le parcours avant de confirmer le prix final.' },
      { question: 'Tous les voyages sont-ils privés ?', answer: 'Les forfaits utilisent un véhicule privé pour votre groupe. Tout service partagé sera précisé lors de la confirmation.' },
      { question: 'Puis-je être pris en charge à l’aéroport ou au port ?', answer: 'Oui. L’aéroport international de Lombok, Lembar, Bangsal et les hôtels peuvent servir de point de prise en charge.' },
      { question: 'L’estimation du transfert est-elle définitive ?', answer: 'Pas encore. Le calcul utilise l’itinéraire routier et 10 000 IDR par kilomètre. L’équipe vérifie les lieux, l’horaire et le véhicule avant de confirmer.' },
      { question: 'Comment réserver ?', answer: 'Choisissez un service, complétez les informations puis envoyez le récapitulatif sur WhatsApp. La réservation est confirmée après validation du programme, du prix et de l’acompte.' },
      { question: 'Que se passe-t-il si la météo est mauvaise ?', answer: 'Les activités en mer et en montagne peuvent être reportées, modifiées ou annulées selon les conditions et la politique du prestataire.' },
      { question: 'Que dois-je emporter ?', answer: 'Emportez une pièce d’identité, des chaussures confortables, une protection solaire, vos médicaments, des vêtements de rechange et un peu d’argent liquide.' }
    ]
  },
  de: {
    packages: [
      { category: 'Kultur & Strände', duration: '1 Tag', name: 'Süd-Lombok & Sasak-Kultur', route: 'Sade-Dorf, Kuta Mandalika, Tanjung Aan, Merese-Hügel', detail: 'Eine private Tagestour durch das Dorfleben der Sasak sowie zu Stränden und Hügeln in Zentral-Lombok. Die Reihenfolge richtet sich nach Abholort und örtlichen Bedingungen.', unit: 'pro Fahrzeug' },
      { category: 'Meer & Schnorcheln', duration: '1 Tag', name: 'Schnorchelausflug zu den Gili-Inseln', route: 'Gili Trawangan, Gili Meno, Gili Air', detail: 'Ein privater Ausflug zu den drei Gili-Inseln mit Boot und Schnorchelausrüstung. Badezeit und Inselstopps werden vor der Abfahrt abgestimmt.', unit: 'pro Paket' },
      { category: 'Reise für Paare', duration: '2 Tage 1 Nacht', name: 'Romantisches Lombok 2T1N', route: 'Senggigi, Malimbu, Gili-Inseln, Abendessen am Strand', detail: 'Ein zweitägiges Paket für Paare mit Küstenfahrt, einer Hotelnacht und ausreichend Zeit für den Sonnenuntergang.', unit: 'pro Paar' }
    ],
    destinations: [
      { name: 'Kuta Mandalika', note: 'Ausgangspunkt für die Südküste', detail: 'Von Kuta Mandalika erreichen Sie Tanjung Aan, Seger Beach, Merese Hill und traditionelle Dörfer in Zentral-Lombok.' },
      { name: 'Tanjung Aan', note: 'Eine weite Bucht mit hellem Sand', detail: 'Eine breite Küste mit türkisfarbenem Wasser, meist verbunden mit Merese Hill und Kuta Mandalika.' },
      { name: 'Die drei Gili-Inseln', note: 'Schnorcheln und Inselhüpfen', detail: 'Gili Trawangan, Gili Meno und Gili Air haben jeweils eine eigene Atmosphäre. Die Bootsroute richtet sich nach Seegang und gewünschter Aufenthaltszeit.' },
      { name: 'Sembalun', note: 'Täler und Aussicht auf den Rinjani', detail: 'Ein Hochlandgebiet in Ost-Lombok mit Panoramastraßen, Aussichtspunkten und lokalen Bauernhöfen.' },
      { name: 'Senggigi', note: 'Westküste für ruhige Abende', detail: 'Ein guter Ausgangspunkt für Küstenfahrten nach Malimbu, den Hafen zu den Gilis oder einen entspannten Sonnenuntergang.' }
    ],
    rentals: [
      { name: 'Privatwagen mit Fahrer', detail: 'Klimatisiertes Fahrzeug für 1 bis 5 Personen. Nutzungsdauer und Gebiet werden vor der Abfahrt bestätigt.', price: 'Ab IDR 450.000 für 10 Stunden' },
      { name: 'Rollervermietung', detail: 'Für unabhängiges Reisen. Verfügbarkeit, Helm, Ausweis, Liefergebiet und Mietdauer werden über WhatsApp bestätigt.', price: 'Ab IDR 75.000 für 24 Stunden' }
    ],
    faqs: [
      { question: 'Kann ich den Reiseablauf eines Pakets ändern?', answer: 'Ja. Teilen Sie Ziele, verfügbare Zeit und Unterkunft mit. Das Team plant die Route, bevor der Endpreis bestätigt wird.' },
      { question: 'Sind alle Reisen privat?', answer: 'Die Pakete nutzen ein Privatfahrzeug für Ihre Gruppe. Ein gemeinsamer Dienst wird bei der Bestätigung ausdrücklich genannt.' },
      { question: 'Kann ich am Flughafen oder Hafen abgeholt werden?', answer: 'Ja. Lombok International Airport, Lembar, Bangsal und Hotels können als Abholort dienen.' },
      { question: 'Ist die Transferschätzung endgültig?', answer: 'Noch nicht. Der Rechner verwendet die Fahrstrecke und IDR 10.000 pro Kilometer. Das Team prüft Ort, Zeit und Fahrzeug vor der Bestätigung.' },
      { question: 'Wie buche ich?', answer: 'Wählen Sie einen Service, ergänzen Sie die Reisedaten und senden Sie die Zusammenfassung über WhatsApp. Die Buchung gilt nach Bestätigung von Termin, Preis und Anzahlung.' },
      { question: 'Was passiert bei schlechtem Wetter?', answer: 'Aktivitäten auf dem Meer und in den Bergen können je nach Bedingungen und Richtlinien des Anbieters verschoben, geändert oder abgesagt werden.' },
      { question: 'Was sollte ich mitbringen?', answer: 'Bringen Sie Ausweis, bequeme Schuhe, Sonnenschutz, persönliche Medikamente, Wechselkleidung für Wasseraktivitäten und etwas Bargeld mit.' }
    ]
  },
  ms: {
    packages: [
      { category: 'Budaya & pantai', duration: '1 hari', name: 'Lombok Selatan & budaya Sasak', route: 'Desa Sade, Kuta Mandalika, Tanjung Aan, Bukit Merese', detail: 'Lawatan peribadi sehari yang menggabungkan kehidupan desa Sasak dengan pantai dan bukit di Lombok Tengah. Susunan lawatan disesuaikan dengan lokasi jemput dan keadaan setempat.', unit: 'setiap kenderaan' },
      { category: 'Laut & snorkeling', duration: '1 hari', name: 'Kembara snorkeling Kepulauan Gili', route: 'Gili Trawangan, Gili Meno, Gili Air', detail: 'Perjalanan peribadi ke tiga Gili dengan bot dan peralatan snorkeling. Masa berenang dan persinggahan pulau disusun sebelum bertolak.', unit: 'setiap pakej' },
      { category: 'Perjalanan pasangan', duration: '2 hari 1 malam', name: 'Lombok Romantik 2H1M', route: 'Senggigi, Malimbu, Kepulauan Gili, makan malam tepi pantai', detail: 'Pakej dua hari untuk pasangan dengan perjalanan pesisir, satu malam penginapan dan masa santai menikmati matahari terbenam.', unit: 'setiap pasangan' }
    ],
    destinations: [
      { name: 'Kuta Mandalika', note: 'Pangkalan untuk pesisir selatan', detail: 'Kuta Mandalika ialah pangkalan praktikal untuk ke Tanjung Aan, Pantai Seger, Bukit Merese dan kampung tradisional di Lombok Tengah.' },
      { name: 'Tanjung Aan', note: 'Teluk luas dengan pasir cerah', detail: 'Pesisir luas dengan air biru kehijauan, biasanya digabungkan dengan Bukit Merese dan Kuta Mandalika.' },
      { name: 'Tiga Gili', note: 'Snorkeling dan jelajah pulau', detail: 'Gili Trawangan, Gili Meno dan Gili Air mempunyai suasana tersendiri. Laluan bot disesuaikan dengan keadaan laut dan masa di setiap pulau.' },
      { name: 'Sembalun', note: 'Lembah dan panorama Rinjani', detail: 'Kawasan tanah tinggi Lombok Timur dengan perjalanan berpemandangan indah, lokasi tinjau dan kebun tempatan.' },
      { name: 'Senggigi', note: 'Pesisir barat untuk petang santai', detail: 'Pangkalan yang mudah untuk perjalanan ke Malimbu, pelabuhan menuju Gili atau menikmati matahari terbenam.' }
    ],
    rentals: [
      { name: 'Kereta persendirian dengan pemandu', detail: 'Kereta berhawa dingin untuk 1 hingga 5 penumpang. Tempoh dan kawasan penggunaan disahkan sebelum bertolak.', price: 'Bermula IDR 450,000 untuk 10 jam' },
      { name: 'Sewa motosikal', detail: 'Untuk perjalanan sendiri. Unit, topi keledar, syarat pengenalan, kawasan penghantaran dan tempoh sewa disahkan melalui WhatsApp.', price: 'Bermula IDR 75,000 untuk 24 jam' }
    ],
    faqs: [
      { question: 'Bolehkah jadual pakej diubah?', answer: 'Boleh. Beritahu destinasi, masa yang tersedia dan tempat penginapan. Pasukan akan menyusun laluan sebelum harga akhir disahkan.' },
      { question: 'Adakah semua perjalanan bersifat peribadi?', answer: 'Pakej menggunakan kenderaan persendirian untuk kumpulan anda. Perkhidmatan berkongsi akan diterangkan semasa pengesahan.' },
      { question: 'Bolehkah saya dijemput di lapangan terbang atau pelabuhan?', answer: 'Boleh. Lapangan Terbang Antarabangsa Lombok, Lembar, Bangsal dan hotel boleh digunakan sebagai lokasi jemput.' },
      { question: 'Adakah anggaran Pakej Travel harga muktamad?', answer: 'Belum. Kalkulator menggunakan laluan jalan raya dan kadar IDR 10,000 setiap kilometer. Pasukan akan menyemak lokasi, masa dan kenderaan sebelum mengesahkan harga.' },
      { question: 'Bagaimana cara membuat tempahan?', answer: 'Pilih perkhidmatan, lengkapkan butiran perjalanan dan hantar ringkasan melalui WhatsApp. Tempahan disahkan selepas jadual, harga dan bayaran pendahuluan dipersetujui.' },
      { question: 'Bagaimana jika cuaca tidak sesuai?', answer: 'Aktiviti laut dan gunung mungkin dijadualkan semula, diubah atau dibatalkan mengikut keadaan dan polisi penyedia.' },
      { question: 'Apa yang perlu dibawa?', answer: 'Bawa dokumen pengenalan, kasut selesa, pelindung matahari, ubat peribadi, pakaian ganti untuk aktiviti air dan wang tunai secukupnya.' }
    ]
  }
});

Object.assign(packageDetailTranslations, {
  nl: [
    { itinerary: [{ day: 'Ochtend', title: 'Ophalen en Sade-dorp', items: ['Ophalen bij hotel of Lombok International Airport', 'Wandeling door Sade en bezoek aan traditionele Sasak-huizen', 'Verder naar Mandalika'] }, { day: 'Middag', title: 'Zuidelijke stranden', items: ['Lunch in Kuta Mandalika', 'Vrije tijd op Tanjung Aan Beach', 'Stop bij Seger Beach als de tijd het toelaat'] }, { day: 'Avond', title: 'Merese-heuvel en terugreis', items: ['Korte wandeling naar het uitzichtpunt op Merese Hill', 'Aan het einde van de middag terug naar het hotel'] }], includes: ['Privéauto met airconditioning en chauffeur', 'Brandstof en parkeren', 'Mineraalwater', 'Ophalen en afzetten binnen het afgesproken gebied'], excludes: ['Eten en drinken', 'Entreegelden of donaties', 'Persoonlijke uitgaven en optionele activiteiten'], priceTiers: [{ guests: '1-5 personen', price: 'Rp1.250.000', note: 'totaal per voertuig' }, { guests: '6-10 personen', price: 'Neem contact op', note: 'groter voertuig' }] },
    { itinerary: [{ day: 'Ochtend', title: 'Naar de haven', items: ['Ophalen bij het hotel', 'Transfer naar de haven', 'Briefing en voorbereiding van de uitrusting'] }, { day: 'Middag', title: 'Snorkelen en eilandhoppen', items: ['Snorkelen afhankelijk van de zeecondities', 'Stops op Gili Meno en Gili Air', 'Vrije tijd voor de lunch'] }, { day: 'Avond', title: 'Gili Trawangan en terugreis', items: ['Vrije tijd op Gili Trawangan', 'Met de boot terug naar Lombok', 'Transfer naar het hotel'] }], includes: ['Privétransfer over land', 'Privéboot met bemanning', 'Masker, snorkel en zwemvest', 'Mineraalwater'], excludes: ['Lunch', 'Lokale heffingen', 'Onderwaterfoto’s', 'Persoonlijke uitgaven'], priceTiers: [{ guests: '1-2 personen', price: 'Rp1.450.000', note: 'totaal pakket' }, { guests: '3-5 personen', price: 'Rp1.950.000', note: 'totaal pakket' }] },
    { itinerary: [{ day: 'Dag 1', title: 'Westkust en zonsondergang', items: ['Privé ophalen', 'Stop bij een uitzichtpunt in Malimbu', 'Inchecken bij een hotel in Senggigi', 'Diner voor twee aan het strand'] }, { day: 'Dag 2', title: 'Gili-optie of rustige ochtend', items: ['Ontbijt in het hotel', 'Keuze uit een korte Gili-tocht of vrije tijd', 'Uitchecken en transfer'] }], includes: ['Privéauto en chauffeur', 'Eén hotelnacht voor twee personen', 'Hotelontbijt', 'Diner voor twee'], excludes: ['Vluchten', 'Optionele zeeactiviteiten', 'Niet-vermelde maaltijden', 'Persoonlijke uitgaven'], priceTiers: [{ guests: '1 stel', price: 'Rp3.900.000', note: 'pakketprijs vanaf' }] }
  ],
  fr: [
    { itinerary: [{ day: 'Matin', title: 'Prise en charge et village de Sade', items: ['Prise en charge à l’hôtel ou à l’aéroport international de Lombok', 'Visite du village de Sade et de ses maisons sasak traditionnelles', 'Route vers Mandalika'] }, { day: 'Après-midi', title: 'Plages du sud', items: ['Déjeuner à Kuta Mandalika', 'Temps libre à la plage de Tanjung Aan', 'Arrêt à la plage de Seger si le temps le permet'] }, { day: 'Soir', title: 'Colline de Merese et retour', items: ['Courte marche jusqu’au belvédère de Merese', 'Retour à l’hôtel en fin d’après-midi'] }], includes: ['Voiture privée climatisée avec chauffeur', 'Carburant et stationnement', 'Eau minérale', 'Prise en charge et retour dans la zone convenue'], excludes: ['Repas et boissons', 'Entrées ou dons aux sites', 'Dépenses personnelles et activités facultatives'], priceTiers: [{ guests: '1 à 5 personnes', price: 'Rp1.250.000', note: 'total par véhicule' }, { guests: '6 à 10 personnes', price: 'Contactez-nous', note: 'véhicule plus grand' }] },
    { itinerary: [{ day: 'Matin', title: 'Trajet vers le port', items: ['Prise en charge à l’hôtel', 'Transfert vers le port', 'Briefing et préparation du matériel'] }, { day: 'Après-midi', title: 'Snorkeling et découverte des îles', items: ['Snorkeling selon les conditions de mer', 'Escales à Gili Meno et Gili Air', 'Temps libre pour déjeuner'] }, { day: 'Soir', title: 'Gili Trawangan et retour', items: ['Temps libre à Gili Trawangan', 'Retour en bateau à Lombok', 'Transfert vers l’hôtel'] }], includes: ['Transfert terrestre privé', 'Bateau privé avec équipage', 'Masque, tuba et gilet de sauvetage', 'Eau minérale'], excludes: ['Déjeuner', 'Taxes locales', 'Photos sous-marines', 'Dépenses personnelles'], priceTiers: [{ guests: '1 à 2 personnes', price: 'Rp1.450.000', note: 'total du forfait' }, { guests: '3 à 5 personnes', price: 'Rp1.950.000', note: 'total du forfait' }] },
    { itinerary: [{ day: 'Jour 1', title: 'Côte ouest et coucher de soleil', items: ['Prise en charge privée', 'Arrêt à un belvédère de Malimbu', 'Installation à l’hôtel dans la région de Senggigi', 'Dîner pour deux en bord de mer'] }, { day: 'Jour 2', title: 'Option Gili ou matinée tranquille', items: ['Petit-déjeuner à l’hôtel', 'Courte sortie aux Gili ou temps libre', 'Départ de l’hôtel et transfert'] }], includes: ['Voiture privée avec chauffeur', 'Une nuit d’hôtel pour deux', 'Petit-déjeuner à l’hôtel', 'Dîner pour deux'], excludes: ['Vols', 'Activités nautiques facultatives', 'Repas non mentionnés', 'Dépenses personnelles'], priceTiers: [{ guests: '1 couple', price: 'Rp3.900.000', note: 'forfait à partir de' }] }
  ],
  de: [
    { itinerary: [{ day: 'Morgen', title: 'Abholung und Sade-Dorf', items: ['Abholung am Hotel oder Lombok International Airport', 'Rundgang durch Sade und traditionelle Sasak-Häuser', 'Weiterfahrt nach Mandalika'] }, { day: 'Nachmittag', title: 'Strände im Süden', items: ['Mittagessen in Kuta Mandalika', 'Freizeit am Tanjung Aan Beach', 'Stopp am Seger Beach, wenn es die Zeit erlaubt'] }, { day: 'Abend', title: 'Merese-Hügel und Rückfahrt', items: ['Kurzer Spaziergang zum Aussichtspunkt am Merese Hill', 'Am späten Nachmittag zurück zum Hotel'] }], includes: ['Privatwagen mit Klimaanlage und Fahrer', 'Kraftstoff und Parkgebühren', 'Mineralwasser', 'Abholung und Rückfahrt im vereinbarten Gebiet'], excludes: ['Essen und Getränke', 'Eintritt oder Spenden an den Zielen', 'Persönliche Ausgaben und optionale Aktivitäten'], priceTiers: [{ guests: '1-5 Personen', price: 'Rp1.250.000', note: 'Gesamtpreis pro Fahrzeug' }, { guests: '6-10 Personen', price: 'Kontaktieren Sie uns', note: 'größeres Fahrzeug' }] },
    { itinerary: [{ day: 'Morgen', title: 'Fahrt zum Hafen', items: ['Abholung am Hotel', 'Transfer zum Hafen', 'Einweisung und Vorbereitung der Ausrüstung'] }, { day: 'Nachmittag', title: 'Schnorcheln und Inselhüpfen', items: ['Schnorcheln je nach Seegang', 'Stopps auf Gili Meno und Gili Air', 'Freie Zeit zum Mittagessen'] }, { day: 'Abend', title: 'Gili Trawangan und Rückfahrt', items: ['Freizeit auf Gili Trawangan', 'Bootsfahrt zurück nach Lombok', 'Transfer zum Hotel'] }], includes: ['Privater Landtransfer', 'Privatboot mit Besatzung', 'Maske, Schnorchel und Schwimmweste', 'Mineralwasser'], excludes: ['Mittagessen', 'Lokale Gebühren', 'Unterwasseraufnahmen', 'Persönliche Ausgaben'], priceTiers: [{ guests: '1-2 Personen', price: 'Rp1.450.000', note: 'Gesamtpreis des Pakets' }, { guests: '3-5 Personen', price: 'Rp1.950.000', note: 'Gesamtpreis des Pakets' }] },
    { itinerary: [{ day: 'Tag 1', title: 'Westküste und Sonnenuntergang', items: ['Private Abholung', 'Stopp an einem Aussichtspunkt in Malimbu', 'Check-in in einem Hotel bei Senggigi', 'Abendessen für zwei am Strand'] }, { day: 'Tag 2', title: 'Gili-Ausflug oder ruhiger Morgen', items: ['Frühstück im Hotel', 'Kurzer Gili-Ausflug oder freie Zeit', 'Check-out und Transfer'] }], includes: ['Privatwagen und Fahrer', 'Eine Hotelnacht für zwei Personen', 'Hotelfrühstück', 'Abendessen für zwei'], excludes: ['Flüge', 'Optionale Meeresaktivitäten', 'Nicht genannte Mahlzeiten', 'Persönliche Ausgaben'], priceTiers: [{ guests: '1 Paar', price: 'Rp3.900.000', note: 'Paketpreis ab' }] }
  ],
  ms: [
    { itinerary: [{ day: 'Pagi', title: 'Jemput dan Desa Sade', items: ['Jemput dari hotel atau Lapangan Terbang Antarabangsa Lombok', 'Berjalan di Desa Sade dan melihat rumah tradisional Sasak', 'Teruskan perjalanan ke Mandalika'] }, { day: 'Petang', title: 'Pantai selatan', items: ['Makan tengah hari di Kuta Mandalika', 'Masa santai di Pantai Tanjung Aan', 'Singgah di Pantai Seger jika masa mengizinkan'] }, { day: 'Senja', title: 'Bukit Merese dan pulang', items: ['Berjalan singkat ke lokasi tinjau Bukit Merese', 'Pulang ke hotel pada lewat petang'] }], includes: ['Kereta persendirian berhawa dingin dan pemandu', 'Bahan api dan parkir', 'Air mineral', 'Jemput dan hantar dalam kawasan yang dipersetujui'], excludes: ['Makanan dan minuman', 'Tiket masuk atau sumbangan destinasi', 'Perbelanjaan peribadi dan aktiviti pilihan'], priceTiers: [{ guests: '1-5 orang', price: 'Rp1.250.000', note: 'jumlah setiap kenderaan' }, { guests: '6-10 orang', price: 'Hubungi kami', note: 'kenderaan lebih besar' }] },
    { itinerary: [{ day: 'Pagi', title: 'Menuju ke pelabuhan', items: ['Jemput dari hotel', 'Perjalanan ke pelabuhan', 'Taklimat dan penyediaan peralatan'] }, { day: 'Petang', title: 'Snorkeling dan jelajah pulau', items: ['Snorkeling mengikut keadaan laut', 'Singgah di Gili Meno dan Gili Air', 'Masa bebas untuk makan tengah hari'] }, { day: 'Senja', title: 'Gili Trawangan dan pulang', items: ['Masa santai di Gili Trawangan', 'Bot kembali ke Lombok', 'Hantar ke hotel'] }], includes: ['Pengangkutan darat persendirian', 'Bot persendirian dan kru', 'Topeng, snorkel dan jaket keselamatan', 'Air mineral'], excludes: ['Makan tengah hari', 'Bayaran tempatan', 'Dokumentasi bawah air', 'Perbelanjaan peribadi'], priceTiers: [{ guests: '1-2 orang', price: 'Rp1.450.000', note: 'jumlah pakej' }, { guests: '3-5 orang', price: 'Rp1.950.000', note: 'jumlah pakej' }] },
    { itinerary: [{ day: 'Hari 1', title: 'Pesisir barat dan matahari terbenam', items: ['Jemput secara peribadi', 'Singgah di lokasi tinjau Malimbu', 'Daftar masuk hotel di kawasan Senggigi', 'Makan malam untuk dua orang di tepi pantai'] }, { day: 'Hari 2', title: 'Pilihan Gili atau pagi santai', items: ['Sarapan di hotel', 'Pilih perjalanan singkat ke Gili atau masa bebas', 'Daftar keluar dan hantar'] }], includes: ['Kereta persendirian dan pemandu', 'Satu malam hotel untuk dua orang', 'Sarapan hotel', 'Makan malam untuk dua orang'], excludes: ['Penerbangan', 'Aktiviti laut pilihan', 'Makanan yang tidak disenaraikan', 'Perbelanjaan peribadi'], priceTiers: [{ guests: '1 pasangan', price: 'Rp3.900.000', note: 'harga pakej bermula' }] }
  ]
});

export function localizeCatalog(catalog, locale) {
  const translation = catalogTranslations[locale];
  const settings = { ...catalog.settings };
  for (const field of ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription']) settings[field] = localizedSettings[locale]?.[field] || localized(settings, field, locale);
  const localizedCatalog = {
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
    faqs: catalog.faqs.map((item, index) => ({ ...item, question: localized(item, 'question', locale), answer: localized(item, 'answer', locale), ...(translation?.faqs[index] || {}) }))
  };
  if (catalog.rentals) {
    localizedCatalog.rentals = catalog.rentals.map((item, index) => ({ ...item, name: localized(item, 'name', locale), detail: localized(item, 'detail', locale), price: localized(item, 'price', locale), ...(translation?.rentals[index] || {}) }));
  }
  return localizedCatalog;
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

const mapCopy = {
  id: {
    mapPoint: 'Titik peta {lat}, {lng}', mapLoadError: 'Peta belum dapat dimuat. Periksa koneksi lalu coba lagi.',
    selected: '{field} dipilih: {place}', chooseOnMap: 'Ketik alamat lalu tekan Enter, atau klik peta untuk memilih {field}.', minimumCharacters: 'Ketik minimal 3 karakter untuk mencari nama tempat.',
    searchFailed: 'Pencarian tempat gagal.', noPlaces: 'Tempat tidak ditemukan di Pulau Lombok. Coba nama desa, hotel, atau objek wisata.', placesFound: '{count} tempat ditemukan di Lombok. Pilih hasil yang paling sesuai.',
    gpsUnsupported: 'Perangkat ini tidak mendukung GPS.', gpsSearching: 'Mencari sinyal GPS terbaik… tetap di halaman ini hingga akurasi stabil.', gpsUnavailable: 'Lokasi tidak dapat dibaca. Izinkan akses lokasi atau pilih titik pada peta.',
    gpsOutside: 'GPS menunjukkan lokasi di luar Pulau Lombok. Gunakan pencarian atau pilih titik pada peta.', gpsInsufficient: 'Akurasi GPS baru ±{accuracy} m, belum cukup aman untuk estimasi harga. Pindah ke area terbuka lalu coba lagi, atau ketuk titik yang tepat pada peta.',
    currentLocation: 'Lokasi saya saat ini (akurasi ±{accuracy} m)', gpsLockedHigh: 'Lokasi GPS terkunci dengan akurasi tinggi ±{accuracy} m.', gpsLocked: 'Lokasi GPS terkunci dengan akurasi ±{accuracy} m. Pastikan titik pada peta sudah sesuai sebelum memesan.',
    gpsLocking: 'Mengunci GPS… akurasi terbaik ±{accuracy} m. Menunggu posisi stabil.', gpsDenied: 'Akses lokasi ditolak. Izinkan lokasi pada pengaturan browser atau pilih titik pada peta.', gpsSignalUnavailable: 'Sinyal GPS belum tersedia. Bergerak ke area terbuka atau pilih titik pada peta.',
    pickupMarker: 'Jemput', destinationMarker: 'Tujuan', routeUnavailable: 'Layanan rute belum dapat diakses.', routeSnapNotice: 'Rute memakai jalan terdekat sekitar {distance} m dari titik pilihan. Periksa kembali titik jemput sebelum memesan.', roadRouteUnavailable: 'Rute jalan belum dapat dihitung.',
    chooseDifferent: 'Pilih lokasi jemput dan tujuan yang berbeda.', waitForRoute: 'Tunggu sampai rute jalan dan biayanya berhasil dihitung.', completeBooking: 'Lengkapi nama, WhatsApp, tanggal, dan waktu penjemputan.', bookingSaveFailed: 'Pemesanan belum dapat disimpan.', bookingOpened: 'Ringkasan Paket Travel sudah dibuka di WhatsApp.',
    searchResultsPickup: 'Hasil pencarian lokasi jemput', searchResultsDestination: 'Hasil pencarian tujuan', swapLocations: 'Tukar lokasi jemput dan tujuan', interactiveMap: 'Peta interaktif rute penjemputan', zoomIn: 'Perbesar peta', zoomOut: 'Perkecil peta',
    bookingService: 'Paket Travel', whatsappGreeting: 'Halo Wonderful Lombok, saya ingin memesan Paket Travel.', codeLabel: 'Kode', nameLabel: 'Nama', accuracyLabel: 'Akurasi lokasi jemput', distanceLabel: 'Estimasi jarak', costLabel: 'Estimasi biaya', peopleValue: '{count} orang',
    tooManySearches: 'Terlalu banyak pencarian. Coba lagi nanti.', placeQueryLength: 'Nama tempat harus berisi 3–120 karakter.', tooManyRoutes: 'Terlalu banyak permintaan rute. Coba lagi nanti.', routeOutsideLombok: 'Titik rute harus berada di Pulau Lombok.', routeNotFound: 'Rute jalan tidak ditemukan. Periksa kembali titik pada peta.', routeServiceDown: 'Layanan rute sedang tidak dapat dijangkau. Coba lagi sebentar.'
  },
  en: {
    mapPoint: 'Map point {lat}, {lng}', mapLoadError: 'The map could not be loaded. Check your connection and try again.',
    selected: '{field} selected: {place}', chooseOnMap: 'Type an address and press Enter, or click the map to choose the {field}.', minimumCharacters: 'Enter at least 3 characters to search for a place.',
    searchFailed: 'Place search failed.', noPlaces: 'No place was found in Lombok. Try a village, hotel, or attraction name.', placesFound: '{count} places found in Lombok. Choose the best match.',
    gpsUnsupported: 'This device does not support GPS.', gpsSearching: 'Finding the best GPS signal… stay on this page until the accuracy is stable.', gpsUnavailable: 'Your location could not be read. Allow location access or choose a point on the map.',
    gpsOutside: 'GPS indicates a location outside Lombok. Use search or choose a point on the map.', gpsInsufficient: 'GPS accuracy is currently ±{accuracy} m, which is not precise enough for a safe price estimate. Move to an open area and try again, or tap the exact point on the map.',
    currentLocation: 'My current location (accuracy ±{accuracy} m)', gpsLockedHigh: 'GPS locked with high accuracy of ±{accuracy} m.', gpsLocked: 'GPS locked with accuracy of ±{accuracy} m. Confirm the point on the map before booking.',
    gpsLocking: 'Locking GPS… best accuracy ±{accuracy} m. Waiting for a stable position.', gpsDenied: 'Location access was denied. Allow location in your browser settings or choose a point on the map.', gpsSignalUnavailable: 'A GPS signal is not available yet. Move to an open area or choose a point on the map.',
    pickupMarker: 'Pick-up', destinationMarker: 'Destination', routeUnavailable: 'The routing service is currently unavailable.', routeSnapNotice: 'The route uses the nearest road about {distance} m from the selected point. Confirm the pick-up point before booking.', roadRouteUnavailable: 'The road route could not be calculated.',
    chooseDifferent: 'Choose different pick-up and destination points.', waitForRoute: 'Wait until the road route and price have been calculated.', completeBooking: 'Complete your name, WhatsApp number, date, and pick-up time.', bookingSaveFailed: 'The booking could not be saved.', bookingOpened: 'The travel request has opened in WhatsApp.',
    searchResultsPickup: 'Pick-up location search results', searchResultsDestination: 'Destination search results', swapLocations: 'Swap pick-up and destination', interactiveMap: 'Interactive pick-up route map', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    bookingService: 'Travel Service', whatsappGreeting: 'Hello Wonderful Lombok, I would like to book a travel service.', codeLabel: 'Code', nameLabel: 'Name', accuracyLabel: 'Pick-up location accuracy', distanceLabel: 'Estimated distance', costLabel: 'Estimated cost', peopleValue: '{count} people',
    tooManySearches: 'Too many searches. Please try again later.', placeQueryLength: 'The place name must contain 3–120 characters.', tooManyRoutes: 'Too many route requests. Please try again later.', routeOutsideLombok: 'Both route points must be located in Lombok.', routeNotFound: 'No road route was found. Check the selected points on the map.', routeServiceDown: 'The routing service cannot be reached right now. Please try again shortly.'
  },
  'zh-cn': {
    mapPoint: '地图位置 {lat}, {lng}', mapLoadError: '地图暂时无法加载，请检查网络连接后重试。',
    selected: '已选择{field}：{place}', chooseOnMap: '输入地址并按回车键，或点击地图选择{field}。', minimumCharacters: '请输入至少 3 个字符以搜索地点。',
    searchFailed: '地点搜索失败。', noPlaces: '在龙目岛未找到该地点，请尝试输入村庄、酒店或景点名称。', placesFound: '在龙目岛找到 {count} 个地点，请选择最合适的结果。',
    gpsUnsupported: '此设备不支持 GPS。', gpsSearching: '正在寻找最佳 GPS 信号…请停留在此页面，直到精度稳定。', gpsUnavailable: '无法读取您的位置。请允许位置访问，或在地图上选择地点。',
    gpsOutside: 'GPS 显示的位置不在龙目岛。请使用搜索或在地图上选择地点。', gpsInsufficient: '当前 GPS 精度为 ±{accuracy} 米，尚不足以安全估算价格。请移至空旷处重试，或在地图上点击准确位置。',
    currentLocation: '我的当前位置（精度 ±{accuracy} 米）', gpsLockedHigh: 'GPS 已锁定，高精度为 ±{accuracy} 米。', gpsLocked: 'GPS 已锁定，精度为 ±{accuracy} 米。预订前请确认地图上的位置。',
    gpsLocking: '正在锁定 GPS…最佳精度 ±{accuracy} 米，等待位置稳定。', gpsDenied: '位置访问被拒绝。请在浏览器设置中允许位置访问，或在地图上选择地点。', gpsSignalUnavailable: '暂时无法获得 GPS 信号。请移至空旷处，或在地图上选择地点。',
    pickupMarker: '接送地点', destinationMarker: '目的地', routeUnavailable: '路线服务暂时不可用。', routeSnapNotice: '路线使用距离所选位置约 {distance} 米的最近道路。预订前请确认接送地点。', roadRouteUnavailable: '无法计算公路路线。',
    chooseDifferent: '请选择不同的接送地点和目的地。', waitForRoute: '请等待公路路线和价格计算完成。', completeBooking: '请填写姓名、WhatsApp 号码、日期和接送时间。', bookingSaveFailed: '无法保存预订。', bookingOpened: '接送预订摘要已在 WhatsApp 中打开。',
    searchResultsPickup: '接送地点搜索结果', searchResultsDestination: '目的地搜索结果', swapLocations: '交换接送地点和目的地', interactiveMap: '互动接送路线地图', zoomIn: '放大地图', zoomOut: '缩小地图',
    bookingService: '接送服务', whatsappGreeting: '您好 Wonderful Lombok，我想预订接送服务。', codeLabel: '编号', nameLabel: '姓名', accuracyLabel: '接送地点精度', distanceLabel: '预计距离', costLabel: '预计费用', peopleValue: '{count} 人',
    tooManySearches: '搜索次数过多，请稍后再试。', placeQueryLength: '地点名称必须包含 3–120 个字符。', tooManyRoutes: '路线请求过多，请稍后再试。', routeOutsideLombok: '路线的两个地点都必须位于龙目岛。', routeNotFound: '未找到公路路线，请检查地图上的所选位置。', routeServiceDown: '目前无法连接路线服务，请稍后重试。'
  },
  'zh-tw': {
    mapPoint: '地圖位置 {lat}, {lng}', mapLoadError: '地圖暫時無法載入，請檢查網路連線後重試。',
    selected: '已選擇{field}：{place}', chooseOnMap: '輸入地址並按 Enter，或點選地圖選擇{field}。', minimumCharacters: '請輸入至少 3 個字元以搜尋地點。',
    searchFailed: '地點搜尋失敗。', noPlaces: '在龍目島找不到此地點，請嘗試輸入村莊、飯店或景點名稱。', placesFound: '在龍目島找到 {count} 個地點，請選擇最合適的結果。',
    gpsUnsupported: '此裝置不支援 GPS。', gpsSearching: '正在尋找最佳 GPS 訊號…請停留在此頁面，直到精度穩定。', gpsUnavailable: '無法讀取您的位置。請允許位置存取，或在地圖上選擇地點。',
    gpsOutside: 'GPS 顯示的位置不在龍目島。請使用搜尋或在地圖上選擇地點。', gpsInsufficient: '目前 GPS 精度為 ±{accuracy} 公尺，尚不足以安全估算價格。請移至空曠處重試，或在地圖上點選準確位置。',
    currentLocation: '我的目前位置（精度 ±{accuracy} 公尺）', gpsLockedHigh: 'GPS 已鎖定，高精度為 ±{accuracy} 公尺。', gpsLocked: 'GPS 已鎖定，精度為 ±{accuracy} 公尺。預訂前請確認地圖上的位置。',
    gpsLocking: '正在鎖定 GPS…最佳精度 ±{accuracy} 公尺，等待位置穩定。', gpsDenied: '位置存取遭拒。請在瀏覽器設定中允許位置存取，或在地圖上選擇地點。', gpsSignalUnavailable: '暫時無法取得 GPS 訊號。請移至空曠處，或在地圖上選擇地點。',
    pickupMarker: '接送地點', destinationMarker: '目的地', routeUnavailable: '路線服務暫時無法使用。', routeSnapNotice: '路線使用距離所選位置約 {distance} 公尺的最近道路。預訂前請確認接送地點。', roadRouteUnavailable: '無法計算公路路線。',
    chooseDifferent: '請選擇不同的接送地點和目的地。', waitForRoute: '請等待公路路線和價格計算完成。', completeBooking: '請填寫姓名、WhatsApp 號碼、日期和接送時間。', bookingSaveFailed: '無法儲存預訂。', bookingOpened: '接送預訂摘要已在 WhatsApp 中開啟。',
    searchResultsPickup: '接送地點搜尋結果', searchResultsDestination: '目的地搜尋結果', swapLocations: '交換接送地點和目的地', interactiveMap: '互動接送路線地圖', zoomIn: '放大地圖', zoomOut: '縮小地圖',
    bookingService: '接送服務', whatsappGreeting: '您好 Wonderful Lombok，我想預訂接送服務。', codeLabel: '編號', nameLabel: '姓名', accuracyLabel: '接送地點精度', distanceLabel: '預估距離', costLabel: '預估費用', peopleValue: '{count} 人',
    tooManySearches: '搜尋次數過多，請稍後再試。', placeQueryLength: '地點名稱必須包含 3–120 個字元。', tooManyRoutes: '路線要求過多，請稍後再試。', routeOutsideLombok: '路線的兩個地點都必須位於龍目島。', routeNotFound: '找不到公路路線，請檢查地圖上的所選位置。', routeServiceDown: '目前無法連接路線服務，請稍後重試。'
  },
  nl: {
    mapPoint: 'Kaartpunt {lat}, {lng}', mapLoadError: 'De kaart kon niet worden geladen. Controleer je verbinding en probeer opnieuw.',
    selected: '{field} gekozen: {place}', chooseOnMap: 'Typ een adres en druk op Enter, of klik op de kaart om de {field} te kiezen.', minimumCharacters: 'Voer minimaal 3 tekens in om een plaats te zoeken.',
    searchFailed: 'Zoeken naar plaatsen is mislukt.', noPlaces: 'Geen plaats op Lombok gevonden. Probeer de naam van een dorp, hotel of bezienswaardigheid.', placesFound: '{count} plaatsen op Lombok gevonden. Kies het beste resultaat.',
    gpsUnsupported: 'Dit apparaat ondersteunt geen GPS.', gpsSearching: 'Het beste GPS-signaal zoeken… blijf op deze pagina tot de nauwkeurigheid stabiel is.', gpsUnavailable: 'Je locatie kon niet worden gelezen. Sta locatietoegang toe of kies een punt op de kaart.',
    gpsOutside: 'GPS geeft een locatie buiten Lombok aan. Gebruik zoeken of kies een punt op de kaart.', gpsInsufficient: 'De GPS-nauwkeurigheid is momenteel ±{accuracy} m en is niet precies genoeg voor een veilige prijsinschatting. Ga naar een open plek en probeer opnieuw, of tik het juiste punt op de kaart aan.',
    currentLocation: 'Mijn huidige locatie (nauwkeurigheid ±{accuracy} m)', gpsLockedHigh: 'GPS vastgelegd met hoge nauwkeurigheid van ±{accuracy} m.', gpsLocked: 'GPS vastgelegd met een nauwkeurigheid van ±{accuracy} m. Controleer het punt op de kaart voordat je boekt.',
    gpsLocking: 'GPS vastleggen… beste nauwkeurigheid ±{accuracy} m. Wachten op een stabiele positie.', gpsDenied: 'Locatietoegang is geweigerd. Sta locatie toe in de browserinstellingen of kies een punt op de kaart.', gpsSignalUnavailable: 'Er is nog geen GPS-signaal. Ga naar een open plek of kies een punt op de kaart.',
    pickupMarker: 'Ophalen', destinationMarker: 'Bestemming', routeUnavailable: 'De routeservice is momenteel niet beschikbaar.', routeSnapNotice: 'De route gebruikt de dichtstbijzijnde weg, ongeveer {distance} m van het gekozen punt. Controleer de ophaallocatie voordat je boekt.', roadRouteUnavailable: 'De wegroute kon niet worden berekend.',
    chooseDifferent: 'Kies verschillende ophaal- en bestemmingspunten.', waitForRoute: 'Wacht tot de wegroute en prijs zijn berekend.', completeBooking: 'Vul naam, WhatsApp-nummer, datum en ophaaltijd in.', bookingSaveFailed: 'De boeking kon niet worden opgeslagen.', bookingOpened: 'De transferaanvraag is geopend in WhatsApp.',
    searchResultsPickup: 'Zoekresultaten voor ophaallocatie', searchResultsDestination: 'Zoekresultaten voor bestemming', swapLocations: 'Ophaallocatie en bestemming omwisselen', interactiveMap: 'Interactieve kaart van de ophaalroute', zoomIn: 'Inzoomen', zoomOut: 'Uitzoomen',
    bookingService: 'Transferservice', whatsappGreeting: 'Hallo Wonderful Lombok, ik wil graag een transfer boeken.', codeLabel: 'Code', nameLabel: 'Naam', accuracyLabel: 'Nauwkeurigheid ophaallocatie', distanceLabel: 'Geschatte afstand', costLabel: 'Geschatte kosten', peopleValue: '{count} personen',
    tooManySearches: 'Te veel zoekopdrachten. Probeer het later opnieuw.', placeQueryLength: 'De plaatsnaam moet 3–120 tekens bevatten.', tooManyRoutes: 'Te veel routeaanvragen. Probeer het later opnieuw.', routeOutsideLombok: 'Beide routepunten moeten op Lombok liggen.', routeNotFound: 'Geen wegroute gevonden. Controleer de gekozen punten op de kaart.', routeServiceDown: 'De routeservice is nu niet bereikbaar. Probeer het zo opnieuw.'
  },
  fr: {
    mapPoint: 'Point sur la carte {lat}, {lng}', mapLoadError: 'La carte n’a pas pu être chargée. Vérifiez votre connexion et réessayez.',
    selected: '{field} sélectionné : {place}', chooseOnMap: 'Saisissez une adresse et appuyez sur Entrée, ou cliquez sur la carte pour choisir le {field}.', minimumCharacters: 'Saisissez au moins 3 caractères pour rechercher un lieu.',
    searchFailed: 'La recherche de lieu a échoué.', noPlaces: 'Aucun lieu trouvé à Lombok. Essayez le nom d’un village, d’un hôtel ou d’un site touristique.', placesFound: '{count} lieux trouvés à Lombok. Choisissez le résultat le plus adapté.',
    gpsUnsupported: 'Cet appareil ne prend pas en charge le GPS.', gpsSearching: 'Recherche du meilleur signal GPS… restez sur cette page jusqu’à ce que la précision soit stable.', gpsUnavailable: 'Votre position n’a pas pu être lue. Autorisez l’accès à la localisation ou choisissez un point sur la carte.',
    gpsOutside: 'Le GPS indique une position hors de Lombok. Utilisez la recherche ou choisissez un point sur la carte.', gpsInsufficient: 'La précision GPS est actuellement de ±{accuracy} m, ce qui ne suffit pas pour une estimation fiable. Placez-vous dans un espace dégagé et réessayez, ou touchez le point exact sur la carte.',
    currentLocation: 'Ma position actuelle (précision ±{accuracy} m)', gpsLockedHigh: 'Position GPS obtenue avec une grande précision de ±{accuracy} m.', gpsLocked: 'Position GPS obtenue avec une précision de ±{accuracy} m. Vérifiez le point sur la carte avant de réserver.',
    gpsLocking: 'Position GPS en cours… meilleure précision ±{accuracy} m. Attente d’une position stable.', gpsDenied: 'L’accès à la localisation a été refusé. Autorisez-le dans les réglages du navigateur ou choisissez un point sur la carte.', gpsSignalUnavailable: 'Le signal GPS n’est pas encore disponible. Placez-vous dans un espace dégagé ou choisissez un point sur la carte.',
    pickupMarker: 'Prise en charge', destinationMarker: 'Destination', routeUnavailable: 'Le service d’itinéraire est momentanément indisponible.', routeSnapNotice: 'L’itinéraire utilise la route la plus proche, à environ {distance} m du point choisi. Vérifiez le lieu de prise en charge avant de réserver.', roadRouteUnavailable: 'L’itinéraire routier n’a pas pu être calculé.',
    chooseDifferent: 'Choisissez des points de départ et d’arrivée différents.', waitForRoute: 'Attendez que l’itinéraire et le prix soient calculés.', completeBooking: 'Renseignez votre nom, votre numéro WhatsApp, la date et l’heure de prise en charge.', bookingSaveFailed: 'La réservation n’a pas pu être enregistrée.', bookingOpened: 'La demande de transfert a été ouverte dans WhatsApp.',
    searchResultsPickup: 'Résultats pour le lieu de prise en charge', searchResultsDestination: 'Résultats pour la destination', swapLocations: 'Inverser le départ et la destination', interactiveMap: 'Carte interactive de l’itinéraire', zoomIn: 'Zoom avant', zoomOut: 'Zoom arrière',
    bookingService: 'Service de transfert', whatsappGreeting: 'Bonjour Wonderful Lombok, je souhaite réserver un transfert.', codeLabel: 'Code', nameLabel: 'Nom', accuracyLabel: 'Précision du lieu de prise en charge', distanceLabel: 'Distance estimée', costLabel: 'Coût estimé', peopleValue: '{count} personnes',
    tooManySearches: 'Trop de recherches. Réessayez plus tard.', placeQueryLength: 'Le nom du lieu doit comporter entre 3 et 120 caractères.', tooManyRoutes: 'Trop de demandes d’itinéraire. Réessayez plus tard.', routeOutsideLombok: 'Les deux points de l’itinéraire doivent se trouver à Lombok.', routeNotFound: 'Aucun itinéraire routier trouvé. Vérifiez les points choisis sur la carte.', routeServiceDown: 'Le service d’itinéraire est inaccessible pour le moment. Réessayez dans un instant.'
  },
  de: {
    mapPoint: 'Kartenpunkt {lat}, {lng}', mapLoadError: 'Die Karte konnte nicht geladen werden. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    selected: '{field} ausgewählt: {place}', chooseOnMap: 'Adresse eingeben und Enter drücken oder auf die Karte klicken, um den {field} auszuwählen.', minimumCharacters: 'Geben Sie mindestens 3 Zeichen ein, um einen Ort zu suchen.',
    searchFailed: 'Die Ortssuche ist fehlgeschlagen.', noPlaces: 'Auf Lombok wurde kein Ort gefunden. Versuchen Sie den Namen eines Dorfes, Hotels oder Ausflugsziels.', placesFound: '{count} Orte auf Lombok gefunden. Wählen Sie das passendste Ergebnis.',
    gpsUnsupported: 'Dieses Gerät unterstützt kein GPS.', gpsSearching: 'Bestes GPS-Signal wird gesucht… bleiben Sie auf dieser Seite, bis die Genauigkeit stabil ist.', gpsUnavailable: 'Ihr Standort konnte nicht gelesen werden. Erlauben Sie den Standortzugriff oder wählen Sie einen Punkt auf der Karte.',
    gpsOutside: 'GPS zeigt einen Standort außerhalb Lomboks. Verwenden Sie die Suche oder wählen Sie einen Punkt auf der Karte.', gpsInsufficient: 'Die GPS-Genauigkeit beträgt derzeit ±{accuracy} m und reicht für eine sichere Preisschätzung nicht aus. Gehen Sie ins Freie und versuchen Sie es erneut oder tippen Sie den genauen Punkt auf der Karte an.',
    currentLocation: 'Mein aktueller Standort (Genauigkeit ±{accuracy} m)', gpsLockedHigh: 'GPS mit hoher Genauigkeit von ±{accuracy} m erfasst.', gpsLocked: 'GPS mit einer Genauigkeit von ±{accuracy} m erfasst. Prüfen Sie vor der Buchung den Punkt auf der Karte.',
    gpsLocking: 'GPS wird erfasst… beste Genauigkeit ±{accuracy} m. Warten auf eine stabile Position.', gpsDenied: 'Der Standortzugriff wurde verweigert. Erlauben Sie ihn in den Browsereinstellungen oder wählen Sie einen Punkt auf der Karte.', gpsSignalUnavailable: 'Noch kein GPS-Signal verfügbar. Gehen Sie ins Freie oder wählen Sie einen Punkt auf der Karte.',
    pickupMarker: 'Abholung', destinationMarker: 'Ziel', routeUnavailable: 'Der Routendienst ist derzeit nicht verfügbar.', routeSnapNotice: 'Die Route nutzt die nächstgelegene Straße, etwa {distance} m vom gewählten Punkt entfernt. Prüfen Sie den Abholort vor der Buchung.', roadRouteUnavailable: 'Die Straßenroute konnte nicht berechnet werden.',
    chooseDifferent: 'Wählen Sie unterschiedliche Abhol- und Zielpunkte.', waitForRoute: 'Warten Sie, bis Straßenroute und Preis berechnet wurden.', completeBooking: 'Füllen Sie Name, WhatsApp-Nummer, Datum und Abholzeit aus.', bookingSaveFailed: 'Die Buchung konnte nicht gespeichert werden.', bookingOpened: 'Die Transferanfrage wurde in WhatsApp geöffnet.',
    searchResultsPickup: 'Suchergebnisse für den Abholort', searchResultsDestination: 'Suchergebnisse für das Ziel', swapLocations: 'Abholort und Ziel tauschen', interactiveMap: 'Interaktive Karte der Abholroute', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern',
    bookingService: 'Transferservice', whatsappGreeting: 'Hallo Wonderful Lombok, ich möchte einen Transfer buchen.', codeLabel: 'Code', nameLabel: 'Name', accuracyLabel: 'Genauigkeit des Abholorts', distanceLabel: 'Geschätzte Entfernung', costLabel: 'Geschätzte Kosten', peopleValue: '{count} Personen',
    tooManySearches: 'Zu viele Suchanfragen. Versuchen Sie es später erneut.', placeQueryLength: 'Der Ortsname muss 3–120 Zeichen enthalten.', tooManyRoutes: 'Zu viele Routenanfragen. Versuchen Sie es später erneut.', routeOutsideLombok: 'Beide Routenpunkte müssen auf Lombok liegen.', routeNotFound: 'Keine Straßenroute gefunden. Prüfen Sie die gewählten Punkte auf der Karte.', routeServiceDown: 'Der Routendienst ist derzeit nicht erreichbar. Versuchen Sie es gleich noch einmal.'
  },
  ms: {
    mapPoint: 'Titik peta {lat}, {lng}', mapLoadError: 'Peta tidak dapat dimuatkan. Semak sambungan anda dan cuba lagi.',
    selected: '{field} dipilih: {place}', chooseOnMap: 'Taip alamat dan tekan Enter, atau klik peta untuk memilih {field}.', minimumCharacters: 'Masukkan sekurang-kurangnya 3 aksara untuk mencari tempat.',
    searchFailed: 'Carian tempat gagal.', noPlaces: 'Tiada tempat ditemui di Lombok. Cuba nama kampung, hotel atau tempat tarikan.', placesFound: '{count} tempat ditemui di Lombok. Pilih hasil yang paling sesuai.',
    gpsUnsupported: 'Peranti ini tidak menyokong GPS.', gpsSearching: 'Mencari isyarat GPS terbaik… kekal di halaman ini sehingga ketepatan stabil.', gpsUnavailable: 'Lokasi anda tidak dapat dibaca. Benarkan akses lokasi atau pilih titik pada peta.',
    gpsOutside: 'GPS menunjukkan lokasi di luar Lombok. Gunakan carian atau pilih titik pada peta.', gpsInsufficient: 'Ketepatan GPS kini ±{accuracy} m dan belum cukup tepat untuk anggaran harga yang selamat. Pergi ke kawasan terbuka dan cuba lagi, atau ketik titik tepat pada peta.',
    currentLocation: 'Lokasi semasa saya (ketepatan ±{accuracy} m)', gpsLockedHigh: 'GPS dikunci dengan ketepatan tinggi ±{accuracy} m.', gpsLocked: 'GPS dikunci dengan ketepatan ±{accuracy} m. Semak titik pada peta sebelum menempah.',
    gpsLocking: 'Mengunci GPS… ketepatan terbaik ±{accuracy} m. Menunggu kedudukan stabil.', gpsDenied: 'Akses lokasi ditolak. Benarkan lokasi dalam tetapan pelayar atau pilih titik pada peta.', gpsSignalUnavailable: 'Isyarat GPS belum tersedia. Pergi ke kawasan terbuka atau pilih titik pada peta.',
    pickupMarker: 'Jemputan', destinationMarker: 'Destinasi', routeUnavailable: 'Perkhidmatan laluan tidak tersedia buat masa ini.', routeSnapNotice: 'Laluan menggunakan jalan terdekat kira-kira {distance} m dari titik pilihan. Semak lokasi jemput sebelum menempah.', roadRouteUnavailable: 'Laluan jalan tidak dapat dikira.',
    chooseDifferent: 'Pilih lokasi jemput dan destinasi yang berbeza.', waitForRoute: 'Tunggu sehingga laluan jalan dan harga selesai dikira.', completeBooking: 'Lengkapkan nama, nombor WhatsApp, tarikh dan waktu jemput.', bookingSaveFailed: 'Tempahan tidak dapat disimpan.', bookingOpened: 'Permintaan travel telah dibuka dalam WhatsApp.',
    searchResultsPickup: 'Hasil carian lokasi jemput', searchResultsDestination: 'Hasil carian destinasi', swapLocations: 'Tukar lokasi jemput dan destinasi', interactiveMap: 'Peta interaktif laluan jemputan', zoomIn: 'Zum masuk', zoomOut: 'Zum keluar',
    bookingService: 'Perkhidmatan Travel', whatsappGreeting: 'Hai Wonderful Lombok, saya ingin menempah perkhidmatan travel.', codeLabel: 'Kod', nameLabel: 'Nama', accuracyLabel: 'Ketepatan lokasi jemput', distanceLabel: 'Anggaran jarak', costLabel: 'Anggaran kos', peopleValue: '{count} orang',
    tooManySearches: 'Terlalu banyak carian. Cuba lagi kemudian.', placeQueryLength: 'Nama tempat mesti mengandungi 3–120 aksara.', tooManyRoutes: 'Terlalu banyak permintaan laluan. Cuba lagi kemudian.', routeOutsideLombok: 'Kedua-dua titik laluan mesti berada di Lombok.', routeNotFound: 'Laluan jalan tidak ditemui. Semak titik pilihan pada peta.', routeServiceDown: 'Perkhidmatan laluan tidak dapat dicapai sekarang. Cuba lagi sebentar lagi.'
  }
};

export function getFormCopy(locale) {
  const base = locale === 'id' ? formId : { ...formEn, ...(formTranslations[locale] || {}) };
  return { ...base, ...(mapCopy[locale] || mapCopy.en) };
}
