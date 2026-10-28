export const heroCopy = {
  id: { heroTitle: 'Wisata & antar-jemput Lombok', heroDescription: 'Pilih tur privat atau cek tarif antar-jemput untuk bandara, hotel, dan destinasi di Lombok.' },
  en: { heroTitle: 'Lombok tours & transfers', heroDescription: 'Choose a private tour or check transfer fares for Lombok airports, hotels and destinations.' },
  'zh-cn': { heroTitle: '龙目岛旅游与接送', heroDescription: '选择私人旅游，或查询龙目岛机场、酒店及景点之间的接送费用。' },
  'zh-tw': { heroTitle: '龍目島旅遊與接送', heroDescription: '選擇私人旅遊，或查詢龍目島機場、飯店及景點之間的接送費用。' },
  nl: { heroTitle: 'Lombok: tours & transfers', heroDescription: 'Kies een privétour of bekijk de transfertarieven voor de luchthaven, hotels en bestemmingen op Lombok.' },
  fr: { heroTitle: 'Lombok : visites et transferts', heroDescription: 'Choisissez une excursion privée ou consultez les tarifs des transferts entre l’aéroport, les hôtels et les sites de Lombok.' },
  de: { heroTitle: 'Lombok: Touren & Transfers', heroDescription: 'Wählen Sie eine private Tour oder prüfen Sie Transferpreise für Flughafen, Hotels und Ausflugsziele auf Lombok.' },
  ms: { heroTitle: 'Lombok: lawatan & jemput-hantar', heroDescription: 'Pilih lawatan peribadi atau semak tambang jemput-hantar untuk lapangan terbang, hotel dan destinasi di Lombok.' }
};

const legacyHeroSettings = {
  heroTitle: 'Lombok, dirancang sesuai caramu bepergian.',
  heroTitleEn: 'Lombok, planned around the way you travel.',
  heroDescription: 'Pilih tur privat, antar-jemput antarlokasi, atau kendaraan dengan driver. Kami membantu merangkai rute yang masuk akal untuk waktu liburanmu.',
  heroDescriptionEn: 'Choose a private tour, point-to-point transfer, or a vehicle with a driver. We help shape a route that fits the time you have.'
};

// Upgrade only unchanged seed copy when reading older catalogues; custom CMS text remains canonical.
export function refreshLegacyHeroSettings(settings) {
  const next = { ...settings };
  for (const [field, legacy] of Object.entries(legacyHeroSettings)) {
    const stored = next[field];
    const plain = typeof stored === 'string' && stored.startsWith('<p>') && stored.endsWith('</p>')
      ? stored.slice(3, -4)
      : stored;
    if (plain === legacy) {
      const english = field.endsWith('En');
      next[field] = heroCopy[english ? 'en' : 'id'][english ? field.slice(0, -2) : field];
    }
  }
  return next;
}
