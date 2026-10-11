<script>
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import { getCopy, languages, localePath } from '#lib/i18n.js';
  import LanguageSelector from '#lib/LanguageSelector.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  export let data;
  const c = getCopy(data.locale);
  const item = data.item;
  const gallery = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
  let selectedImage = gallery[0];
  const home = localePath(data.locale);
  const message = data.locale !== 'id' ? `Hello Wonderful Lombok, I would like to book ${item.name}.` : `Halo Wonderful Lombok, saya ingin memesan ${item.name}.`;
</script>

<svelte:head>
  <title>{item.name} | Wonderful Lombok</title><meta name="description" content={item.detail} />
  <link rel="canonical" href={data.canonicalUrl} />{#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}<link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="product" /><meta property="og:title" content={item.name} /><meta property="og:description" content={item.detail} /><meta property="og:url" content={data.canonicalUrl} /><meta property="og:image" content={data.socialImageUrl} />
</svelte:head>

<header class="inner-header"><a class="brand brand-logo" href={home}><img src="/wonderful-lombok-logo.png" alt="Wonderful Lombok" /></a><nav><a href={localePath(data.locale, '/paket-wisata')}>{c.tours}</a><LanguageSelector locale={data.locale} suffix={`/paket-wisata/${item.slug}`} /></nav></header>
<main class="tour-detail-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{data.locale !== 'id' ? 'Home' : 'Beranda'}</a><span>/</span><a href={`/${data.locale}/paket-wisata`}>{c.tours}</a></nav>
  <section class="tour-hero">
    <div class="tour-gallery"><div class="tour-main-image"><img src={selectedImage} alt={item.name} /></div>{#if gallery.length > 1}<div class="tour-thumbnails">{#each gallery as image, index}<button class:active={selectedImage === image} on:click={() => selectedImage = image} aria-label={`${data.locale !== 'id' ? 'View image' : 'Lihat gambar'} ${index + 1}`}><img src={image} alt="" /></button>{/each}</div>{/if}</div>
    <div class="tour-summary"><div class="tour-meta"><span>{item.category}</span><span>{item.duration}</span></div><h1>{item.name}</h1><p>{item.detail}</p><div class="tour-route"><span>{c.highlights}</span><strong>{item.route}</strong></div><div class="tour-price"><span>{c.from}</span><b>{item.price}</b><small>{item.unit}</small></div><a class="button primary" href={createWhatsAppUrl(message, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.bookWhatsapp}</a></div>
  </section>
  <div class="tour-content">
    <section><p class="label">{c.itinerary}</p><h2>{data.locale !== 'id' ? 'Your journey, day by day' : 'Rangkaian perjalananmu'}</h2><div class="itinerary-list">{#each item.itinerary as day}<article><span>{day.day}</span><div><h3>{day.title}</h3><ul>{#each day.items as point}<li>{point}</li>{/each}</ul></div></article>{/each}</div></section>
    <aside class="tour-inclusions"><div><h2>{c.includes}</h2><ul>{#each item.includes as line}<li>{line}</li>{/each}</ul></div><div><h2>{c.excludes}</h2><ul>{#each item.excludes as line}<li>{line}</li>{/each}</ul></div></aside>
  </div>
  {#if item.priceTiers?.length}<section class="price-section"><p class="label">{c.prices}</p><h2>{data.locale !== 'id' ? 'Price by group size' : 'Harga berdasarkan jumlah tamu'}</h2><div class="price-table" role="table">{#each item.priceTiers as tier}<div class="price-row" role="row"><strong>{tier.guests}</strong><b>{tier.price}</b><span>{tier.note}</span></div>{/each}</div></section>{/if}
  <section class="detail-cta"><div><p class="label">Wonderful Lombok</p><h2>{data.locale !== 'id' ? 'Ready to explore Lombok?' : 'Siap menjelajahi Lombok?'}</h2></div><a class="button primary" href={createWhatsAppUrl(message, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.bookWhatsapp}</a></section>
</main>
<WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
