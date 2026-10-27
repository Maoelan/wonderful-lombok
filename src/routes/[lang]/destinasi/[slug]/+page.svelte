<script>
  import { imageSrcset, imageUrl } from '#lib/image.js';
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  import { getCopy, getFormCopy, languages, localePath } from '#lib/i18n.js';
  import { destinationSchema, getDestinationSeo, getSeoCopy, jsonLdScript } from '#lib/seo.js';

  export let data;
  $: c = getCopy(data.locale);
  $: formCopy = getFormCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: destinationSeo = getDestinationSeo(data.locale, data.item);
  $: gallery = [...new Set([data.item.image, ...(data.item.images || [])].filter(Boolean))];
  $: if (!gallery.length) gallery = ['/wonderful-lombok-icon-192.png'];
  let selectedIndex = 0;
  $: selectedImage = gallery[selectedIndex] || gallery[0];
  $: home = localePath(data.locale);
  $: origin = new URL(data.canonicalUrl).origin;
  $: imageUrls = gallery.map((image) => new URL(image, origin).href);
  $: structuredData = destinationSchema({ item: data.item, canonicalUrl: data.canonicalUrl, homeUrl: `${origin}${home}`, homeLabel: c.home, destinationsLabel: data.item.name, imageUrls, description: destinationSeo.description });
  $: customMessage = `${c.customItinerary}: ${data.item.name}`;
  const showImage = (index) => selectedIndex = (index + gallery.length) % gallery.length;
</script>

<svelte:head>
  <title>{destinationSeo.title}</title><meta name="description" content={destinationSeo.description} />
  <meta name="robots" content="index,follow,max-image-preview:large" /><meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />{#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}<link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="website" /><meta property="og:locale" content={seo.og} /><meta property="og:site_name" content="Wonderful Lombok" /><meta property="og:title" content={destinationSeo.title} /><meta property="og:description" content={destinationSeo.description} /><meta property="og:url" content={data.canonicalUrl} /><meta property="og:image" content={data.socialImageUrl} /><meta property="og:image:alt" content={data.item.name} />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={destinationSeo.title} /><meta name="twitter:description" content={destinationSeo.description} /><meta name="twitter:image" content={data.socialImageUrl} />
  {@html jsonLdScript(structuredData)}
</svelte:head>

<div class="site-theme" class:theme-ocean={data.catalog.settings.colorTheme === 'ocean'}>
  <SiteHeader locale={data.locale} suffix={`/destinasi/${data.item.slug}`} packages={data.catalog.packages} destinations={data.catalog.destinations} />
  <main class="tour-detail-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><a href={`${home}#destinasi`}>{c.destinations}</a><span>/</span><span>{data.item.name}</span></nav>
    <section class="tour-hero">
      <div class="tour-gallery"><div class="tour-main-image">{#key selectedImage}<img src={imageUrl(selectedImage, 900)} srcset={imageSrcset(selectedImage, [600, 900, 1200])} sizes="(max-width: 760px) 100vw, 58vw" alt={`${data.item.name}, ${c.image} ${selectedIndex + 1}`} loading="eager" fetchpriority="high" decoding="async" width="900" height="650" />{/key}{#if gallery.length > 1}<button class="tour-gallery-arrow previous" type="button" on:click={() => showImage(selectedIndex - 1)} aria-label={formCopy.previousImage}>‹</button><button class="tour-gallery-arrow next" type="button" on:click={() => showImage(selectedIndex + 1)} aria-label={formCopy.nextImage}>›</button><span class="tour-gallery-count">{selectedIndex + 1}/{gallery.length}</span>{/if}</div>{#if gallery.length > 1}<div class="tour-thumbnails">{#each gallery as image, index}<button class:active={selectedIndex === index} on:click={() => showImage(index)} aria-label={`${c.viewImage} ${index + 1}`}><img src={imageUrl(image, 240)} alt="" loading="lazy" decoding="async" width="120" height="80" /></button>{/each}</div>{/if}</div>
      <div class="tour-summary"><p class="label">{destinationSeo.label}</p><h1>{data.item.name}</h1><p>{data.item.note}</p><div class="tour-route"><span>{destinationSeo.about}</span><div class="rich-content">{@html data.item.detail}</div></div><a class="button primary" href={localePath(data.locale, '/paket-wisata')} data-whatsapp-float-avoid>{c.viewTours}</a></div>
    </section>
    {#if data.relatedPackages.length}<section class="destination-related" aria-labelledby="related-title"><div class="section-heading"><div><p class="label">Wonderful Lombok</p><h2 id="related-title">{destinationSeo.related}</h2></div><p>{destinationSeo.relatedIntro}</p></div><div class="tour-catalog">{#each data.relatedPackages as item}<article class="tour-listing"><a class="tour-listing-image" href={`/${data.locale}/paket-wisata/${item.slug}`} aria-hidden="true" tabindex="-1"><img src={imageUrl(item.image, 720)} srcset={imageSrcset(item.image, [480, 720, 960])} sizes="(max-width: 760px) 92vw, 44vw" alt="" loading="lazy" decoding="async" width="720" height="520" /></a><div class="tour-listing-body"><div class="tour-meta"><span>{item.category}</span><span>{item.duration}</span></div><h3><a href={`/${data.locale}/paket-wisata/${item.slug}`}>{item.name}</a></h3><p>{item.route}</p><strong>{item.price} <small>{item.unit}</small></strong><a class="button dark" href={`/${data.locale}/paket-wisata/${item.slug}`}>{c.viewDetail}</a></div></article>{/each}</div></section>{:else}<aside class="catalog-help destination-related" data-whatsapp-float-avoid><h2>{c.customItinerary}</h2><a class="button primary" href={createWhatsAppUrl(customMessage, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.consult}</a></aside>{/if}
  </main>
  <SiteFooter settings={data.catalog.settings} locale={data.locale} />
  <WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
</div>
