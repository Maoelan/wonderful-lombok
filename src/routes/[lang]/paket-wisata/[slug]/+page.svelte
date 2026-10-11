<script>
  import { onMount } from 'svelte';
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import { getCopy, getFormCopy, languages, localePath } from '#lib/i18n.js';
  import LanguageSelector from '#lib/LanguageSelector.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  export let data;
  $: c = getCopy(data.locale);
  $: formCopy = getFormCopy(data.locale);
  $: item = data.item;
  $: gallery = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
  let selectedIndex = 0;
  $: if (selectedIndex >= gallery.length) selectedIndex = 0;
  $: selectedImage = gallery[selectedIndex];
  $: home = localePath(data.locale);
  $: message = data.locale === 'id'
    ? `Halo Wonderful Lombok, saya ingin memesan ${item.name}.`
    : `Hello Wonderful Lombok, I would like to book ${item.name}.`;
  const showImage = (index) => selectedIndex = (index + gallery.length) % gallery.length;
  onMount(() => {
    if (gallery.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => showImage(selectedIndex + 1), 5200);
    return () => window.clearInterval(timer);
  });
</script>

<svelte:head>
  <title>{item.name} | Wonderful Lombok</title><meta name="description" content={item.detail} />
  <link rel="canonical" href={data.canonicalUrl} />{#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}<link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="product" /><meta property="og:title" content={item.name} /><meta property="og:description" content={item.detail} /><meta property="og:url" content={data.canonicalUrl} /><meta property="og:image" content={data.socialImageUrl} />
</svelte:head>

<header class="inner-header"><a class="brand brand-logo" href={home}><img src="/wonderful-lombok-logo.png" alt="Wonderful Lombok" /></a><nav><a href={localePath(data.locale, '/paket-wisata')}>{c.tours}</a><LanguageSelector locale={data.locale} suffix={`/paket-wisata/${item.slug}`} /></nav></header>
<main class="tour-detail-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><a href={`/${data.locale}/paket-wisata`}>{c.tours}</a></nav>
  <section class="tour-hero">
    <div class="tour-gallery"><div class="tour-main-image">{#key selectedImage}<img class="package-slide" src={selectedImage} alt={`${item.name}, ${c.image} ${selectedIndex + 1}`} />{/key}{#if gallery.length > 1}<button class="tour-gallery-arrow previous" type="button" on:click={() => showImage(selectedIndex - 1)} aria-label={formCopy.previousImage}>‹</button><button class="tour-gallery-arrow next" type="button" on:click={() => showImage(selectedIndex + 1)} aria-label={formCopy.nextImage}>›</button><span class="tour-gallery-count">{selectedIndex + 1}/{gallery.length}</span>{/if}</div>{#if gallery.length > 1}<div class="tour-thumbnails">{#each gallery as image, index}<button class:active={selectedIndex === index} on:click={() => showImage(index)} aria-label={`${c.viewImage} ${index + 1}`}><img src={image} alt="" /></button>{/each}</div>{/if}</div>
    <div class="tour-summary"><div class="tour-meta"><span>{item.category}</span><span>{item.duration}</span></div><h1>{item.name}</h1><p>{item.detail}</p><div class="tour-route"><span>{c.highlights}</span><strong>{item.route}</strong></div><div class="tour-price"><span>{c.from}</span><b>{item.price}</b><small>{item.unit}</small></div><a class="button primary" href={createWhatsAppUrl(message, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.bookWhatsapp}</a></div>
  </section>
  <div class="tour-content">
    <section><p class="label">{c.itinerary}</p><h2>{c.itineraryHeading}</h2><div class="itinerary-list">{#each item.itinerary as day}<article><span>{day.day}</span><div><h3>{day.title}</h3><ul>{#each day.items as point}<li>{point}</li>{/each}</ul></div></article>{/each}</div></section>
    <aside class="tour-inclusions"><div><h2>{c.includes}</h2><ul>{#each item.includes as line}<li>{line}</li>{/each}</ul></div><div><h2>{c.excludes}</h2><ul>{#each item.excludes as line}<li>{line}</li>{/each}</ul></div></aside>
  </div>
  {#if item.priceTiers?.length}<section class="price-section"><p class="label">{c.prices}</p><h2>{c.priceHeading}</h2><div class="price-table" role="table">{#each item.priceTiers as tier}<div class="price-row" role="row"><strong>{tier.guests}</strong><b>{tier.price}</b><span>{tier.note}</span></div>{/each}</div></section>{/if}
  <section class="detail-cta"><div><p class="label">Wonderful Lombok</p><h2>{c.readyTitle}</h2></div><a class="button primary" href={createWhatsAppUrl(message, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.bookWhatsapp}</a></section>
</main>
<WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
