<script>
  import PhotoGallery from '#lib/PhotoGallery.svelte';
  import BookingDialog from '#lib/BookingDialog.svelte';
  import UiIcon from '#lib/UiIcon.svelte';
  import { packageBooking } from '#lib/booking-context.js';
  import { getCopy, getFormCopy, languages, localePath, sentenceCase } from '#lib/i18n.js';
  import { getSeoCopy, jsonLdScript, plainDescription, tourSchema } from '#lib/seo.js';
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  import SkipLink from '#lib/SkipLink.svelte';
  export let data;
  $: c = getCopy(data.locale);
  $: formCopy = getFormCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: item = data.item;
  $: photos = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
  $: gallery = photos.length ? photos : ['/wonderful-lombok-icon-192.png'];
  $: category = sentenceCase(item.category);
  let booking = null;
  $: home = localePath(data.locale);
  $: plainDetail = plainDescription(item.detail);
  $: origin = new URL(data.canonicalUrl).origin;
  $: homeUrl = `${origin}${localePath(data.locale)}`;
  $: toursUrl = `${origin}${localePath(data.locale, '/paket-wisata')}`;
  $: imageUrls = gallery.map((image) => new URL(image, origin).href);
  $: structuredData = tourSchema({ item, canonicalUrl: data.canonicalUrl, imageUrls, description: plainDetail, homeUrl, homeLabel: c.home, toursUrl, toursLabel: seo.toursBreadcrumb });
  function isContactTier(tier) {
    return !/\d/.test(String(tier.price || ''));
  }
  function tierHref(tier) {
    const message = (c.whatsappTier || c.whatsappMessage || c.bookWhatsapp)
      .replace('{name}', item.name)
      .replace('{guests}', tier.guests);
    return createWhatsAppUrl(message, data.catalog.settings.whatsapp);
  }
  function pointsFor(day) {
    const title = String(day.title || '').trim().toLowerCase();
    return (day.items || []).filter((point) => String(point).trim().toLowerCase() !== title).slice(0, 2);
  }
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
<SkipLink locale={data.locale} />
<SiteHeader locale={data.locale} suffix={`/paket-wisata/${item.slug}`} packages={data.catalog.packages} destinations={data.catalog.destinations} />
<main id="main-content" tabindex="-1" class="tour-detail-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><a href={`/${data.locale}/paket-wisata`}>{c.tours}</a></nav>
  <section class="tour-hero">
    <PhotoGallery images={photos} name={item.name} locale={data.locale} />
    <div class="tour-summary">
      <div class="tour-meta"><span>{category}</span><span>{item.duration}</span></div>
      <h1>{item.name}</h1>
      <div class="rich-content">{@html item.detail}</div>
      <div class="tour-route"><span>{c.highlights}</span><strong>{item.route}</strong></div>
      <div class="tour-price"><span>{c.from}</span><b>{item.price}</b><small>{item.unit}</small></div>
    </div>
  </section>
  <div class="tour-content">
    <section class="itinerary-section" aria-labelledby="itinerary-title">
      <p class="label">{c.itinerary}</p>
      <h2 id="itinerary-title">{c.itineraryHeading}</h2>
      <ol class="timeline">
        {#each item.itinerary as day}
          <li>
            <span class="timeline-time">{day.day}</span>
            <div class="timeline-body">
              <h3>{day.title}</h3>
              <ul>{#each pointsFor(day) as point}<li>{point}</li>{/each}</ul>
            </div>
          </li>
        {/each}
      </ol>
    </section>
    <aside class="tour-inclusions">
      <section class="inclusion-card included" aria-labelledby="included-title">
        <h2 id="included-title">{c.includes}</h2>
        <ul>{#each item.includes as line}<li><UiIcon name="check" /><span>{line}</span></li>{/each}</ul>
      </section>
      <section class="inclusion-card excluded" aria-labelledby="excluded-title">
        <h2 id="excluded-title">{c.excludes}</h2>
        <ul>{#each item.excludes as line}<li><UiIcon name="minus" /><span>{line}</span></li>{/each}</ul>
      </section>
    </aside>
  </div>
  {#if item.priceTiers?.length}
    <section class="price-section" aria-labelledby="price-title">
      <p class="label">{c.prices}</p>
      <h2 id="price-title">{c.priceHeading}</h2>
      <div class="price-table" role="table" aria-label={c.priceHeading}>
        {#each item.priceTiers as tier}
          <div class:contact={isContactTier(tier)} class="price-row" role="row">
            <span role="cell"><strong>{tier.guests}</strong></span>
            <b role="cell">{tier.price}{#if isContactTier(tier)}<UiIcon name="whatsapp" />{/if}</b>
            <span role="cell" class="price-note">{tier.note}{#if isContactTier(tier)}<a class="price-row-link" href={tierHref(tier)} target="_blank" rel="noreferrer" aria-label={`${c.bookWhatsapp}: ${item.name}, ${tier.guests}`}></a>{/if}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
  <section id="detail-cta" class="detail-cta-inline" aria-labelledby="detail-cta-title">
    <div>
      <p class="label">Wonderful Lombok</p>
      <h2 id="detail-cta-title">{c.readyTitle}</h2>
    </div>
    <button class="button primary" type="button" on:click={() => booking = packageBooking(item)} aria-label={`${c.bookWhatsapp}: ${item.name}`}><UiIcon name="whatsapp" />{c.bookWhatsapp}</button>
  </section>
</main>
<SiteFooter settings={data.catalog.settings} locale={data.locale} current="tours" />
<BookingDialog bind:booking whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
</div>
