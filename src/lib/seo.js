const seoByLocale = {
  id: {
    tag: 'id-ID', og: 'id_ID',
    homeTitle: 'Paket Wisata Lombok & Travel Privat | Wonderful Lombok',
    homeDescription: 'Paket wisata privat Lombok, travel bandara dan pelabuhan, serta itinerary fleksibel dengan driver lokal. Hitung rute dan pesan melalui WhatsApp.',
    catalogTitle: 'Paket Wisata Lombok Privat | Wonderful Lombok',
    catalogDescription: 'Pilih paket wisata Lombok berdasarkan durasi, destinasi, itinerary, dan jumlah tamu. Lihat rincian harga sebelum memesan melalui WhatsApp.',
    imageAlt: 'Perjalanan privat di Lombok bersama Wonderful Lombok',
    toursBreadcrumb: 'Paket Wisata Lombok'
  },
  en: {
    tag: 'en', og: 'en_US',
    homeTitle: 'Lombok Private Tours & Transfers | Wonderful Lombok',
    homeDescription: 'Private Lombok tours, airport and harbour transfers, flexible itineraries, and local drivers. Check your route and continue booking through WhatsApp.',
    catalogTitle: 'Private Lombok Tour Packages | Wonderful Lombok',
    catalogDescription: 'Compare private Lombok tours by duration, destinations, itinerary, and group size. Review the price details before booking through WhatsApp.',
    imageAlt: 'Private travel in Lombok with Wonderful Lombok',
    toursBreadcrumb: 'Lombok Tour Packages'
  },
  'zh-cn': {
    tag: 'zh-Hans', og: 'zh_CN',
    homeTitle: '龙目岛私人旅游与接送服务 | Wonderful Lombok',
    homeDescription: '提供龙目岛私人旅游、机场与港口接送、灵活行程和当地司机服务。查看路线与预估价格，并通过 WhatsApp 继续预订。',
    catalogTitle: '龙目岛私人旅游套餐 | Wonderful Lombok',
    catalogDescription: '按照天数、目的地、行程和人数比较龙目岛私人旅游套餐，查看价格详情后通过 WhatsApp 预订。',
    imageAlt: '与 Wonderful Lombok 一起体验龙目岛私人旅行',
    toursBreadcrumb: '龙目岛旅游套餐'
  },
  'zh-tw': {
    tag: 'zh-Hant', og: 'zh_TW',
    homeTitle: '龍目島私人旅遊與接送服務 | Wonderful Lombok',
    homeDescription: '提供龍目島私人旅遊、機場與港口接送、彈性行程和當地司機服務。查看路線與預估價格，並透過 WhatsApp 繼續預訂。',
    catalogTitle: '龍目島私人旅遊套裝 | Wonderful Lombok',
    catalogDescription: '依照天數、目的地、行程和人數比較龍目島私人旅遊套裝，查看價格詳情後透過 WhatsApp 預訂。',
    imageAlt: '與 Wonderful Lombok 一起體驗龍目島私人旅行',
    toursBreadcrumb: '龍目島旅遊套裝'
  },
  nl: {
    tag: 'nl', og: 'nl_NL',
    homeTitle: 'Privéreizen en transfers op Lombok | Wonderful Lombok',
    homeDescription: 'Privéreizen op Lombok, luchthaven- en haventransfers, flexibele routes en lokale chauffeurs. Bekijk de route en boek verder via WhatsApp.',
    catalogTitle: 'Privéreispakketten Lombok | Wonderful Lombok',
    catalogDescription: 'Vergelijk privéreizen op Lombok op duur, bestemmingen, programma en groepsgrootte. Bekijk prijzen en boek vervolgens via WhatsApp.',
    imageAlt: 'Privéreis op Lombok met Wonderful Lombok',
    toursBreadcrumb: 'Reispakketten Lombok'
  },
  fr: {
    tag: 'fr', og: 'fr_FR',
    homeTitle: 'Circuits privés et transferts à Lombok | Wonderful Lombok',
    homeDescription: 'Circuits privés à Lombok, transferts aéroport et port, itinéraires flexibles et chauffeurs locaux. Consultez le trajet et réservez via WhatsApp.',
    catalogTitle: 'Circuits privés à Lombok | Wonderful Lombok',
    catalogDescription: 'Comparez les circuits privés à Lombok par durée, destinations, programme et taille du groupe avant de réserver via WhatsApp.',
    imageAlt: 'Voyage privé à Lombok avec Wonderful Lombok',
    toursBreadcrumb: 'Circuits à Lombok'
  },
  de: {
    tag: 'de', og: 'de_DE',
    homeTitle: 'Private Lombok-Reisen und Transfers | Wonderful Lombok',
    homeDescription: 'Private Lombok-Reisen, Flughafen- und Hafentransfers, flexible Routen und lokale Fahrer. Route prüfen und über WhatsApp weiterbuchen.',
    catalogTitle: 'Private Lombok-Reisepakete | Wonderful Lombok',
    catalogDescription: 'Vergleichen Sie private Lombok-Reisen nach Dauer, Zielen, Ablauf und Gruppengröße. Preise ansehen und über WhatsApp buchen.',
    imageAlt: 'Private Lombok-Reise mit Wonderful Lombok',
    toursBreadcrumb: 'Lombok-Reisepakete'
  },
  ms: {
    tag: 'ms', og: 'ms_MY',
    homeTitle: 'Pakej Lombok Persendirian & Travel | Wonderful Lombok',
    homeDescription: 'Pakej persendirian Lombok, pemindahan lapangan terbang dan pelabuhan, jadual fleksibel serta pemandu tempatan. Semak laluan dan tempah melalui WhatsApp.',
    catalogTitle: 'Pakej Pelancongan Lombok Persendirian | Wonderful Lombok',
    catalogDescription: 'Bandingkan pakej Lombok mengikut tempoh, destinasi, jadual dan bilangan tetamu. Semak harga sebelum menempah melalui WhatsApp.',
    imageAlt: 'Perjalanan persendirian di Lombok bersama Wonderful Lombok',
    toursBreadcrumb: 'Pakej Pelancongan Lombok'
  }
};

