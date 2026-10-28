<script>
  import { imageSrcset, imageUrl } from '../../../../lib/image.js';
  import { onMount } from 'svelte';
  import BookingDialog from '#lib/BookingDialog.svelte';
  import { packageBooking } from '#lib/booking-context.js';
  import { getCopy, getFormCopy, languages, localePath } from '#lib/i18n.js';
  import { getSeoCopy, jsonLdScript, plainDescription, tourSchema } from '#lib/seo.js';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  export let data;
  $: c = getCopy(data.locale);
  $: formCopy = getFormCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: item = data.item;
  $: gallery = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
  $: if (!gallery.length) gallery = ['/wonderful-lombok-icon-192.png'];
  let selectedIndex = 0;
  let booking = null;
  $: if (selectedIndex >= gallery.length) selectedIndex = 0;
  $: selectedImage = gallery[selectedIndex];
  $: home = localePath(data.locale);
  $: plainDetail = plainDescription(item.detail);
  $: origin = new URL(data.canonicalUrl).origin;
  $: homeUrl = `${origin}${localePath(data.locale)}`;
  $: toursUrl = `${origin}${localePath(data.locale, '/paket-wisata')}`;
  $: imageUrls = gallery.map((image) => new URL(image, origin).href);
  $: structuredData = tourSchema({ item, canonicalUrl: data.canonicalUrl, imageUrls, description: plainDetail, homeUrl, homeLabel: c.home, toursUrl, toursLabel: seo.toursBreadcrumb });
  const showImage = (index) => selectedIndex = (index + gallery.length) % gallery.length;
  onMount(() => {
    if (gallery.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => showImage(selectedIndex + 1), 5200);
    return () => window.clearInterval(timer);
  });
</script>

<svelte:head>
  <title>{item.name} | Wonderful Lombok</title><meta name="description" content={plainDetail} />
  <meta name="robots" content="index,follow,max-image-preview:large" /><meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />{#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}<link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="website" /><meta property="og:locale" content={seo.og} /><meta property="og:site_name" content="Wonderful Lombok" /><meta property="og:title" content={item.name} /><meta property="og:description" content={plainDetail} /><meta property="og:url" content={data.canonicalUrl} /><meta property="og:image" content={data.socialImageUrl} /><meta property="og:image:alt" content={`${item.name}, ${seo.imageAlt}`} />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={item.name} /><meta name="twitter:description" content={plainDetail} /><meta name="twitter:image" content={data.socialImageUrl} /><meta name="twitter:image:alt" content={`${item.name}, ${seo.imageAlt}`} />
  {@html jsonLdScript(structuredData)}
</svelte:head>

<div class="site-theme" class:theme-ocean={data.catalog.settings.colorTheme === 'ocean'}>
<SiteHeader locale={data.locale} suffix={`/paket-wisata/${item.slug}`} packages={data.catalog.packages} destinations={data.catalog.destinations} />
<main class="tour-detail-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><a href={`/${data.locale}/paket-wisata`}>{c.tours}</a></nav>
    <section class="tour-hero" data-whatsapp-float-avoid>
    <div class="tour-gallery"><div class="tour-main-image">{#key selectedImage}<img class="package-slide" src={imageUrl(selectedImage, 900)} srcset={imageSrcset(selectedImage, [600, 900, 1200])} sizes="(max-width: 760px) 100vw, 58vw" alt={`${item.name}, ${c.image} ${selectedIndex + 1}`} loading="eager" fetchpriority="high" decoding="async" width="900" height="650" />{/key}{#if gallery.length > 1}<button class="tour-gallery-arrow previous" type="button" on:click={() => showImage(selectedIndex - 1)} aria-label={formCopy.previousImage}>‹</button><button class="tour-gallery-arrow next" type="button" on:click={() => showImage(selectedIndex + 1)} aria-label={formCopy.nextImage}>›</button><span class="tour-gallery-count">{selectedIndex + 1}/{gallery.length}</span>{/if}</div>{#if gallery.length > 1}<div class="tour-thumbnails">{#each gallery as image, index}<button class:active={selectedIndex === index} on:click={() => showImage(index)} aria-label={`${c.viewImage} ${index + 1}`}><img src={imageUrl(image, 240)} alt="" loading="lazy" decoding="async" width="120" height="80" /></button>{/each}</div>{/if}</div>
    <div class="tour-summary"><div class="tour-meta"><span>{item.category}</span><span>{item.duration}</span></div><h1>{item.name}</h1><div class="rich-content">{@html item.detail}</div><div class="tour-route"><span>{c.highlights}</span><strong>{item.route}</strong></div><div class="tour-price"><span>{c.from}</span><b>{item.price}</b><small>{item.unit}</small></div><button class="button primary" type="button" on:click={() => booking = packageBooking(item)}>{c.bookWhatsapp}</button></div>
  </section>
  <div class="tour-content">
    <section><p class="label">{c.itinerary}</p><h2>{c.itineraryHeading}</h2><div class="itinerary-list">{#each item.itinerary as day}<article><span>{day.day}</span><div><h3>{day.title}</h3><ul>{#each day.items as point}<li>{point}</li>{/each}</ul></div></article>{/each}</div></section>
    <aside class="tour-inclusions"><div><h2>{c.includes}</h2><ul>{#each item.includes as line}<li>{line}</li>{/each}</ul></div><div><h2>{c.excludes}</h2><ul>{#each item.excludes as line}<li>{line}</li>{/each}</ul></div></aside>
  </div>
  {#if item.priceTiers?.length}<section class="price-section"><p class="label">{c.prices}</p><h2>{c.priceHeading}</h2><div class="price-table" role="table" aria-label={c.priceHeading}>{#each item.priceTiers as tier}<div class="price-row" role="row"><span role="cell"><strong>{tier.guests}</strong></span><b role="cell">{tier.price}</b><span role="cell">{tier.note}</span></div>{/each}</div></section>{/if}
  <section class="detail-cta" data-whatsapp-float-avoid><div><p class="label">Wonderful Lombok</p><h2>{c.readyTitle}</h2></div><button class="button primary" type="button" on:click={() => booking = packageBooking(item)}>{c.bookWhatsapp}</button></section>
</main>
<SiteFooter settings={data.catalog.settings} locale={data.locale} />
<BookingDialog bind:booking whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
<WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
</div>
