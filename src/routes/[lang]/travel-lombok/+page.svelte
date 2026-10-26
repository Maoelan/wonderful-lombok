<script>
  import LazyPickupCalculator from '#lib/LazyPickupCalculator.svelte';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  import { getCopy, languages, localePath } from '#lib/i18n.js';
  import { getSeoCopy, getTravelSeo, jsonLdScript, travelServiceSchema } from '#lib/seo.js';

  export let data;
  $: c = getCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: travel = getTravelSeo(data.locale);
  $: home = localePath(data.locale);
  $: homeUrl = `${new URL(data.canonicalUrl).origin}${home}`;
  $: structuredData = travelServiceSchema({ canonicalUrl: data.canonicalUrl, homeUrl, homeLabel: c.home, serviceLabel: travel.label, description: travel.description, imageUrl: data.socialImageUrl });
</script>

<svelte:head>
  <title>{travel.title}</title>
  <meta name="description" content={travel.description} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  {#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="website" /><meta property="og:locale" content={seo.og} /><meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content={travel.title} /><meta property="og:description" content={travel.description} /><meta property="og:url" content={data.canonicalUrl} /><meta property="og:image" content={data.socialImageUrl} /><meta property="og:image:alt" content={seo.imageAlt} />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={travel.title} /><meta name="twitter:description" content={travel.description} /><meta name="twitter:image" content={data.socialImageUrl} />
  {@html jsonLdScript(structuredData)}
</svelte:head>

<div class="site-theme" class:theme-ocean={data.catalog.settings.colorTheme === 'ocean'}>
  <SiteHeader locale={data.locale} suffix="/travel-lombok" />
  <main class="catalog-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><span>{travel.label}</span></nav>
    <section class="catalog-intro" aria-labelledby="travel-page-title"><p class="label">{travel.label}</p><h1 id="travel-page-title">{travel.heading}</h1>{#each travel.intro as paragraph}<p>{paragraph}</p>{/each}</section>
    <div class="tour-content service-information">
      <section><p class="label">Lombok</p><h2>{travel.coverageTitle}</h2><ul class="service-list">{#each travel.coverage as point}<li>{point}</li>{/each}</ul></section>
      <aside class="tour-inclusions"><div><h2>{travel.bookingTitle}</h2><p>{travel.bookingText}</p><a class="text-link" href={localePath(data.locale, '/paket-wisata')}>{travel.packagesLink}</a></div></aside>
    </div>
    <section class="pickup-block" id="hitung-travel" aria-labelledby="calculator-title"><div class="pickup-intro"><div><p class="label">{c.travelCalc}</p><h2 id="calculator-title">{c.travelCalcHeading}</h2></div><p>{c.travelCalcIntro}</p></div><div class="calculator-wrap" data-whatsapp-float-avoid><LazyPickupCalculator rate={data.catalog.travelRate} whatsapp={data.catalog.settings.whatsapp} locale={data.locale} googleMapsKey={data.googleMapsKey} mapProvider={data.mapProvider} mapboxToken={data.mapboxToken} /></div></section>
  </main>
  <SiteFooter settings={data.catalog.settings} locale={data.locale} />
  <WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale={data.locale} />
</div>
