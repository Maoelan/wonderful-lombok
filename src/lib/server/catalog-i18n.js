import { defaultCatalog } from '../catalog.js';
import { destinationSlug, getCopy, localeTag, slugify } from '../i18n.js';
import { heroCopy } from '../hero-copy.js';

const hasText = (value) => typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
const hasItems = (value) => Array.isArray(value) && value.length > 0;
// Convex returns object keys in its own order, so compare structurally instead
// of by serialized text or every saved itinerary looks edited.
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
};
const sameValue = (left, right) => JSON.stringify(sortKeys(left ?? null)) === JSON.stringify(sortKeys(right ?? null));

// Admin base content is canonical. Bundled translations are used only while
// the corresponding base field is unchanged; once an admin edits it, every
// locale falls back to the edited base until an explicit English translation
// is saved. This prevents stale bundled copy from hiding CMS changes.
const baseWasEdited = (item, field, defaultItem) => Boolean(defaultItem) && !sameValue(item?.[field], defaultItem?.[field]);
const englishWasEdited = (item, field, defaultItem) => Boolean(defaultItem) && !sameValue(item?.[`${field}En`], defaultItem?.[`${field}En`]);

const localizedField = (item, field, locale, fallback, defaultItem) => {
  const base = item?.[field];
  const english = item?.[`${field}En`];
  if (locale === 'id') return base;
  const baseEdited = baseWasEdited(item, field, defaultItem);
  const englishEdited = englishWasEdited(item, field, defaultItem);
  if (locale === 'en') {
    if (hasText(english) && (!baseEdited || englishEdited)) return english;
    return hasText(base) ? base : hasText(english) ? english : fallback;
  }
  if (baseEdited) return base;
  if (hasText(fallback)) return fallback;
  if (hasText(english)) return english;
  return base;
};

const localizedList = (item, field, locale, fallback, defaultItem) => {
  const base = item?.[field] || [];
  const english = item?.[`${field}En`] || [];
  if (locale === 'id') return base;
  const baseEdited = baseWasEdited(item, field, defaultItem);
  const englishEdited = englishWasEdited(item, field, defaultItem);
  if (locale === 'en') {
    if (hasItems(english) && (!baseEdited || englishEdited)) return english;
    return hasItems(base) ? base : hasItems(english) ? english : [];
  }
  if (baseEdited) return base;
  if (hasItems(fallback)) return fallback;
  if (hasItems(english)) return english;
  return base;
};

// Day labels are structural, so they stay translatable even when edited
// itinerary copy falls back to the CMS base language.
const dayLabels = {
  en: { day: (number) => `Day ${number}`, pagi: 'Morning', siang: 'Afternoon', sore: 'Evening' },
  'zh-cn': { day: (number) => `第${number}天`, pagi: '上午', siang: '下午', sore: '傍晚' },
  'zh-tw': { day: (number) => `第${number}天`, pagi: '上午', siang: '下午', sore: '傍晚' },
  nl: { day: (number) => `Dag ${number}`, pagi: 'Ochtend', siang: 'Middag', sore: 'Avond' },
  fr: { day: (number) => `Jour ${number}`, pagi: 'Matin', siang: 'Après-midi', sore: 'Soir' },
  de: { day: (number) => `Tag ${number}`, pagi: 'Morgen', siang: 'Nachmittag', sore: 'Abend' },
  ms: { day: (number) => `Hari ${number}`, pagi: 'Pagi', siang: 'Petang', sore: 'Senja' }
};

const localizedDayLabel = (value, locale) => {
  const labels = dayLabels[locale];
  const label = typeof value === 'string' ? value.trim() : '';
  if (!labels || !label) return value;
  const numbered = label.match(/^hari\s+(\d+)$/i);
  if (numbered) return labels.day(numbered[1]);
  return labels[label.toLowerCase()] || value;
};

const localizedItinerary = (item, locale, fallback, defaultItem) => {
  const days = localizedList(item, 'itinerary', locale, fallback, defaultItem);
  if (locale === 'id') return days;
  return days.map((day) => ({ ...day, day: localizedDayLabel(day.day, locale) }));
};

const isContactPrice = (value) => hasText(value) && !/\d/.test(String(value));
const localizedTierPrice = (tier, locale, fallback = {}, defaultItem) => {
  if (locale === 'id' || !isContactPrice(tier.price)) return tier.price;
  const defaultPrice = defaultItem?.price;
  if (defaultPrice !== undefined && tier.price !== defaultPrice) return tier.price;
  if (hasText(fallback.price)) return fallback.price;
  return getCopy(locale).contact || tier.price;
};

