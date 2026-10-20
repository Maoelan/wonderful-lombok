<script>
  import LazyPickupCalculator from '../lib/LazyPickupCalculator.svelte';
  import BookingDialog from '../lib/BookingDialog.svelte';
  import { createWhatsAppUrl, formatWhatsAppNumber } from '../lib/whatsapp.js';
  import { imageSrcset, imageUrl } from '../lib/image.js';
  import { destinationSlug, getCopy, getFormCopy, languages, localePath } from '../lib/i18n.js';
  import { getSeoCopy, jsonLdScript, travelAgencySchema } from '../lib/seo.js';
  import LanguageSelector from '../lib/LanguageSelector.svelte';
  import WhatsAppFloat from '../lib/WhatsAppFloat.svelte';

  export let data;
  let menuOpen = false;
  let booking = null;
  let tourMenu;
  let destinationMenu;
  const rights = { id: 'Hak cipta dilindungi.', en: 'All rights reserved.', 'zh-cn': '保留所有权利。', 'zh-tw': '保留所有權利。', nl: 'Alle rechten voorbehouden.', fr: 'Tous droits réservés.', de: 'Alle Rechte vorbehalten.', ms: 'Hak cipta terpelihara.' };
  $: locale = data.locale || 'id';
  $: c = getCopy(locale);
  $: formCopy = getFormCopy(locale);
  $: localeHome = localePath(locale);
  $: packages = data.catalog.packages;
  $: transport = data.catalog.rentals || [];
  $: travelRate = data.catalog.travelRate;
  $: settings = data.catalog.settings;
  $: rentalEnabled = data.rentalEnabled === true;
  $: seo = getSeoCopy(locale);
  $: seoDescription = seo.homeDescription;
  $: seoTitle = seo.homeTitle;
  $: formattedTravelRate = new Intl.NumberFormat('id-ID').format(travelRate);
  $: destinations = data.catalog.destinations;
  $: faqs = data.catalog.faqs;
  $: heroSource = imageUrl(settings.heroImage, 1280);
  $: heroSrcset = imageSrcset(settings.heroImage, [640, 960, 1280, 1600]);
  $: businessSchema = travelAgencySchema({ homeUrl: data.alternateUrls[locale], imageUrl: data.socialImageUrl, description: seoDescription, settings, languages: languages.map((language) => language.hreflang) });
  const fallbackImage = '/wonderful-lombok-icon-192.png';
  const packageGallery = (item) => {
    const images = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
    return images.length ? images : [fallbackImage];
  };
  function closeMenu() {
    menuOpen = false;
    if (tourMenu) tourMenu.open = false;
    if (destinationMenu) destinationMenu.open = false;
  }
  function handlePageClick(event) {
    if (event.target instanceof Element && event.target.closest('.nav-dropdown')) return;
    if (tourMenu) tourMenu.open = false;
    if (destinationMenu) destinationMenu.open = false;
  }
  function keepOneDropdown(current, other) { if (current?.open && other) other.open = false; }
  function reveal(node) {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
    node.classList.add('reveal-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('reveal-visible');
      observer.disconnect();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<svelte:head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  {#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <link rel="preload" as="image" href={heroSource} imagesrcset={heroSrcset} imagesizes="100vw" fetchpriority="high" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content={seo.og} />
  {#each languages.filter((language) => language.code !== locale) as language}<meta property="og:locale:alternate" content={getSeoCopy(language.code).og} />{/each}
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:image:alt" content={seo.imageAlt} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={data.socialImageUrl} />
  <meta name="twitter:image:alt" content={seo.imageAlt} />
  {@html jsonLdScript(businessSchema)}
</svelte:head>

<svelte:window on:click={handlePageClick} />

<div class="site-theme" class:theme-ocean={settings.colorTheme === 'ocean'}>
<header class="site-header">
  <a class="brand brand-logo" href={localeHome} aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
  <div class="mobile-language"><LanguageSelector {locale} prominent /></div>
  <button class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" on:click={() => menuOpen ? closeMenu() : menuOpen = true}><span class="sr-only">{c.menu}</span><i></i><i></i></button>
  <nav id="main-navigation" class:open={menuOpen} aria-label={c.menu}>
    <details class="nav-dropdown" bind:this={tourMenu} on:toggle={() => keepOneDropdown(tourMenu, destinationMenu)}>
      <summary>{c.tours}</summary>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-all" href={`/${locale}/paket-wisata`} on:click={closeMenu}>{c.allTours}</a>
        {#each packages as item}<a href={`/${locale}/paket-wisata/${item.slug}`} on:click={closeMenu}><span>{item.name}</span><small>{item.duration}</small></a>{/each}
      </div>
    </details>
    <a href={localePath(locale, '/travel-lombok')} on:click={closeMenu}>{c.travel}</a>{#if rentalEnabled}<a href="#rental" on:click={closeMenu}>{c.rental}</a>{/if}
    <details class="nav-dropdown" bind:this={destinationMenu} on:toggle={() => keepOneDropdown(destinationMenu, tourMenu)}>
      <summary>{c.destinations}</summary>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-all" href="#destinasi" on:click={closeMenu}>{c.destinationLabel}</a>
        {#each destinations as destination}<a href={localePath(locale, `/destinasi/${destinationSlug(destination)}`)} on:click={closeMenu}><span>{destination.name}</span><small>{destination.note}</small></a>{/each}
      </div>
    </details>
    <div class="nav-language"><LanguageSelector {locale} /></div>
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
    <div class="hero-image"><img src={heroSource} srcset={heroSrcset} sizes="100vw" alt={seo.imageAlt} width="1600" height="900" loading="eager" fetchpriority="high" /></div><div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="label">{c.heroLabel}</p><h1 id="hero-title">{settings.heroTitle}</h1>
      <div class="hero-intro rich-content">{@html settings.heroDescription}</div>
      <div class="hero-actions"><a class="button primary" href="#pilih-layanan">{c.heroPrimary}</a><a class="text-link" href="#paket">{c.heroSecondary}</a></div>
    </div>
  </section>

  <section class="service-choice section" id="pilih-layanan" aria-labelledby="choice-title" use:reveal>
    <div class="choice-heading"><p class="label">{c.start}</p><h2 id="choice-title">{c.choiceTitle}</h2></div>
    <div class:without-rental={!rentalEnabled} class="choice-list">
      <article><span>01</span><h3>{c.tours}</h3><p>{c.tourChoice}</p><a href="#paket">{c.viewTours}</a></article>
      <article><span>02</span><h3>{c.travel}</h3><p>{c.travelChoice}</p><a href={localePath(locale, '/travel-lombok')}>{c.calculate}</a></article>
      {#if rentalEnabled}<article><span>03</span><h3>{c.rental}</h3><p>{c.rentalChoice}</p><a href="#rental">{c.viewRental}</a></article>{/if}
    </div>
  </section>

  <section class="packages section" id="paket" aria-labelledby="packages-title" use:reveal>
    <div class="section-heading"><div><p class="label">{c.tours}</p><h2 id="packages-title">{c.tourHeading}</h2></div><p>{c.tourIntro}</p></div>
    <div class="package-list" itemprop="hasOfferCatalog" itemscope itemtype="https://schema.org/OfferCatalog">
      <meta itemprop="name" content={seo.catalogTitle} />
      {#each packages as item, index}
        {@const gallery = packageGallery(item)}
        <article class:featured={index === 0} class="package-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/Offer"><a class="card-image-button" href={`/${locale}/paket-wisata/${item.slug}`} aria-label={`${c.viewDetail}: ${item.name}`}><img class="package-slide" src={imageUrl(gallery[0], 640)} srcset={imageSrcset(gallery[0], [480, 640, 800])} sizes="(max-width: 760px) 92vw, 42vw" alt="" loading="lazy" decoding="async" width="640" height="420" itemprop="image" />{#if gallery.length > 1}<span class="gallery-progress" aria-hidden="true">1/{gallery.length}</span>{/if}</a><div class="package-body"><span class="package-number">0{index + 1}</span><h3 itemprop="name">{item.name}</h3><p itemprop="description">{item.route}</p><div class="package-price"><strong>{item.price}</strong><span>{item.unit}</span></div><div class="package-actions"><a class="inline-book" href={`/${locale}/paket-wisata/${item.slug}`}>{c.viewDetail}</a><button class="package-book" type="button" on:click={() => booking = { type: 'wisata', name: item.name }}>{c.bookTour}</button></div></div></article>
      {/each}
    </div>
  </section>

  <section class="destinations" id="destinasi" aria-labelledby="destinations-title">
    <div class="section section-heading" use:reveal><div><p class="label">{c.destinationLabel}</p><h2 id="destinations-title">{c.destinationHeading}</h2></div><p>{c.destinationIntro}</p></div>
    <div class="destination-grid section" use:reveal>
      {#each destinations as destination, index}
        <a class:wide={index === 0} class="destination-card" href={localePath(locale, `/destinasi/${destinationSlug(destination)}`)}><img src={imageUrl(destination.image || fallbackImage, 640)} srcset={imageSrcset(destination.image || fallbackImage, [480, 640, 800])} sizes="(max-width: 760px) 92vw, 40vw" alt="" loading="lazy" decoding="async" width="720" height="500" /><div><h3>{destination.name}</h3><p>{destination.note}</p></div></a>
      {/each}
    </div>
  </section>

  <section class="travel-section" id="paket-travel" aria-labelledby="travel-title">
    <div class="section travel-heading" use:reveal>
      <div><p class="label">{c.travel}</p><h2 id="travel-title">{c.travelHeading}</h2></div>
      <div class="travel-description"><p>{c.travelIntro} {formCopy.rate}: Rp{formattedTravelRate}.</p><dl><div><dt>{c.suitable}</dt><dd>{c.suitableValue}</dd></div><div><dt>{c.ordering}</dt><dd>{c.orderingValue}</dd></div></dl></div>
    </div>
    <div class="section pickup-block" id="hitung-travel" use:reveal>
      <div class="pickup-intro"><div><p class="label">{c.travelCalc}</p><h2>{c.travelCalcHeading}</h2></div><p>{c.travelCalcIntro}</p></div>
      <div class="calculator-wrap" data-whatsapp-float-avoid><LazyPickupCalculator rate={travelRate} whatsapp={settings.whatsapp} {locale} /></div>
    </div>
  </section>

  {#if rentalEnabled}
    <section class="rental-section section" id="rental" aria-labelledby="rental-title" use:reveal>
      <div class="section-heading"><div><p class="label">{c.rentalLabel}</p><h2 id="rental-title">{c.rentalHeading}</h2></div><p>{c.rentalIntro}</p></div>
      <div class="rental-list">
        {#each transport as item}
          <article><span class="transport-symbol" aria-hidden="true">{item.symbol}</span><div><h3>{item.name}</h3><div class="rich-content">{@html item.detail}</div><strong>{item.price}</strong></div><button class="inline-book" on:click={() => booking = { type: 'rental', name: item.name }}>{c.bookRental}</button></article>
        {/each}
      </div>
    </section>
  {/if}

  <section class="about section" id="tentang" aria-labelledby="about-title" use:reveal>
    <div class="about-image"><img src={imageUrl(settings.aboutImage, 900)} srcset={imageSrcset(settings.aboutImage, [600, 900, 1200])} sizes="(max-width: 760px) 100vw, 50vw" alt={seo.imageAlt} loading="lazy" decoding="async" width="900" height="900" /></div>
    <div class="about-copy"><p class="label">{c.why}</p><h2 id="about-title">{settings.aboutTitle}</h2><div class="rich-content">{@html settings.aboutDescription}</div><ul class="check-list">{#each c.benefits as benefit}<li>{benefit}</li>{/each}</ul><a class="button dark" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin konsultasi untuk merencanakan perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">{c.consultTrip}</a></div>
  </section>

  <section class="faq section" aria-labelledby="faq-title" use:reveal itemscope itemtype="https://schema.org/FAQPage">
    <div><p class="label">{c.faq}</p><h2 id="faq-title">{c.faqHeading}</h2></div>
    <div class="faq-list">{#each faqs as faq}<details itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><summary itemprop="name">{faq.question}</summary><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><div class="rich-content" itemprop="text">{@html faq.answer}</div></div></details>{/each}</div>
  </section>
</main>

<footer id="kontak" data-whatsapp-float-avoid>
  <div class="footer-brand"><span>Wonderful</span><b>Lombok</b><p>{c.localPartner}</p></div>
  <div class="footer-links"><a href="#paket">{c.tours}</a><a href={localePath(locale, '/travel-lombok')}>{c.travel}</a>{#if rentalEnabled}<a href="#rental">{c.rentalLabel}</a>{/if}<a href="#destinasi">{c.destinations}</a></div>
  <div class="footer-contact"><strong>{c.contact}</strong><a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {formatWhatsAppNumber(settings.whatsapp)}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><span>{settings.location}</span>{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>{/if}</div>
  <p class="footer-copyright">© {new Date().getFullYear()} Wonderful Lombok. {rights[locale] || rights.en}</p>
</footer>
<BookingDialog bind:booking whatsapp={settings.whatsapp} {locale} />
<WhatsAppFloat whatsapp={settings.whatsapp} {locale} />
</div>