export function getSeoCopy(locale) {
  return seoByLocale[locale] || seoByLocale.en;
}

export function plainDescription(value, maximum = 160) {
  const text = String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maximum) return text;
  const shortened = text.slice(0, maximum - 1).replace(/\s+\S*$/, '').trim();
  return `${shortened || text.slice(0, maximum - 1)}…`;
}

export function jsonLdScript(value) {
  const json = JSON.stringify(value).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function travelAgencySchema({ homeUrl, imageUrl, description, settings, languages }) {
  const origin = new URL(homeUrl).origin;
  const sameAs = [settings.instagram, settings.tiktok, settings.facebook].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['TravelAgency', 'LocalBusiness'],
        '@id': `${origin}/#business`,
        name: 'Wonderful Lombok',
        url: homeUrl,
        image: imageUrl,
        description,
        email: settings.email,
        telephone: `+${String(settings.whatsapp || '').replace(/\D/g, '')}`,
        areaServed: { '@type': 'AdministrativeArea', name: 'Lombok, Nusa Tenggara Barat, Indonesia' },
        address: { '@type': 'PostalAddress', addressLocality: 'Lombok', addressRegion: 'Nusa Tenggara Barat', addressCountry: 'ID' },
        ...(sameAs.length ? { sameAs } : {})
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: 'Wonderful Lombok',
        publisher: { '@id': `${origin}/#business` },
        inLanguage: languages
      }
    ]
  };
}

export function tourSchema({ item, canonicalUrl, imageUrls, description, homeUrl, homeLabel, toursUrl, toursLabel }) {
  const origin = new URL(canonicalUrl).origin;
  const numericPrice = Number(String(item.price || '').replace(/\D/g, ''));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { name: homeLabel, url: homeUrl },
        { name: toursLabel, url: toursUrl },
        { name: item.name, url: canonicalUrl }
      ]),
      {
        '@type': 'TouristTrip',
        '@id': `${canonicalUrl}#tour`,
        name: item.name,
        description,
        url: canonicalUrl,
        image: imageUrls,
        itinerary: item.route,
        touristType: 'Private tour',
        provider: { '@id': `${origin}/#business` },
        ...(numericPrice ? { offers: { '@type': 'Offer', url: canonicalUrl, price: numericPrice, priceCurrency: 'IDR', availability: 'https://schema.org/InStock' } } : {})
      }
    ]
  };
}