const localizedTier = (tier, locale, fallback = {}, defaultItem) => ({
  ...tier,
  guests: localizedField(tier, 'guests', locale, fallback.guests, defaultItem),
  note: localizedField(tier, 'note', locale, fallback.note, defaultItem),
  price: localizedTierPrice(tier, locale, fallback, defaultItem)
});

const localizedSettings = {
  'zh-cn': { aboutTitle: '一个联系人，安排你的龙目岛旅程。', aboutDescription: '从机场接机、海滩之间的接送到多日旅游，所有细节都会在出发前通过 WhatsApp 确认。' },
  'zh-tw': { aboutTitle: '一個聯絡人，安排你的龍目島旅程。', aboutDescription: '從機場接送、海灘之間的交通到多日旅遊，所有細節都會在出發前透過 WhatsApp 確認。' },
  nl: { aboutTitle: 'Eén contactpersoon voor je reis op Lombok.', aboutDescription: 'Van aankomst op de luchthaven en strandtransfers tot meerdaagse tours: alle details worden vóór vertrek via WhatsApp bevestigd.' },
  fr: { aboutTitle: 'Un seul contact pour votre voyage à Lombok.', aboutDescription: 'De l’arrivée à l’aéroport aux transferts entre plages et aux circuits de plusieurs jours, chaque détail est confirmé sur WhatsApp avant le départ.' },
  de: { aboutTitle: 'Ein Kontakt für Ihre gesamte Lombok-Reise.', aboutDescription: 'Von der Abholung am Flughafen über Strandtransfers bis zu mehrtägigen Touren werden alle Details vor der Abfahrt über WhatsApp bestätigt.' },
  ms: { aboutTitle: 'Satu hubungan untuk perjalanan anda di Lombok.', aboutDescription: 'Daripada ketibaan di lapangan terbang dan pemindahan antara pantai hingga lawatan beberapa hari, setiap butiran disahkan melalui WhatsApp sebelum bertolak.' }
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

const keyedTranslations = (keys, records) => new Map(keys.map((key, index) => [key, records?.[index] || {}]));
const defaultKeys = {
  packages: defaultCatalog.packages.map((item) => item.slug),
  destinations: defaultCatalog.destinations.map((item) => destinationSlug(item)),
  rentals: defaultCatalog.rentals.map((item) => item.slug || slugify(item.name)),
  faqs: defaultCatalog.faqs.map((item) => item.slug || slugify(item.question))
};
const translationsByLocale = Object.fromEntries(Object.entries(catalogTranslations).map(([code, translation]) => [code, {
  packages: keyedTranslations(defaultKeys.packages, translation.packages),
  destinations: keyedTranslations(defaultKeys.destinations, translation.destinations),
  rentals: keyedTranslations(defaultKeys.rentals, translation.rentals),
  faqs: keyedTranslations(defaultKeys.faqs, translation.faqs)
}]));
const detailsByLocale = Object.fromEntries(Object.entries(packageDetailTranslations).map(([code, records]) => [
  code,
  keyedTranslations(defaultKeys.packages, records)
]));
const tierTranslationsByLocale = Object.fromEntries(Object.entries(packageDetailTranslations).map(([code, records]) => {
  const byPackage = new Map();
  defaultCatalog.packages.forEach((item, index) => {
    const detail = records?.[index] || {};
    byPackage.set(item.slug, new Map((item.priceTiers || []).map((tier, tierIndex) => [
      tier.key || slugify(tier.guests),
      detail.priceTiers?.[tierIndex] || {}
    ])));
  });
  return [code, byPackage];
}));
const defaultsBySlug = (items) => new Map(items.map((item) => [item.slug || slugify(item.name || item.question), item]));
const defaultRentals = defaultsBySlug(defaultCatalog.rentals);
const defaultFaqs = defaultsBySlug(defaultCatalog.faqs);
const defaultPackages = new Map(defaultCatalog.packages.map((item) => [item.slug, item]));
const defaultDestinations = new Map(defaultCatalog.destinations.map((item) => [destinationSlug(item), item]));
const itemKey = (item, field = 'name') => item?.slug || slugify(item?.[field]);

function localizedRentalPrice(item, locale, fallback, defaultItem) {
  const edited = Boolean(defaultItem) && item.price !== defaultItem.price;
  if (locale === 'id') return item.price;
  if (locale === 'en') return edited ? item.price : hasText(item.priceEn) ? item.priceEn : item.price;
  if (edited) return item.price;
  return hasText(fallback.price) ? fallback.price : item.price;
}

function replaceTravelRate(value, rate, locale) {
  const formatted = new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 0 }).format(rate);
  return String(value || '').replace(/\b10(?:[.,\s\u00a0]000)\b/g, formatted);
}

