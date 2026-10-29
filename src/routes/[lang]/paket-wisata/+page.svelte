<script>
  import TourCard from '#lib/TourCard.svelte';
  import BookingDialog from '#lib/BookingDialog.svelte';
  import FaqSection from '#lib/FaqSection.svelte';
  import { packageBooking } from '#lib/booking-context.js';
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import { getCopy, languages, localePath } from '#lib/i18n.js';
  import { breadcrumbSchema, getSeoCopy, jsonLdScript } from '#lib/seo.js';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  export let data;
  let booking = null;
  $: c = getCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: home = localePath(data.locale);
  $: homeUrl = `${new URL(data.canonicalUrl).origin}${localePath(data.locale)}`;
  $: catalogSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([{ name: c.home, url: homeUrl }, { name: seo.toursBreadcrumb, url: data.canonicalUrl }]),
      { '@type': 'ItemList', name: seo.catalogTitle, itemListElement: data.catalog.packages.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: `${new URL(data.canonicalUrl).origin}/${data.locale}/paket-wisata/${item.slug}` })) }
    ]
  };
  $: message = data.locale === 'id'
    ? 'Halo Wonderful Lombok, saya ingin itinerary khusus di Lombok.'
    : 'Hello Wonderful Lombok, I would like a custom itinerary in Lombok.';
</script>

<svelte:head>
  <title>{seo.catalogTitle}</title>
  <meta name="description" content={seo.catalogDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  {#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content={seo.og} />
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content={seo.catalogTitle} />
  <meta property="og:description" content={seo.catalogDescription} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:image:alt" content={seo.imageAlt} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.catalogTitle} />
  <meta name="twitter:description" content={seo.catalogDescription} />
  <meta name="twitter:image" content={data.socialImageUrl} />
  <meta name="twitter:image:alt" content={seo.imageAlt} />
  {@html jsonLdScript(catalogSchema)}
</svelte:head>

<div class="site-theme" class:theme-ocean={data.catalog.settings.colorTheme === 'ocean'}>
<SiteHeader locale={data.locale} suffix="/paket-wisata" packages={data.catalog.packages} destinations={data.catalog.destinations} />
  <main class="catalog-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><span>{c.tours}</span></nav>
  <section class="catalog-intro"><h1>{c.catalogTitle}</h1><p>{c.catalogIntro}</p></section>
  <section class="tour-catalog package-list" aria-label={c.catalogTitle}>
    {#each data.catalog.packages as item, index}
      <TourCard {item} locale={data.locale} onBook={() => booking = packageBooking(item)} />
    {/each}
  </section>
  <FaqSection faqs={data.catalog.faqs} locale={data.locale} />
  <aside class="catalog-help"><h2>{c.customItinerary}</h2><a class="button primary" href={createWhatsAppUrl(message, data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.consult}</a></aside>
</main>
<SiteFooter settings={data.catalog.settings} locale={data.locale} />
<BookingDialog bind:booking whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
</div>
