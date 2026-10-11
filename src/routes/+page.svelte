<script>
  import PickupCalculator from '../lib/PickupCalculator.svelte';
  import BookingDialog from '../lib/BookingDialog.svelte';
  import DetailDialog from '../lib/DetailDialog.svelte';
  import { createWhatsAppUrl } from '../lib/whatsapp.js';
  import { getCopy } from '../lib/i18n.js';
  import WhatsAppFloat from '../lib/WhatsAppFloat.svelte';

  export let data;
  let menuOpen = false;
  let booking = null;
  let detailItem = null;
  let detailKind = 'destinasi';
  $: locale = data.locale || 'id';
  $: c = getCopy(locale);
  $: localeHome = locale === 'en' ? '/en' : '/';
  let packages = data.catalog.packages;
  let transport = data.catalog.rentals;
  let travelRate = data.catalog.travelRate;
  let settings = data.catalog.settings;
  $: seoDescription = locale === 'en' ? 'Private Lombok tour packages, airport and harbour transfers, and vehicle rental with local drivers.' : 'Paket wisata Lombok, travel bandara dan pelabuhan, serta rental kendaraan dengan driver lokal. Pesan perjalanan privat bersama Wonderful Lombok.';
  $: formattedTravelRate = new Intl.NumberFormat('id-ID').format(travelRate);
  let destinations = data.catalog.destinations;
  let faqs = data.catalog.faqs;
  function showDetail(item) { detailItem = item; }
  function closeMenu() { menuOpen = false; }
  function reveal(node) {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
    if (node.getBoundingClientRect().top < window.innerHeight * 0.82) return {};
    node.classList.add('reveal-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('reveal-visible');
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<svelte:head>
  <title>{locale === 'en' ? 'Lombok Tour Packages, Travel & Rental' : 'Paket Wisata Lombok, Travel & Rental'} | Wonderful Lombok</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  <link rel="alternate" hreflang="id-ID" href={data.alternateUrls.id} />
  <link rel="alternate" hreflang="en" href={data.alternateUrls.en} />
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin="anonymous" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'id_ID'} />
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:image:alt" content="Pemandangan perjalanan di Lombok bersama Wonderful Lombok" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={data.socialImageUrl} />
  <meta name="twitter:image:alt" content="Pemandangan perjalanan di Lombok bersama Wonderful Lombok" />
</svelte:head>

<header class="site-header">
  <a class="brand" href={localeHome} aria-label="Wonderful Lombok"><span>Wonderful</span><b>Lombok</b></a>
  <button class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" on:click={() => menuOpen = !menuOpen}><span class="sr-only">{c.menu}</span><i></i><i></i></button>
  <nav id="main-navigation" class:open={menuOpen} aria-label="Navigasi utama">
    <a href="#paket" on:click={closeMenu}>{c.tours}</a><a href="#paket-travel" on:click={closeMenu}>{c.travel}</a><a href="#rental" on:click={closeMenu}>{c.rental}</a><a href="#destinasi" on:click={closeMenu}>{c.destinations}</a>
    <a class="language-switch" href={locale === 'en' ? '/' : '/en'} hreflang={locale === 'en' ? 'id' : 'en'}>{locale === 'en' ? 'ID' : 'EN'}</a>
    <a class="nav-action" href={createWhatsAppUrl(locale === 'en' ? 'Hello Wonderful Lombok, I would like to plan a trip in Lombok.' : 'Halo Wonderful Lombok, saya ingin konsultasi perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">{c.consult}</a>
  </nav>
</header>

<main id="top" itemscope itemtype="https://schema.org/TravelAgency">
  <meta itemprop="name" content="Wonderful Lombok" />
  <meta itemprop="url" content={data.canonicalUrl} />
  <meta itemprop="image" content={data.socialImageUrl} />
  <meta itemprop="description" content={seoDescription} />
  <meta itemprop="email" content={settings.email} />
  <meta itemprop="telephone" content={`+${settings.whatsapp.replace(/\D/g, '')}`} />
  <meta itemprop="areaServed" content="Pulau Lombok, Nusa Tenggara Barat" />
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-image" role="img" aria-label="Pantai tropis dengan laut biru"></div><div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="label">{c.heroLabel}</p><h1 id="hero-title">{settings.heroTitle}</h1>
      <p class="hero-intro">{settings.heroDescription}</p>
      <div class="hero-actions"><a class="button primary" href="#pilih-layanan">{c.heroPrimary}</a><a class="text-link" href="#paket">{c.heroSecondary}</a></div>
    </div>
  </section>

  <section class="service-choice section" id="pilih-layanan" aria-labelledby="choice-title" use:reveal>
    <div class="choice-heading"><p class="label">{c.start}</p><h2 id="choice-title">{c.choiceTitle}</h2></div>
    <div class="choice-list">
      <article><span>01</span><h3>{c.tours}</h3><p>{c.tourChoice}</p><a href="#paket">{c.viewTours}</a></article>
      <article><span>02</span><h3>{c.travel}</h3><p>{c.travelChoice}</p><a href="#paket-travel">{c.calculate}</a></article>
      <article><span>03</span><h3>{c.rental}</h3><p>{c.rentalChoice}</p><a href="#rental">{c.viewRental}</a></article>
    </div>
  </section>

  <section class="packages section" id="paket" aria-labelledby="packages-title" use:reveal>
    <div class="section-heading"><div><p class="label">{c.tours}</p><h2 id="packages-title">{c.tourHeading}</h2></div><p>{c.tourIntro}</p></div>
    <div class="package-list" itemprop="hasOfferCatalog" itemscope itemtype="https://schema.org/OfferCatalog">
      <meta itemprop="name" content="Paket perjalanan Wonderful Lombok" />
      {#each packages as item, index}
        <article class:featured={index === 0} class="package-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/Offer"><a class="card-image-button" href={`/${locale}/paket-wisata/${item.slug}`} aria-label={`${c.viewDetail}: ${item.name}`}><img src={item.image} alt={item.name} loading="lazy" itemprop="image" /></a><div class="package-body"><span class="package-number">0{index + 1}</span><h3 itemprop="name">{item.name}</h3><p itemprop="description">{item.route}</p><div class="package-price"><strong>{item.price}</strong><span>{item.unit}</span></div><a class="inline-book" href={`/${locale}/paket-wisata/${item.slug}`}>{c.viewDetail}</a></div></article>
      {/each}
    </div>
    <a class="button dark all-packages" href={`/${locale}/paket-wisata`}>{c.allTours}</a>
  </section>

  <section class="destinations" id="destinasi" aria-labelledby="destinations-title">
    <div class="section section-heading" use:reveal><div><p class="label">{c.destinationLabel}</p><h2 id="destinations-title">{c.destinationHeading}</h2></div><p>{c.destinationIntro}</p></div>
    <div class="destination-grid section" use:reveal>
      {#each destinations as destination, index}
        <button class:wide={index === 0} class="destination-card" type="button" style={`background-image: linear-gradient(0deg, rgba(5,35,29,.78), rgba(5,35,29,.02) 70%), url('${destination.image}')`} on:click={() => showDetail(destination)}><div><h3>{destination.name}</h3><p>{destination.note}</p></div></button>
      {/each}
    </div>
  </section>

  <section class="travel-section" id="paket-travel" aria-labelledby="travel-title">
    <div class="section travel-heading" use:reveal>
      <div><p class="label">{c.travel}</p><h2 id="travel-title">{c.travelHeading}</h2></div>
      <div class="travel-description"><p>{c.travelIntro} {locale === 'en' ? `Rate: Rp${formattedTravelRate} per kilometre.` : `Tarif Rp${formattedTravelRate} per kilometer.`}</p><dl><div><dt>{c.suitable}</dt><dd>{c.suitableValue}</dd></div><div><dt>{c.ordering}</dt><dd>{c.orderingValue}</dd></div></dl></div>
    </div>
    <div class="section pickup-block" id="hitung-travel" use:reveal>
      <div class="pickup-intro"><div><p class="label">{c.travelCalc}</p><h2>{c.travelCalcHeading}</h2></div><p>{c.travelCalcIntro}</p></div>
      <div class="calculator-wrap"><PickupCalculator rate={travelRate} whatsapp={settings.whatsapp} {locale} /></div>
    </div>
  </section>

  <section class="rental-section section" id="rental" aria-labelledby="rental-title" use:reveal>
    <div class="section-heading"><div><p class="label">{c.rentalLabel}</p><h2 id="rental-title">{c.rentalHeading}</h2></div><p>{c.rentalIntro}</p></div>
    <div class="rental-list">
      {#each transport as item}
        <article><span class="transport-symbol" aria-hidden="true">{item.symbol}</span><div><h3>{item.name}</h3><p>{item.detail}</p><strong>{item.price}</strong></div><button class="inline-book" on:click={() => booking = { type: 'rental', name: item.name }}>{c.bookRental}</button></article>
      {/each}
    </div>
  </section>

  <section class="about section" id="tentang" aria-labelledby="about-title" use:reveal>
    <div class="about-image" role="img" aria-label="Perbukitan hijau dan laut Lombok"></div>
    <div class="about-copy"><p class="label">{c.why}</p><h2 id="about-title">{settings.aboutTitle}</h2><p>{settings.aboutDescription}</p><ul class="check-list">{#each c.benefits as benefit}<li>{benefit}</li>{/each}</ul><a class="button dark" href={createWhatsAppUrl(locale === 'en' ? 'Hello Wonderful Lombok, I would like to plan a Lombok trip.' : 'Halo Wonderful Lombok, saya ingin konsultasi untuk merencanakan perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">{c.consultTrip}</a></div>
  </section>

  <section class="faq section" aria-labelledby="faq-title" use:reveal itemscope itemtype="https://schema.org/FAQPage">
    <div><p class="label">{c.faq}</p><h2 id="faq-title">{c.faqHeading}</h2></div>
    <div class="faq-list">{#each faqs as faq}<details itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><summary itemprop="name">{faq.question}</summary><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">{faq.answer}</p></div></details>{/each}</div>
  </section>
</main>

<footer id="kontak">
  <div class="footer-brand"><span>Wonderful</span><b>Lombok</b><p>{c.localPartner}</p></div>
  <div class="footer-links"><a href="#paket">{c.tours}</a><a href="#paket-travel">{c.travel}</a><a href="#rental">{c.rentalLabel}</a><a href="#destinasi">{c.destinations}</a></div>
  <div class="footer-contact"><strong>{c.contact}</strong><a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {settings.whatsapp}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><span>{settings.location}</span>{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>{/if}</div>
</footer>
<BookingDialog bind:booking whatsapp={settings.whatsapp} {locale} />
<DetailDialog bind:item={detailItem} kind={detailKind} {locale} />
<WhatsAppFloat whatsapp={settings.whatsapp} {locale} />