function localizedFaqField(item, field, locale, fallback, defaultItem, travelRate) {
  let value = localizedField(item, field, locale, fallback[field], defaultItem);

  if (field === 'answer' && defaultItem && sameValue(item.answer, defaultItem.answer) && Number(travelRate) !== Number(defaultCatalog.travelRate)) {
    value = replaceTravelRate(value, travelRate, locale);
  }
  return value;
}

export function localizeCatalog(catalog, locale) {
  const settings = { ...(catalog.settings || {}) };
  const settingsFallback = { ...(localizedSettings[locale] || {}), ...(heroCopy[locale] || {}) };
  for (const field of ['heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription']) settings[field] = localizedField(settings, field, locale, settingsFallback[field], defaultCatalog.settings);

  const localizedCatalog = {
    ...catalog,
    settings,
    packages: (catalog.packages || []).map((item) => {
      const key = itemKey(item);
      const defaultItem = defaultPackages.get(key);
      const packageFallback = translationsByLocale[locale]?.packages?.get(key) || {};
      const detailFallback = detailsByLocale[locale]?.get(key) || {};
      const tierFallbacks = tierTranslationsByLocale[locale]?.get(key);
      return {
        ...item,
        slug: item.slug || slugify(item.name),
        name: localizedField(item, 'name', locale, packageFallback.name, defaultItem),
        route: localizedField(item, 'route', locale, packageFallback.route, defaultItem),
        detail: localizedField(item, 'detail', locale, packageFallback.detail, defaultItem),
        category: localizedField(item, 'category', locale, packageFallback.category, defaultItem),
        duration: localizedField(item, 'duration', locale, packageFallback.duration, defaultItem),
        unit: localizedField(item, 'unit', locale, packageFallback.unit, defaultItem),
        itinerary: localizedItinerary(item, locale, detailFallback.itinerary, defaultItem),
        includes: localizedList(item, 'includes', locale, detailFallback.includes, defaultItem),
        excludes: localizedList(item, 'excludes', locale, detailFallback.excludes, defaultItem),
        priceTiers: (item.priceTiers || []).map((tier) => {
          const tierKey = tier.key || slugify(tier.guests);
          const defaultTier = defaultItem?.priceTiers?.find((candidate) => (candidate.key || slugify(candidate.guests)) === tierKey);
          return localizedTier(tier, locale, tierFallbacks?.get(tierKey), defaultTier || (defaultItem ? {} : undefined));
        })
      };
    }),
    destinations: (catalog.destinations || []).map((item) => {
      const key = destinationSlug(item);
      const defaultItem = defaultDestinations.get(key);
      const fallback = translationsByLocale[locale]?.destinations?.get(key) || {};
      return {
        ...item,
        name: localizedField(item, 'name', locale, fallback.name, defaultItem),
        note: localizedField(item, 'note', locale, fallback.note, defaultItem),
        detail: localizedField(item, 'detail', locale, fallback.detail, defaultItem)
      };
    }),
    faqs: (catalog.faqs || []).map((item) => {
      const key = itemKey(item, 'question');
      const fallback = translationsByLocale[locale]?.faqs?.get(key) || {};
      const defaultItem = defaultFaqs.get(key);
      return {
        ...item,
        question: localizedField(item, 'question', locale, fallback.question, defaultItem),
        answer: localizedFaqField(item, 'answer', locale, fallback, defaultItem, catalog.travelRate)
      };
    })
  };
  if (catalog.rentals) {
    localizedCatalog.rentals = catalog.rentals.map((item) => {
      const key = itemKey(item);
      const defaultItem = defaultRentals.get(key);
      const fallback = translationsByLocale[locale]?.rentals?.get(key) || {};
      return {
        ...item,
        name: localizedField(item, 'name', locale, fallback.name, defaultItem),
        detail: localizedField(item, 'detail', locale, fallback.detail, defaultItem),
        price: localizedRentalPrice(item, locale, fallback, defaultItem)
      };
    });
  }
  return localizedCatalog;
}
